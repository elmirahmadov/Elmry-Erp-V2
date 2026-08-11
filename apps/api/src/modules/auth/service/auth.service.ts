import { appConfig } from "../../../core/config/app.config";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@elmry/database";
import { AuthRepository } from "../repository/auth.repository";
import { AuthStatus } from "../enums/auth.enums";

const authRepo = new AuthRepository();

export class AuthService {
  private async buildBootstrapPayload(user: {
    id: number;
    name: string | null;
    email: string;
    companyId: number;
    roleId: number;
  }) {
    const [company, branches] = await Promise.all([
      authRepo.findCompanyById(user.companyId),
      user.roleId === 1
        ? authRepo.findBranchesByCompanyId(user.companyId)
        : authRepo.findBranchesByUserId(user.id),
    ]);

    return {
      user,
      companyName: company?.name ?? null,
      branches,
    };
  }

  // 1. Async hale getirildi - bcrypt.compare senkron degil, async kullan
  async generateRefreshToken(userId: number) {
    const token = crypto.randomBytes(40).toString("hex");
    // 7 gun gecerli olsun
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { token, expiresAt };
  }

  async refreshToken(oldToken: string) {
    const found = await authRepo.findRefreshToken(oldToken);
    if (!found || found.revoked || found.expiresAt < new Date()) {
      return {
        status: AuthStatus.UNAUTHORIZED,
        error: "Refresh token gecersiz veya suresi dolmus",
      };
    }
    // Eski refresh token'i revoke et
    await authRepo.revokeRefreshToken(oldToken);
    // Yeni access ve refresh token uret
    const user = await authRepo.findUserById(found.userId.toString());
    if (!user) {
      return { status: AuthStatus.UNAUTHORIZED, error: "Kullanici bulunamadi" };
    }
    const roleName = user.roleId === 1 ? "admin" : "user";
    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: roleName },
      appConfig.jwt.secret,
      { expiresIn: "24h" },
    );
    const { token: newRefreshToken, expiresAt } =
      await this.generateRefreshToken(user.id);
    await authRepo.createRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });
    return {
      status: AuthStatus.SUCCESS,
      token,
      refreshToken: newRefreshToken,
      user,
    };
  }

  async login(data: { companyName: string; email: string; password: string }) {
    try {
      const company = await authRepo.findCompanyByName(data.companyName);
      if (!company)
        return { status: AuthStatus.UNAUTHORIZED, error: "Sirket bulunamadi" };

      const user = await authRepo.findUserByEmail(data.email);
      if (!user || user.companyId !== company.id) {
        return {
          status: AuthStatus.UNAUTHORIZED,
          error: "Ge\u00e7\u0259rsiz giri\u015f",
        };
      }

      // 2. bcrypt.compare async fonksiyon - await ekle
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          status: AuthStatus.UNAUTHORIZED,
          error: "Ge\u00e7\u0259rsiz giri\u015f",
        };
      }

      const roleName = user.roleId === 1 ? "admin" : "user";
      const token = jwt.sign(
        { userId: user.id, companyId: company.id, role: roleName },
        appConfig.jwt.secret,
        { expiresIn: "24h" },
      );
      const { token: refreshToken, expiresAt } =
        await this.generateRefreshToken(user.id);
      await authRepo.createRefreshToken({
        token: refreshToken,
        userId: user.id,
        expiresAt,
      });
      return {
        status: AuthStatus.SUCCESS,
        token,
        refreshToken,
        user,
      };
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof Prisma.PrismaClientInitializationError) {
        return {
          status: AuthStatus.FAILED,
          error:
            "Veritabanina baglanilamiyor. MySQL servisinin calistigini kontrol edin.",
        };
      }

      if (error instanceof Error) {
        return { status: AuthStatus.FAILED, error: error.message };
      }

      return {
        status: AuthStatus.FAILED,
        error: "Giris sirasinda beklenmeyen bir hata olustu",
      };
    }
  }

  async getUserById(userId: string) {
    return await authRepo.findUserById(userId);
  }

  async getBootstrapByUserId(userId: string) {
    const user = await authRepo.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return this.buildBootstrapPayload(user);
  }
}
