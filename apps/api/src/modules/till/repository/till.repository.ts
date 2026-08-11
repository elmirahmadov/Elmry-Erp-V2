import { prisma } from "@elmry/database";

export class TillRepository {
  async create(data: {
    name: string;
    companyId: number;
    balance?: number;
    status?: string;
  }) {
    return await prisma.till.create({
      data: {
        name: data.name,
        companyId: data.companyId,
        balance: data.balance ?? 0,
        status: data.status ?? "active",
      },
    });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.till.findMany({
      where: { companyId },
      include: {
        branches: {
          include: {
            branch: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  async findAllByBranchAndCompany(branchId: number, companyId: number) {
    return await prisma.till.findMany({
      where: {
        companyId,
        branches: {
          some: { branchId },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  async findByIdAndBranch(id: number, branchId: number) {
    return await prisma.till.findFirst({
      where: {
        id,
        branches: {
          some: { branchId },
        },
      },
    });
  }

  async findById(id: number) {
    return await prisma.till.findUnique({ where: { id } });
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return await prisma.till.findFirst({
      where: {
        id,
        companyId,
      },
    });
  }

  async findByCompanyAndName(companyId: number, name: string) {
    return await prisma.till.findFirst({
      where: {
        companyId,
        name: { equals: name },
      },
    });
  }

  async update(
    id: number,
    companyId: number,
    data: {
      name?: string;
      balance?: number;
      status?: string;
    },
  ) {
    await prisma.till.updateMany({
      where: { id, companyId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.balance !== undefined ? { balance: data.balance } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });

    return await this.findByIdAndCompany(id, companyId);
  }

  async delete(id: number, companyId: number) {
    return await prisma.till.deleteMany({
      where: { id, companyId },
    });
  }

  async updateBalance(id: number, amount: number) {
    await prisma.till.update({
      where: { id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return await prisma.till.findUnique({
      where: { id },
    });
  }

  async createTransaction(data: {
    tillId: number;
    type: string;
    amount: number;
    description?: string;
    counterpartyType?: string;
    counterpartyId?: number;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
    carrierName?: string;
    orderNumber?: string;
  }) {
    return await prisma.tillTransaction.create({ data });
  }

  async findTransactionById(id: number) {
    return await prisma.tillTransaction.findUnique({ where: { id } });
  }

  async updateTransaction(
    id: number,
    tillId: number,
    data: {
      description?: string;
      counterpartyName?: string;
      referenceNumber?: string;
      category?: string;
      paymentMethod?: string;
      currency?: string;
      carrierName?: string;
      orderNumber?: string;
    },
  ) {
    await prisma.tillTransaction.updateMany({
      where: { id, tillId },
      data: {
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.counterpartyName !== undefined
          ? { counterpartyName: data.counterpartyName }
          : {}),
        ...(data.referenceNumber !== undefined
          ? { referenceNumber: data.referenceNumber }
          : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.paymentMethod !== undefined
          ? { paymentMethod: data.paymentMethod }
          : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.carrierName !== undefined
          ? { carrierName: data.carrierName }
          : {}),
        ...(data.orderNumber !== undefined
          ? { orderNumber: data.orderNumber }
          : {}),
      },
    });
    return await prisma.tillTransaction.findUnique({ where: { id } });
  }

  async deleteTransaction(id: number, tillId: number) {
    return await prisma.tillTransaction.deleteMany({
      where: { id, tillId },
    });
  }

  async findTransactionsByTill(
    tillId: number,
    filters?: {
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return await prisma.tillTransaction.findMany({
      where: {
        tillId,
        ...(filters?.startDate || filters?.endDate
          ? {
              createdAt: {
                ...(filters.startDate ? { gte: filters.startDate } : {}),
                ...(filters.endDate ? { lte: filters.endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async transferBetweenTills(data: {
    sourceTillId: number;
    targetTillId: number;
    amount: number;
    description?: string;
    sourceTillName: string;
    targetTillName: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const sourceTill = await tx.till.update({
        where: { id: data.sourceTillId },
        data: {
          balance: {
            decrement: data.amount,
          },
        },
      });

      const targetTill = await tx.till.update({
        where: { id: data.targetTillId },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      });

      const sourceTransaction = await tx.tillTransaction.create({
        data: {
          tillId: data.sourceTillId,
          type: "mexaric",
          amount: data.amount,
          description: data.description,
          counterpartyType: "till",
          counterpartyId: data.targetTillId,
          counterpartyName: data.targetTillName,
        },
      });

      const targetTransaction = await tx.tillTransaction.create({
        data: {
          tillId: data.targetTillId,
          type: "medaxil",
          amount: data.amount,
          description: data.description,
          counterpartyType: "till",
          counterpartyId: data.sourceTillId,
          counterpartyName: data.sourceTillName,
        },
      });

      return {
        sourceTill,
        targetTill,
        sourceTransaction,
        targetTransaction,
      };
    });
  }
}
