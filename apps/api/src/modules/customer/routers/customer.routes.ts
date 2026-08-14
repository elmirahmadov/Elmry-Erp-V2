import { Router } from "express";
import {
  addDebtToCustomer,
  addPaidSaleToCustomer,
  addPaymentToCustomer,
  createCustomer,
  deleteCustomer,
  findAllCustomers,
  recordCustomerPaymentTotals,
  updateCustomer,
} from "../controller/customer.controller";

const router = Router();

router.post("/", createCustomer);
router.get("/", findAllCustomers);
router.patch("/:id", updateCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.post("/:id/debt", addDebtToCustomer);
router.post("/:id/sale", addPaidSaleToCustomer);
router.post("/:id/payment", addPaymentToCustomer);
router.post("/:id/payment-totals", recordCustomerPaymentTotals);

export default router;
