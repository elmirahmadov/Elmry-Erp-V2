const BASE = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// ── TYPES ────────────────────────────────────────────────────────────

export interface PayableItem {
  id: number;
  supplierName: string;
  serialNo?: string;
  voucherDate: string;
  remainingAmount: number;
  overdueDays: number;
  agingBucket: string;
  status?: string;
}

export interface PayablesResponse {
  items: PayableItem[];
  agingSummary: Record<string, number>;
  totalPayable: number;
}

export interface ExpenseAnalysisResponse {
  byCategory: { category: string; total: number; count: number }[];
  byMonth: { month: string; mexaric: number; gider: number }[];
  totalExpense: number;
}

export interface CashFlowResponse {
  daily: { date: string; cashIn: number; cashOut: number; net: number }[];
  tills: { id: number; name: string; balance: number }[];
  totalCashIn: number;
  totalCashOut: number;
  netFlow: number;
  totalBalance: number;
}

export interface ProfitLossResponse {
  summary: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
  };
  monthly: { month: string; revenue: number; expenses: number; profit: number }[];
  topProducts: { name: string; quantity: number; cost: number; salePrice: number }[];
}

export interface SupplierBalancesResponse {
  suppliers: {
    id: number;
    name: string;
    balance: number;
    totalPurchase: number;
    totalPayment: number;
    phone?: string;
    email?: string;
  }[];
}

// ── PAYABLES ─────────────────────────────────────────────────────────

export async function fetchPayables(
  companyId: number,
  branchId?: number,
): Promise<PayablesResponse> {
  const params = new URLSearchParams({ companyId: String(companyId) });
  if (branchId) params.set("branchId", String(branchId));
  const res = await fetch(`${BASE}/finance/payables?${params}`, {
    credentials: "include",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── EXPENSE ANALYSIS ─────────────────────────────────────────────────

export async function fetchExpenseAnalysis(
  companyId: number,
  branchId?: number,
  startDate?: string,
  endDate?: string,
): Promise<ExpenseAnalysisResponse> {
  const params = new URLSearchParams({ companyId: String(companyId) });
  if (branchId) params.set("branchId", String(branchId));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await fetch(`${BASE}/finance/expense-analysis?${params}`, {
    credentials: "include",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── CASHFLOW ──────────────────────────────────────────────────────────

export async function fetchCashFlow(
  companyId: number,
  branchId?: number,
  startDate?: string,
  endDate?: string,
): Promise<CashFlowResponse> {
  const params = new URLSearchParams({ companyId: String(companyId) });
  if (branchId) params.set("branchId", String(branchId));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await fetch(`${BASE}/finance/cashflow?${params}`, {
    credentials: "include",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── PROFIT & LOSS ─────────────────────────────────────────────────────

export async function fetchProfitLoss(
  companyId: number,
  branchId?: number,
  startDate?: string,
  endDate?: string,
): Promise<ProfitLossResponse> {
  const params = new URLSearchParams({ companyId: String(companyId) });
  if (branchId) params.set("branchId", String(branchId));
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await fetch(`${BASE}/finance/profit-loss?${params}`, {
    credentials: "include",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── SUPPLIER BALANCES ────────────────────────────────────────────────

export async function fetchSupplierBalances(
  companyId: number,
): Promise<SupplierBalancesResponse> {
  const res = await fetch(
    `${BASE}/finance/supplier-balances?companyId=${companyId}`,
    {
      credentials: "include",
      headers: authHeaders(),
    },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
