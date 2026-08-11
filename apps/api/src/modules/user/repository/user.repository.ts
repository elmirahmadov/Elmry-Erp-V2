import { prisma } from "@elmry/database";

export class UserRepository {
  async create(data: {
    name: string;
    email: string;
    password: string;
    companyId: number;
    roleId: number;
  }) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        companyId: Number(data.companyId),
        roleId: Number(data.roleId),
      },
    });
  }

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        branches: {
          include: {
            branch: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        branches: {
          include: {
            branch: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  async assignPermission(userId: number, permissionId: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { permissions: { connect: { id: permissionId } } },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      companyId?: number;
      roleId?: number;
    },
  ) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async removePermission(userId: number, permissionId: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { permissions: { disconnect: { id: permissionId } } },
    });
  }
}
