import { prisma } from "@elmry/database";


export class AuthRepository {
  // 1. Refresh Token islemleri
  async createRefreshToken(data: {
    token: string;
    userId: number;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async revokeRefreshToken(token: string) {
    // 2. Token bulunamadiginda hata vermemek i�in findUnique yerine update direkt kullan
    // veya error handling ekle
    try {
      return prisma.refreshToken.update({
        where: { token },
        data: { revoked: true },
      });
    } catch (error) {
      console.error("Refresh token revoke hatasi:", error);
      throw error;
    }
  }

  // 3. Company islemleri
  async findCompanyByName(name: string) {
    return prisma.company.findUnique({ where: { name } });
  }

  async findCompanyById(id: number) {
    return prisma.company.findUnique({ where: { id } });
  }

  async findBranchesByCompanyId(companyId: number) {
    return prisma.branch.findMany({
      where: { companyId },
      orderBy: { id: "asc" },
    });
  }

  async findBranchesByUserId(userId: number) {
    return prisma.branch.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  async createCompany(data: {
    name: string;
    ownerName: string;
    ownerSurname: string;
    birthDate: Date;
    phone: string;
  }) {
    return prisma.company.create({ data });
  }

  // 4. User islemleri
  async findUserById(id: string) {
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) {
        console.error("Ge�ersiz user ID:", id);
        return null;
      }

      return prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });
    } catch (error) {
      console.error("User findById hatasi:", error);
      return null;
    }
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    companyId: number;
    roleId: number;
  }) {
    return prisma.user.create({ data });
  }

  // 5. Opsiyonel: Cleanup - uygulama kapanirken prisma baglantisini kapat
  async disconnect() {
    await prisma.$disconnect();
  }
}
