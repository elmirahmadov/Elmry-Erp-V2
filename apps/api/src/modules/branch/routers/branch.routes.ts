import { Router } from "express";
import {
  createWarehouse,
  createBranch,
  findAllBranchesByCompany,
  findBranchById,
  findWarehousesByBranch,
  findWarehousesByCompany,
  setBranchWarehouses,
  setBranchTills,
  setBranchBanks,
  setBranchUsers,
} from "../controller/branch.controller";

const router = Router();

router.post("/create", createBranch);
router.get("/company/:companyId", findAllBranchesByCompany);
router.post("/warehouses", createWarehouse);
router.get("/warehouses", findWarehousesByCompany);
router.get("/:id", findBranchById);
router.put("/:branchId/warehouses", setBranchWarehouses);
router.put("/:branchId/tills", setBranchTills);
router.put("/:branchId/banks", setBranchBanks);
router.put("/:branchId/users", setBranchUsers);
router.get("/:branchId/warehouses", findWarehousesByBranch);

export default router;
