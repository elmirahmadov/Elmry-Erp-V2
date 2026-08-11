import { Router } from "express";
import {
  setupCompany,
  findAllCompanies,
  findCompanyById,
  updateCompany,
  getCompanyWithBranches,
} from "../controller/company.controller";

const router = Router();

router.post("/setup", setupCompany);
router.get("/", findAllCompanies);
router.get("/:id", findCompanyById);
router.put("/:id", updateCompany);
router.get("/:id/branches", getCompanyWithBranches);

export default router;
