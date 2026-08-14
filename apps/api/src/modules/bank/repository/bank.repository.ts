import { prisma } from "@elmry/database";

export class BankRepository {
  async create(data: {
    name: string;
    companyId: number;
    accountNumber?: string;
    iban?: string;
    balance?: number;
    status?: string;
  }) {
    return await prisma.bank.create({
      data: {
        name: data.name,
        companyId: data.companyId,
        accountNumber: data.accountNumber,
        iban: data.iban,
        balance: data.balance ?? 0,
        status: data.status ?? "active",
      },
    });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.bank.findMany({
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
    return await prisma.bank.findMany({
      where: {
        companyId,
        branches: {
          some: { branchId },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return await prisma.bank.findFirst({
      where: { id, companyId },
    });
  }

  async findByCompanyAndName(companyId: number, name: string) {
    return await prisma.bank.findFirst({
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
      accountNumber?: string | null;
      iban?: string | null;
      balance?: number;
      status?: string;
    },
  ) {
    await prisma.bank.updateMany({
      where: { id, companyId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.accountNumber !== undefined
          ? { accountNumber: data.accountNumber }
          : {}),
        ...(data.iban !== undefined ? { iban: data.iban } : {}),
        ...(data.balance !== undefined ? { balance: data.balance } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });

    return await this.findByIdAndCompany(id, companyId);
  }

  async delete(id: number, companyId: number) {
    return await prisma.bank.deleteMany({
      where: { id, companyId },
    });
  }

  async updateBalance(id: number, amount: number) {
    await prisma.bank.update({
      where: { id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return await prisma.bank.findUnique({
      where: { id },
    });
  }

  async createTransaction(data: {
    bankId: number;
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
  }) {
    return await prisma.bankTransaction.create({ data });
  }

  async findTransactionById(id: number) {
    return await prisma.bankTransaction.findUnique({ where: { id } });
  }

  async updateTransaction(
    id: number,
    bankId: number,
    data: {
      description?: string;
      counterpartyName?: string;
      referenceNumber?: string;
      category?: string;
      paymentMethod?: string;
      currency?: string;
    },
  ) {
    await prisma.bankTransaction.updateMany({
      where: { id, bankId },
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
      },
    });
    return await prisma.bankTransaction.findUnique({ where: { id } });
  }

  async deleteTransaction(id: number, bankId: number) {
    return await prisma.bankTransaction.deleteMany({
      where: { id, bankId },
    });
  }

  async findTransactionsByBank(
    bankId: number,
    filters?: {
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return await prisma.bankTransaction.findMany({
      where: {
        bankId,
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

  async transferBetweenBanks(data: {
    sourceBankId: number;
    targetBankId: number;
    amount: number;
    description?: string;
    sourceBankName: string;
    targetBankName: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const sourceBank = await tx.bank.update({
        where: { id: data.sourceBankId },
        data: {
          balance: {
            decrement: data.amount,
          },
        },
      });

      const targetBank = await tx.bank.update({
        where: { id: data.targetBankId },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      });

      const sourceTransaction = await tx.bankTransaction.create({
        data: {
          bankId: data.sourceBankId,
          type: "mexaric",
          amount: data.amount,
          description: data.description,
          counterpartyType: "bank",
          counterpartyId: data.targetBankId,
          counterpartyName: data.targetBankName,
        },
      });

      const targetTransaction = await tx.bankTransaction.create({
        data: {
          bankId: data.targetBankId,
          type: "medaxil",
          amount: data.amount,
          description: data.description,
          counterpartyType: "bank",
          counterpartyId: data.sourceBankId,
          counterpartyName: data.sourceBankName,
        },
      });

      return {
        sourceBank,
        targetBank,
        sourceTransaction,
        targetTransaction,
      };
    });
  }
}
