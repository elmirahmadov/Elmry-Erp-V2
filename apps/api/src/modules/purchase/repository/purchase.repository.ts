import { prisma } from "@elmry/database";

const CONFIRMED_STATUSES = new Set(["Tesdiqli", "Təsdiqli", "Tamamlandı"]);

export function isConfirmedStatus(status?: string | null) {
  return CONFIRMED_STATUSES.has((status || "").trim());
}

export class PurchaseRepository {
  private stockFactorByType(type: string) {
    return type === "iade" ? -1 : 1;
  }

  private purchaseFactorByType(type: string) {
    return type === "iade" ? -1 : 1;
  }

  async getNextSerialNo(companyId: number, type: string) {
    const prefix = type === "iade" ? "IAD" : "ALS";

    const latestVoucher = await prisma.purchaseVoucher.findFirst({
      where: {
        companyId,
        serialNo: {
          startsWith: `${prefix}-`,
        },
      },
      select: {
        serialNo: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const currentNumber = Number(
      latestVoucher?.serialNo.split("-").at(-1) ?? "0",
    );
    const nextNumber = Number.isFinite(currentNumber) ? currentNumber + 1 : 1;

    return `${prefix}-${nextNumber.toString().padStart(5, "0")}`;
  }

  private async applyWarehouseStock(
    tx: any,
    warehouseId: number,
    type: string,
    lines: Array<{ productId: number; quantity: number }>,
    direction: 1 | -1,
  ) {
    for (const line of lines) {
      const delta =
        this.stockFactorByType(type) * direction * Number(line.quantity);

      const existing = await tx.warehouseStock.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId: line.productId,
          },
        },
      });

      const currentQty = existing?.quantity ?? 0;
      const nextQty = currentQty + delta;

      if (nextQty < 0) {
        throw new Error(
          `Depo stogu yetersiz (warehouseId: ${warehouseId}, productId: ${line.productId})`,
        );
      }

      await tx.warehouseStock.upsert({
        where: {
          warehouseId_productId: {
            warehouseId,
            productId: line.productId,
          },
        },
        update: {
          quantity: {
            increment: delta,
          },
        },
        create: {
          warehouseId,
          productId: line.productId,
          quantity: nextQty,
        },
      });
    }
  }

  private async applySupplierPurchase(
    tx: any,
    companyId: number,
    supplierId: number,
    type: string,
    totalAmount: number,
    direction: 1 | -1,
  ) {
    const purchaseDelta =
      this.purchaseFactorByType(type) * Number(totalAmount) * direction;
    if (purchaseDelta === 0) return;

    await tx.supplier.updateMany({
      where: { id: supplierId, companyId },
      data: {
        totalPurchase: {
          increment: purchaseDelta,
        },
      },
    });
  }

  async findAllByCompany(companyId: number) {
    return prisma.purchaseVoucher.findMany({
      where: { companyId },
      include: { lines: true },
      orderBy: { id: "desc" },
    });
  }

  async findPaginatedByCompany(
    companyId: number,
    page: number,
    limit: number,
    search?: string,
    type?: string,
  ) {
    const normalizedSearch = search?.trim();
    const normalizedType =
      type === "alis" || type === "iade" ? type : undefined;
    const where = {
      companyId,
      ...(normalizedType ? { type: normalizedType } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              { serialNo: { contains: normalizedSearch } },
              { branchName: { contains: normalizedSearch } },
              { warehouseName: { contains: normalizedSearch } },
              { supplier: { name: { contains: normalizedSearch } } },
            ],
          }
        : {}),
    };

    const [total, vouchers] = await Promise.all([
      prisma.purchaseVoucher.count({ where }),
      prisma.purchaseVoucher.findMany({
        where,
        include: {
          lines: true,
          supplier: { select: { name: true } },
        },
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: vouchers,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return prisma.purchaseVoucher.findFirst({
      where: { id, companyId },
      include: { lines: true, supplier: { select: { name: true } } },
    });
  }

  async findWarehouseByBranchAndName(
    companyId: number,
    branchName: string,
    warehouseName: string,
  ) {
    return prisma.warehouse.findFirst({
      where: {
        companyId,
        name: {
          equals: warehouseName,
        },
        branches: {
          some: {
            branch: {
              name: {
                equals: branchName,
              },
            },
          },
        },
      },
      include: {
        branches: {
          include: {
            branch: true,
          },
        },
      },
    });
  }

  async create(
    data: {
      serialNo: string;
      type: string;
      branchName: string;
      warehouseName: string;
      supplierId: number;
      companyId: number;
      voucherDate: Date;
      note?: string | null;
      status: string;
      totalAmount: number;
      lines: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
      }>;
    },
    warehouseId: number,
  ) {
    let serialNo = data.serialNo;
    const applyEffects = isConfirmedStatus(data.status);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await prisma.$transaction(async (tx: any) => {
          const voucher = await tx.purchaseVoucher.create({
            data: {
              serialNo,
              type: data.type,
              branchName: data.branchName,
              warehouseName: data.warehouseName,
              supplierId: data.supplierId,
              companyId: data.companyId,
              voucherDate: data.voucherDate,
              note: data.note ?? null,
              status: data.status,
              totalAmount: data.totalAmount,
              lines: {
                create: data.lines.map((line) => ({
                  productId: line.productId,
                  quantity: line.quantity,
                  unitPrice: line.unitPrice,
                  lineTotal: line.lineTotal,
                })),
              },
            },
            include: { lines: true },
          });

          if (applyEffects) {
            await this.applySupplierPurchase(
              tx,
              data.companyId,
              data.supplierId,
              data.type,
              data.totalAmount,
              1,
            );
            await this.applyWarehouseStock(
              tx,
              warehouseId,
              data.type,
              data.lines,
              1,
            );
          }

          return voucher;
        });
      } catch (error) {
        const prismaError = error as { code?: string };
        if (prismaError.code !== "P2002") {
          throw error;
        }

        serialNo = await this.getNextSerialNo(data.companyId, data.type);
      }
    }

    throw new Error("Benzersiz sened no olusturulamadi");
  }

  async update(
    id: number,
    companyId: number,
    data: {
      serialNo: string;
      type: string;
      branchName: string;
      warehouseName: string;
      supplierId: number;
      voucherDate: Date;
      note?: string | null;
      status: string;
      totalAmount: number;
      lines: Array<{
        productId: number;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
      }>;
    },
    previous: {
      warehouseId: number;
      type: string;
      supplierId: number;
      totalAmount: number;
      status: string;
      lines: Array<{ productId: number; quantity: number }>;
    },
    nextWarehouseId: number,
  ) {
    const prevConfirmed = isConfirmedStatus(previous.status);
    const nextConfirmed = isConfirmedStatus(data.status);

    return prisma.$transaction(async (tx: any) => {
      if (prevConfirmed) {
        await this.applyWarehouseStock(
          tx,
          previous.warehouseId,
          previous.type,
          previous.lines,
          -1,
        );
        await this.applySupplierPurchase(
          tx,
          companyId,
          previous.supplierId,
          previous.type,
          previous.totalAmount,
          -1,
        );
      }

      await tx.purchaseVoucherLine.deleteMany({ where: { voucherId: id } });

      const voucher = await tx.purchaseVoucher.update({
        where: { id },
        data: {
          serialNo: data.serialNo,
          type: data.type,
          branchName: data.branchName,
          warehouseName: data.warehouseName,
          supplierId: data.supplierId,
          voucherDate: data.voucherDate,
          note: data.note ?? null,
          status: data.status,
          totalAmount: data.totalAmount,
          lines: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              lineTotal: line.lineTotal,
            })),
          },
        },
        include: { lines: true },
      });

      if (nextConfirmed) {
        await this.applySupplierPurchase(
          tx,
          companyId,
          data.supplierId,
          data.type,
          data.totalAmount,
          1,
        );
        await this.applyWarehouseStock(
          tx,
          nextWarehouseId,
          data.type,
          data.lines,
          1,
        );
      }

      return voucher;
    });
  }

  async setConfirmation(
    id: number,
    companyId: number,
    confirm: boolean,
  ) {
    return prisma.$transaction(async (tx: any) => {
      const existing = await tx.purchaseVoucher.findFirst({
        where: { id, companyId },
        include: { lines: true },
      });

      if (!existing) {
        throw new Error("Sened bulunamadi");
      }

      const alreadyConfirmed = isConfirmedStatus(existing.status);

      if (confirm && alreadyConfirmed) {
        return existing;
      }
      if (!confirm && !alreadyConfirmed) {
        return existing;
      }

      if (confirm && (!existing.lines || existing.lines.length === 0)) {
        throw new Error("Tesdiq ucun senedde en az bir mehsul olmalidir");
      }

      const warehouse = await this.findWarehouseByBranchAndName(
        companyId,
        existing.branchName,
        existing.warehouseName,
      );
      if (!warehouse) {
        throw new Error("Senedin deposu bulunamadi");
      }

      const lines = existing.lines.map((l: any) => ({
        productId: l.productId,
        quantity: l.quantity,
      }));

      if (confirm) {
        await this.applyWarehouseStock(tx, warehouse.id, existing.type, lines, 1);
        await this.applySupplierPurchase(
          tx,
          companyId,
          existing.supplierId,
          existing.type,
          existing.totalAmount,
          1,
        );
        return tx.purchaseVoucher.update({
          where: { id },
          data: { status: "Tesdiqli" },
          include: { lines: true },
        });
      }

      await this.applyWarehouseStock(tx, warehouse.id, existing.type, lines, -1);
      await this.applySupplierPurchase(
        tx,
        companyId,
        existing.supplierId,
        existing.type,
        existing.totalAmount,
        -1,
      );
      return tx.purchaseVoucher.update({
        where: { id },
        data: { status: "Taslak" },
        include: { lines: true },
      });
    });
  }

  async delete(id: number, companyId: number) {
    return prisma.$transaction(async (tx: any) => {
      const existing = await tx.purchaseVoucher.findFirst({
        where: { id, companyId },
        include: { lines: true },
      });

      if (!existing) {
        throw new Error("Sened bulunamadi");
      }

      if (isConfirmedStatus(existing.status)) {
        throw new Error(
          "Tesdiqli sened siline bilmez. Evvelce tesdiqi legv edin",
        );
      }

      await tx.purchaseVoucherLine.deleteMany({ where: { voucherId: id } });
      await tx.purchaseVoucher.delete({ where: { id } });
    });
  }
}
