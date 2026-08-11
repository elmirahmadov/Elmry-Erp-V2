import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const permissionMiddleware = (requiredPermission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userPermissions = req.user.permissions || [];

    if (userPermissions.some((p: any) => p.name === "*")) {
      return next();
    }

    if (!userPermissions.some((p: any) => p.name === requiredPermission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};
