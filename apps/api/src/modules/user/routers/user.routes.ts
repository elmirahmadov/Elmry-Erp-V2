import { Router } from "express";
import {
  createUser,
  findAllUsersByCompany,
  findUserById,
  updateUser,
  assignPermissionToUser,
  removePermissionFromUser,
  getUserPermissions,
} from "../controller/user.controller";

const router = Router();

router.post("/create", createUser);
router.get("/company/:companyId", findAllUsersByCompany);
router.get("/:id", findUserById);
router.get("/:id/permissions", getUserPermissions);
router.put("/:id", updateUser);
router.post("/:id/permissions", assignPermissionToUser);
router.delete("/:id/permissions", removePermissionFromUser);

export default router;
