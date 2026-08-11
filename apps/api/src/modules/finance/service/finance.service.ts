import { FinanceRepository } from "../repository/finance.repository";

const repo = new FinanceRepository();

export class FinanceService {
  // ─── PAYABLES ────────────────────────────────────────────────────────
  async getPayables(params: { companyId: number; branchId?: number }) {
    try {
      const { companyId, branchId } = params;
      if (!companyId) return { status: "ERROR", error: "companyId zorunludur" };

      const vouchers = await repo.getPayables(companyId, branchId);
      const now = new Date();

      const items = vouchers.map((v) => {
        const due = new Date(v.voucherDate);
        const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        let agingBucket: string;
        if (diffDays <= 0) agingBucket = "Vaxtı gəlməyib";
        else if (diffDays <= 30) agingBucket = "0-30 gün";
        else if (diffDays <= 60) agingBucket = "31-60 gün";
        else if (diffDays <= 90) agingBucket = "61-90 gün";
        else agingBucket = "90+ gün";

        const paid = v.lines.reduce((s, l) => s + l.lineTotal, 0);
        const remaining = v.totalAmount - paid > 0 ? v.totalAmount - paid : v.totalAmount;

        return {
          id: v.id,
          serialNo: v.serialNo,
          supplierName: v.supplier?.name ?? "",
          supplierId: v.supplierId,
          voucherDate: v.voucherDate,
          dueInDays: -diffDays,
          overdueDays: diffDays > 0 ? diffDays : 0,
          agingBucket,
          totalAmount: v.totalAmount,
          remainingAmount: remaining,
          status: v.status,
          note: v.note,
        };
      });

      // Kateqoriya üzrə xülasə
      const agingSummary = {
        "Vaxtı gəlməyib": 0,
        "0-30 gün": 0,
        "31-60 gün": 0,
        "61-90 gün": 0,
        "90+ gün": 0,
      } as Record<string, number>;

      items.forEach((item) => {
        agingSummary[item.agingBucket] =
          (agingSummary[item.agingBucket] ?? 0) + item.remainingAmount;
      });

      const totalPayable = items.reduce((s, i) => s + i.remainingAmount, 0);

      return { status: "SUCCESS", items, agingSummary, totalPayable };
    } catch (err) {
      return { status: "ERROR", error: (err as Error).message };
    }
  }

  // ─── EXPENSE ANALYSIS ─────────────────────────────────────────────────
  async getExpenseAnalysis(params: {
    companyId: number;
    branchId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const { companyId, branchId, startDate, endDate } = params;
      if (!companyId) return { status: "ERROR", error: "companyId zorunludur" };

      const start = startDate ? new Date(startDate + "T00:00:00") : undefined;
      const end = endDate ? new Date(endDate + "T23:59:59") : undefined;

      const transactions = await repo.getExpenseAnalysis(companyId, branchId, start, end);

      // Kateqoriya üzrə qruplaşdır
      const byCategoryMap: Record<string, { category: string; total: number; count: number }> = {};
      const byMonthMap: Record<string, { month: string; mexaric: number; gider: number }> = {};

      transactions.forEach((tx) => {
        // Kateqoriya
        const cat = tx.category || "Digər";
        if (!byCategoryMap[cat]) byCategoryMap[cat] = { category: cat, total: 0, count: 0 };
        byCategoryMap[cat].total += tx.amount;
        byCategoryMap[cat].count += 1;

        // Ay üzrə
        const month = tx.createdAt.toISOString().slice(0, 7);
        if (!byMonthMap[month]) byMonthMap[month] = { month, mexaric: 0, gider: 0 };
        if (tx.type === "mexaric") byMonthMap[month].mexaric += tx.amount;
        else byMonthMap[month].gider += tx.amount;
      });

      const byCategory = Object.values(byCategoryMap).sort((a, b) => b.total - a.total);
      const byMonth = Object.values(byMonthMap).sort((a, b) => a.month.localeCompare(b.month));
      const totalExpense = transactions.reduce((s, t) => s + t.amount, 0);

      return { status: "SUCCESS", byCategory, byMonth, totalExpense, transactions };
    } catch (err) {
      return { status: "ERROR", error: (err as Error).message };
    }
  }

