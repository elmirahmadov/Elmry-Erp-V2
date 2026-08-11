import { Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { AuthRequest } from "../../../core/middlewares/auth.middleware";

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  if (result.status === "SUCCESS") {
    res.json({
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } else {
    res
      .status(result.status === "UNAUTHORIZED" ? 401 : 500)
      .json({ error: result.error });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  if (result.status === "SUCCESS") {
    res.json({
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } else {
    res.status(401).json({ error: result.error });
  }
};

export const bootstrap = async (req: AuthRequest, res: Response) => {
  try {
    const data = await authService.getBootstrapByUserId(
      String(req.user.userId),
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "User not found" });
  }
};
