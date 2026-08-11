import { Router } from "express";
import {
  createTill,
  deleteTill,
  findTillsByBranchAndCompany,
  getTillOverview,
  updateTill,
  createTillTransaction,
  transferBetweenTills,
  getTillTransactions,
  updateTillTransaction,
  deleteTillTransaction,
} from "../controller/till.controller";

const router = Router();

router.post("/", createTill);
router.get("/overview", getTillOverview);
router.get("/", findTillsByBranchAndCompany);
router.patch("/:id", updateTill);
router.delete("/:id", deleteTill);
router.post("/:tillId/transactions", createTillTransaction);
router.patch("/:tillId/transactions/:txId", updateTillTransaction);
router.delete("/:tillId/transactions/:txId", deleteTillTransaction);
router.post("/:tillId/transfer", transferBetweenTills);
router.get("/:tillId/transactions", getTillTransactions);

export default router;
