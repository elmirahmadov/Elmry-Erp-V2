import { prisma } from "@elmry/database";

const posSelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  companyId: true,
  posBranchId: true,
  posWarehouseId: true,
  posTillId: true,
  posBankId: true,
  createdAt: true,
  updatedAt: true,
  posBranch: { select: { id: true, name: true } },
  posWarehouse: { select: { id: true, name: true } },
  posTill: { select: { id: true, name: true } },
  posBank: { select: { id: true, name: true } },
  branches: {
    include: {
      branch: {
        select: { id: true, name: true },
      },
    },
  },
} as const;

export class UserRepository {
  async create(data: {
    name: string;
    email: string;
    password: string;
    companyId: number;
    roleId: number;
    posBranchId?: number | null;
    posWarehouseId?: number | null;
    posTillId?: number | null;
    posBankId?: number | null;
  }) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        companyId: Number(data.companyId),
        roleId: Number(data.roleId),
        posBranchId: data.posBranchId ?? null,
        posWarehouseId: data.posWarehouseId ?? null,
        posTillId: data.posTillId ?? null,
        posBankId: data.posBankId ?? null,
      },
      select: posSelect,
    });
  }

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      select: posSelect,
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.user.findMany({
      where: { companyId },
      select: posSelect,
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
      posBranchId?: number | null;
      posWarehouseId?: number | null;
      posTillId?: number | null;
      posBankId?: number | null;
    },
  ) {
    return await prisma.user.update({
      where: { id },
      data,
      select: posSelect,
    });
  }

  async removePermission(userId: number, permissionId: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { permissions: { disconnect: { id: permissionId } } },
    });
  }
}
