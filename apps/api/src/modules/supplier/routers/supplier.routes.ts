import { Router } from "express";
import {
  createSupplier,
  deleteSupplier,
  findAllSuppliers,
  updateSupplier,
} from "../controller/supplier.controller";
import {
  addPurchaseToSupplier,
  addPaymentToSupplier,
} from "../controller/supplier.controller";

const router = Router();

router.post("/", createSupplier);
router.get("/", findAllSuppliers);
router.patch("/:id", updateSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);
router.post("/:id/purchase", addPurchaseToSupplier);
router.post("/:id/payment", addPaymentToSupplier);

export default router;
