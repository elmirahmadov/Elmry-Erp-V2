import { prisma } from "@elmry/database";


export class FinanceRepository {
  // --- PAYABLES (Borclar) -----------------------------------------------
  async getPayables(companyId: number, branchId?: number) {
    const vouchers = await prisma.purchaseVoucher.findMany({
      where: {
        companyId,
        status: { not: "Odendi" },
        ...(branchId ? { branchName: { not: undefined } } : {}),
      },
      include: {
        supplier: true,
        lines: { include: { product: true } },
      },
      orderBy: { voucherDate: "asc" },
    });
    return vouchers;
  }

  // --- EXPENSE ANALYSIS (X?rc Analizi) ---------------------------------
  async getExpenseAnalysis(
    companyId: number,
    branchId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const tills = await prisma.till.findMany({
      where: {
        companyId,
        ...(branchId
          ? {
              branches: {
                some: { branchId },
              },
            }
          : {}),
      },
      select: { id: true },
    });
    const tillIds = tills.map((t) => t.id);

    const transactions = await prisma.tillTransaction.findMany({
      where: {
        tillId: { in: tillIds },
        type: { in: ["mexaric", "gider"] },
        counterpartyType: { not: "till" },
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "asc" },
    });
    return transactions;
  }

  // --- CASHFLOW --------------------------------------------------------
  async getCashFlow(
    companyId: number,
    branchId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const tills = await prisma.till.findMany({
      where: {
        companyId,
        ...(branchId
          ? {
              branches: {
                some: { branchId },
              },
            }
          : {}),
      },
      select: { id: true, name: true, balance: true },
    });
    const tillIds = tills.map((t) => t.id);

    const transactions = await prisma.tillTransaction.findMany({
      where: {
        tillId: { in: tillIds },
        counterpartyType: { not: "till" },
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    return { tills, transactions };
  }

  // --- PROFIT & LOSS ----------------------------------------------------
  async getProfitLoss(
    companyId: number,
    branchId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const tills = await prisma.till.findMany({
      where: {
        companyId,
        ...(branchId
          ? {
              branches: {
                some: { branchId },
              },
            }
          : {}),
      },
      select: { id: true },
    });
    const tillIds = tills.map((t) => t.id);

    const [tillTransactions, purchaseVouchers] = await Promise.all([
      prisma.tillTransaction.findMany({
        where: {
          tillId: { in: tillIds },
          counterpartyType: { not: "till" },
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.purchaseVoucher.findMany({
        where: {
          companyId,
          status: { in: ["Tamamlandi", "Onaylandi"] },
          ...(startDate || endDate
            ? {
                voucherDate: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
        include: {
          lines: { include: { product: { select: { name: true, salePrice: true } } } },
          supplier: { select: { name: true } },
        },
      }),
    ]);

    return { tillTransactions, purchaseVouchers };
  }

  // --- SUPPLIER BALANCES ------------------------------------------------
  async getSupplierBalances(companyId: number) {
    return await prisma.supplier.findMany({
      where: { companyId, status: "active" },
      select: {
        id: true,
        name: true,
        totalPurchase: true,
        totalPayment: true,
        totalMedaxil: true,
        totalMexaric: true,
        phone: true,
        email: true,
      },
      orderBy: { totalPurchase: "desc" },
    });
  }
}
