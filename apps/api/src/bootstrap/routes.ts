import { Router } from "express";
import authRoutes from "../modules/auth/routers/auth.routes";
import companyRoutes from "../modules/company/routers/company.routes";
import userRoutes from "../modules/user/routers/user.routes";
import branchRoutes from "../modules/branch/routers/branch.routes";
import categoryRoutes from "../modules/category/routers/category.routes";
import productRoutes from "../modules/product/routers/product.routes";
import supplierRoutes from "../modules/supplier/routers/supplier.routes";
import purchaseRoutes from "../modules/purchase/routers/purchase.routes";
import tillRoutes from "../modules/till/routers/till.routes";
import financeRoutes from "../modules/finance/routers/finance.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/users", userRoutes);
router.use("/branches", branchRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/tills", tillRoutes);
router.use("/finance", financeRoutes);

export default router;
