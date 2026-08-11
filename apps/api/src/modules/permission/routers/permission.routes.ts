import express from "express";
import {
  createPermission,
  getAllPermissions,
  getPermissionById,
} from "../controller/permission.controller";

const router = express.Router();

router.post("/", createPermission);
router.get("/", getAllPermissions);
router.get("/:id", getPermissionById);

export default router;
