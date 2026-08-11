import { Router } from "express";
import { bootstrap, login, me, refresh } from "../controller/auth.controller";
import { authMiddleware } from "../../../core/middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.get("/bootstrap", authMiddleware, bootstrap);
router.get("/me", authMiddleware, me);
router.post("/refresh", refresh);

export default router;
