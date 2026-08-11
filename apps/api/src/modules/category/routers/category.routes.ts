import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  findAllCategories,
  updateCategory,
  findChildCategories,
  findParentCategories,
} from "../controller/category.controller";

const router = Router();

router.post("/", createCategory);
router.get("/", findAllCategories);
router.get("/parents", findParentCategories);
router.get("/:id/children", findChildCategories);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
