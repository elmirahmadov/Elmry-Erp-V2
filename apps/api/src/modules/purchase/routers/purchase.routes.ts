import { Router } from "express";
import {
  createPurchaseVoucher,
  getPurchaseModalData,
  findAllPurchaseVouchers,
  updatePurchaseVoucher,
  deletePurchaseVoucher,
  confirmPurchaseVoucher,
  unconfirmPurchaseVoucher,
} from "../controller/purchase.controller";

const router = Router();

router.get("/modal-data", getPurchaseModalData);
router.post("/", createPurchaseVoucher);
router.get("/", findAllPurchaseVouchers);
router.patch("/:id", updatePurchaseVoucher);
router.post("/:id/confirm", confirmPurchaseVoucher);
router.post("/:id/unconfirm", unconfirmPurchaseVoucher);
router.delete("/:id", deletePurchaseVoucher);

export default router;
