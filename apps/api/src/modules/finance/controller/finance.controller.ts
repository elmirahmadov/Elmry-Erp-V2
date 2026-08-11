import { Request, Response } from "express";
import { FinanceService } from "../service/finance.service";

const financeService = new FinanceService();

// GET /finance/payables?companyId=&branchId=
export const getPayables = async (req: Request, res: Response) => {
  const { companyId, branchId } = req.query as { companyId?: string; branchId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await financeService.getPayables({
    companyId: parsedCompanyId,
    branchId: branchId ? parseInt(branchId) : undefined,
  });

  if (result.status === "SUCCESS") {
    return res.json({
      items: result.items,
      agingSummary: result.agingSummary,
      totalPayable: result.totalPayable,
    });
  }

  return res.status(500).json({ error: result.error });
};

// GET /finance/expense-analysis?companyId=&branchId=&startDate=&endDate=
export const getExpenseAnalysis = async (req: Request, res: Response) => {
  const { companyId, branchId, startDate, endDate } = req.query as {
    companyId?: string;
    branchId?: string;
    startDate?: string;
    endDate?: string;
  };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await financeService.getExpenseAnalysis({
    companyId: parsedCompanyId,
    branchId: branchId ? parseInt(branchId) : undefined,
    startDate,
    endDate,
  });

  if (result.status === "SUCCESS") {
    return res.json({
      byCategory: result.byCategory,
      byMonth: result.byMonth,
      totalExpense: result.totalExpense,
    });
  }

  return res.status(500).json({ error: result.error });
};

// GET /finance/cashflow?companyId=&branchId=&startDate=&endDate=
export const getCashFlow = async (req: Request, res: Response) => {
  const { companyId, branchId, startDate, endDate } = req.query as {
    companyId?: string;
    branchId?: string;
    startDate?: string;
    endDate?: string;
  };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await financeService.getCashFlow({
    companyId: parsedCompanyId,
    branchId: branchId ? parseInt(branchId) : undefined,
    startDate,
    endDate,
  });

  if (result.status === "SUCCESS") {
    return res.json({
      daily: result.daily,
      tills: result.tills,
      totalCashIn: result.totalCashIn,
      totalCashOut: result.totalCashOut,
      netFlow: result.netFlow,
      totalBalance: result.totalBalance,
    });
  }

  return res.status(500).json({ error: result.error });
};

// GET /finance/profit-loss?companyId=&branchId=&startDate=&endDate=
export const getProfitLoss = async (req: Request, res: Response) => {
  const { companyId, branchId, startDate, endDate } = req.query as {
    companyId?: string;
    branchId?: string;
    startDate?: string;
    endDate?: string;
  };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await financeService.getProfitLoss({
    companyId: parsedCompanyId,
    branchId: branchId ? parseInt(branchId) : undefined,
    startDate,
    endDate,
  });

  if (result.status === "SUCCESS") {
    return res.json({
      summary: result.summary,
      monthly: result.monthly,
      topProducts: result.topProducts,
    });
  }

  return res.status(500).json({ error: result.error });
};

// GET /finance/supplier-balances?companyId=
export const getSupplierBalances = async (req: Request, res: Response) => {
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await financeService.getSupplierBalances({ companyId: parsedCompanyId });

  if (result.status === "SUCCESS") {
    return res.json({ suppliers: result.suppliers });
  }

  return res.status(500).json({ error: result.error });
};
