import { prisma } from "@elmry/database";


export class SupplierRepository {
  async findPurchaseTotalsByCompany(companyId: number) {
    const grouped = await prisma.purchaseVoucher.groupBy({
      by: ["supplierId", "type"],
      where: { companyId },
      _sum: {
        totalAmount: true,
      },
    });

    const totals = new Map<
      number,
      {
        totalPurchase: number;
        totalReturn: number;
      }
    >();

    for (const row of grouped) {
      const supplierId = Number(row.supplierId);
      const current = totals.get(supplierId) ?? {
        totalPurchase: 0,
        totalReturn: 0,
      };
      const amount = Number(row._sum.totalAmount ?? 0);

      if (row.type === "iade") {
        current.totalReturn += amount;
      } else {
        current.totalPurchase += amount;
      }

      totals.set(supplierId, current);
    }

    return totals;
  }

  async create(data: {
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    taxNumber?: string | null;
    status: string;
    companyId: number;
  }) {
    return await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        address: data.address ?? null,
        taxNumber: data.taxNumber ?? null,
        status: data.status,
        companyId: data.companyId,
      },
    });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.supplier.findMany({
      where: { companyId },
      orderBy: { id: "desc" },
    });
  }

  async findPurchaseModalDataByCompany(companyId: number) {
    return await prisma.supplier.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        status: true,
        totalPurchase: true,
      },
      orderBy: { id: "desc" },
    });
  }

  async findPurchaseModalPageByCompany(
    companyId: number,
    page: number,
    limit: number,
    search?: string,
    category?: string,
  ) {
    const normalizedSearch = search?.trim();
    const normalizedCategory = category?.trim();

    const where = {
      companyId,
      ...(normalizedSearch
        ? {
            name: {
              contains: normalizedSearch,
            },
          }
        : {}),
      ...(normalizedCategory === "Pasif"
        ? { status: "inactive" }
        : normalizedCategory === "Stratejik"
          ? { status: { not: "inactive" }, totalPurchase: { gt: 100000 } }
          : normalizedCategory === "Genel"
            ? { status: { not: "inactive" }, totalPurchase: { lte: 100000 } }
            : {}),
    };

    const [total, suppliers] = await Promise.all([
      prisma.supplier.count({ where }),
      prisma.supplier.findMany({
        where,
        select: {
          id: true,
          name: true,
          status: true,
          totalPurchase: true,
        },
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { total, suppliers };
  }

  async findPurchaseModalCategoryCounts(companyId: number) {
    const suppliers = await prisma.supplier.findMany({
      where: { companyId },
      select: {
        status: true,
        totalPurchase: true,
      },
    });

    let passiveCount = 0;
    let strategicCount = 0;
    let generalCount = 0;

    for (const supplier of suppliers) {
      if (supplier.status === "inactive") {
        passiveCount += 1;
      } else if (Number(supplier.totalPurchase ?? 0) > 100000) {
        strategicCount += 1;
      } else {
        generalCount += 1;
      }
    }

    return [
      { name: "Hamisi", count: suppliers.length },
      { name: "Genel", count: generalCount },
      { name: "Stratejik", count: strategicCount },
      { name: "Pasif", count: passiveCount },
    ];
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return await prisma.supplier.findFirst({
      where: { id, companyId },
    });
  }

  async update(
    id: number,
    companyId: number,
    data: {
      name?: string;
      contactPerson?: string | null;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
      taxNumber?: string | null;
      status?: string;
    },
  ) {
    await prisma.supplier.updateMany({
      where: { id, companyId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.contactPerson !== undefined
          ? { contactPerson: data.contactPerson }
          : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.taxNumber !== undefined ? { taxNumber: data.taxNumber } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });

    return await this.findByIdAndCompany(id, companyId);
  }

  async delete(id: number, companyId: number) {
    return await prisma.supplier.deleteMany({
      where: { id, companyId },
    });
  }

  async addPurchase(id: number, companyId: number, amount: number) {
    await prisma.supplier.updateMany({
      where: { id, companyId },
      data: { totalPurchase: { increment: amount } },
    });
    return await this.findByIdAndCompany(id, companyId);
  }

  async addPayment(id: number, companyId: number, amount: number) {
    await prisma.supplier.updateMany({
      where: { id, companyId },
      data: { totalPayment: { increment: amount } },
    });
    return await this.findByIdAndCompany(id, companyId);
  }

  async addMedaxil(id: number, companyId: number, amount: number) {
    await prisma.supplier.updateMany({
      where: { id, companyId },
      data: { totalMedaxil: { increment: amount } },
    });
    return await this.findByIdAndCompany(id, companyId);
  }

  async addMexaric(id: number, companyId: number, amount: number) {
    await prisma.supplier.updateMany({
      where: { id, companyId },
      data: { totalMexaric: { increment: amount } },
    });
    return await this.findByIdAndCompany(id, companyId);
  }
}
