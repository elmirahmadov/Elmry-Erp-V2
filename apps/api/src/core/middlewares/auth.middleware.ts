import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appConfig } from "../config/app.config";
import { prisma } from "@elmry/database";


export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const authorize = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const hasPermission = await checkPermission(user, permission);
    if (!hasPermission) return res.status(403).json({ error: "Yetki yok" });
    next();
  };
};

async function checkPermission(user: any, permission: string) {
  const userWithPerms = await prisma.user.findUnique({
    where: { id: user.id },
    include: { permissions: true },
  });

  if (userWithPerms?.permissions.some((p) => p.name === "*")) {
    return true;
  }

  return userWithPerms?.permissions.some((p) => p.name === permission) || false;
}
