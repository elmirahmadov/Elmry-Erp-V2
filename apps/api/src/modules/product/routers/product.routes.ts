import { generateBarcode } from "../controller/product.controller";

import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  findAllProducts,
  searchProducts,
  updateProduct,
} from "../controller/product.controller";

const router = Router();

router.post("/", createProduct);
router.get("/search", searchProducts);
router.get("/", findAllProducts);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/generate-barcode", generateBarcode);

export default router;
