import { Router } from "express";
import {
  getPayables,
  getExpenseAnalysis,
  getCashFlow,
  getProfitLoss,
  getSupplierBalances,
} from "../controller/finance.controller";

const router = Router();

// GET /finance/payables
router.get("/payables", getPayables);

// GET /finance/expense-analysis
router.get("/expense-analysis", getExpenseAnalysis);

// GET /finance/cashflow
router.get("/cashflow", getCashFlow);

// GET /finance/profit-loss
router.get("/profit-loss", getProfitLoss);

// GET /finance/supplier-balances
router.get("/supplier-balances", getSupplierBalances);

export default router;