  // ─── CASHFLOW ────────────────────────────────────────────────────────
  async getCashFlow(params: {
    companyId: number;
    branchId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const { companyId, branchId, startDate, endDate } = params;
      if (!companyId) return { status: "ERROR", error: "companyId zorunludur" };

      const start = startDate ? new Date(startDate + "T00:00:00") : undefined;
      const end = endDate ? new Date(endDate + "T23:59:59") : undefined;

      const { tills, transactions } = await repo.getCashFlow(companyId, branchId, start, end);

      // Gündəlik qruplaşdırma
      const dailyMap: Record<string, { date: string; cashIn: number; cashOut: number; net: number }> = {};
      transactions.forEach((tx) => {
        const date = tx.createdAt.toISOString().slice(0, 10);
        if (!dailyMap[date]) dailyMap[date] = { date, cashIn: 0, cashOut: 0, net: 0 };
        if (tx.type === "medaxil") dailyMap[date].cashIn += tx.amount;
        else {
          dailyMap[date].cashOut += tx.amount;
        }
      });

      const daily = Object.values(dailyMap)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => ({ ...d, net: d.cashIn - d.cashOut }));

      const totalCashIn = daily.reduce((s, d) => s + d.cashIn, 0);
      const totalCashOut = daily.reduce((s, d) => s + d.cashOut, 0);
      const totalBalance = tills.reduce((s, t) => s + t.balance, 0);

      return { status: "SUCCESS", daily, tills, totalCashIn, totalCashOut, netFlow: totalCashIn - totalCashOut, totalBalance };
    } catch (err) {
      return { status: "ERROR", error: (err as Error).message };
    }
  }

  // ─── PROFIT & LOSS ────────────────────────────────────────────────────
  async getProfitLoss(params: {
    companyId: number;
    branchId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const { companyId, branchId, startDate, endDate } = params;
      if (!companyId) return { status: "ERROR", error: "companyId zorunludur" };

      const start = startDate ? new Date(startDate + "T00:00:00") : undefined;
      const end = endDate ? new Date(endDate + "T23:59:59") : undefined;

      const { tillTransactions, purchaseVouchers } = await repo.getProfitLoss(companyId, branchId, start, end);

      // Gəlir (Revenue) — medaxil əməliyyatları
      const revenue = tillTransactions
        .filter((t) => t.type === "medaxil")
        .reduce((s, t) => s + t.amount, 0);

      // Alış xərci (COGS) — tamamlanmış alış vaucherları
      const cogs = purchaseVouchers.reduce((s, v) => s + v.totalAmount, 0);

      // Əməliyyat xərcləri — mexaric + gider
      const operatingExpenses = tillTransactions
        .filter((t) => t.type !== "medaxil")
        .reduce((s, t) => s + t.amount, 0);

      const grossProfit = revenue - cogs;
      const netProfit = grossProfit - operatingExpenses;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      // Ay üzrə mənfəət trendi
      const monthlyMap: Record<string, { month: string; revenue: number; expenses: number; profit: number }> = {};
      tillTransactions.forEach((tx) => {
        const month = tx.createdAt.toISOString().slice(0, 7);
        if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, expenses: 0, profit: 0 };
        if (tx.type === "medaxil") monthlyMap[month].revenue += tx.amount;
        else monthlyMap[month].expenses += tx.amount;
      });
      const monthly = Object.values(monthlyMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((m) => ({ ...m, profit: m.revenue - m.expenses }));

      // Məhsul üzrə alış xərci breakdown
      const productBreakdown: Record<string, { name: string; quantity: number; cost: number; salePrice: number }> = {};
      purchaseVouchers.forEach((v) => {
        v.lines.forEach((l) => {
          const name = l.product.name;
          if (!productBreakdown[name]) {
            productBreakdown[name] = { name, quantity: 0, cost: 0, salePrice: l.product.salePrice };
          }
          productBreakdown[name].quantity += l.quantity;
          productBreakdown[name].cost += l.lineTotal;
        });
      });
      const topProducts = Object.values(productBreakdown).sort((a, b) => b.cost - a.cost).slice(0, 10);

      return {
        status: "SUCCESS",
        summary: { revenue, cogs, grossProfit, operatingExpenses, netProfit, grossMargin, netMargin },
        monthly,
        topProducts,
      };
    } catch (err) {
      return { status: "ERROR", error: (err as Error).message };
    }
  }

  // ─── SUPPLIER BALANCES ────────────────────────────────────────────────
  async getSupplierBalances(params: { companyId: number }) {
    try {
      const { companyId } = params;
      if (!companyId) return { status: "ERROR", error: "companyId zorunludur" };

      const suppliers = await repo.getSupplierBalances(companyId);
      const result = suppliers.map((s) => ({
        ...s,
        balance: s.totalPurchase - s.totalPayment,
      }));
      return { status: "SUCCESS", suppliers: result };
    } catch (err) {
      return { status: "ERROR", error: (err as Error).message };
    }
  }
}
