import { Router } from "express";
import {
  createBank,
  deleteBank,
  findBanksByBranchAndCompany,
  getBankOverview,
  updateBank,
  createBankTransaction,
  transferBetweenBanks,
  getBankTransactions,
  updateBankTransaction,
  deleteBankTransaction,
} from "../controller/bank.controller";

const router = Router();

router.post("/", createBank);
router.get("/overview", getBankOverview);
router.get("/", findBanksByBranchAndCompany);
router.patch("/:id", updateBank);
router.delete("/:id", deleteBank);
router.post("/:bankId/transactions", createBankTransaction);
router.patch("/:bankId/transactions/:txId", updateBankTransaction);
router.delete("/:bankId/transactions/:txId", deleteBankTransaction);
router.post("/:bankId/transfer", transferBetweenBanks);
router.get("/:bankId/transactions", getBankTransactions);

export default router;
