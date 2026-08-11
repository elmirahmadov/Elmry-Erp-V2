import { prisma } from "@elmry/database";

export class BranchRepository {
  async create(data: any) {
    return await prisma.branch.create({
      data: {
        ...data,
        companyId: parseInt(data.companyId),
      },
    });
  }

  async findById(id: number | string) {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return null;
    }

    return await prisma.branch.findUnique({ where: { id: parsedId } });
  }

  async findByCompanyId(companyId: number) {
    return await prisma.branch.findMany({ where: { companyId } });
  }

  async findAllByCompany(companyId: number) {
    return await prisma.branch.findMany({
      where: { companyId },
      orderBy: { id: "asc" },
    });
  }

  async findByNameAndCompany(name: string, companyId: number) {
    return await prisma.branch.findFirst({
      where: {
        companyId,
        name: {
          equals: name,
        },
      },
    });
  }

  async findByIdAndCompany(id: number, companyId: number) {
    return await prisma.branch.findFirst({
      where: { id, companyId },
    });
  }

  async findDetailByIdAndCompany(id: number, companyId: number) {
    return await prisma.branch.findFirst({
      where: { id, companyId },
      include: {
        warehouses: {
          include: {
            warehouse: true,
          },
        },
        tills: {
          include: {
            till: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                roleId: true,
                companyId: true,
              },
            },
          },
        },
      },
    });
  }

  async createWarehouse(data: { name: string; companyId: number }) {
    return await prisma.warehouse.create({
      data: {
        name: data.name,
        companyId: data.companyId,
      },
    });
  }

  async findWarehousesByCompany(companyId: number) {
    return await prisma.warehouse.findMany({
      where: { companyId },
      include: {
        branches: {
          include: {
            branch: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  async findWarehousesByBranch(branchId: number, companyId: number) {
    return await prisma.warehouse.findMany({
      where: {
        companyId,
        branches: {
          some: { branchId },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  async findWarehouseByCompanyAndName(companyId: number, name: string) {
    return await prisma.warehouse.findFirst({
      where: {
        companyId,
        name: { equals: name },
      },
    });
  }

  async findWarehouseByIdAndCompany(id: number, companyId: number) {
    return await prisma.warehouse.findFirst({
      where: { id, companyId },
    });
  }

  async setBranchWarehouses(branchId: number, warehouseIds: number[]) {
    await prisma.$transaction(async (tx) => {
      await tx.branchWarehouse.deleteMany({ where: { branchId } });
      if (warehouseIds.length > 0) {
        await tx.branchWarehouse.createMany({
          data: warehouseIds.map((warehouseId) => ({
            branchId,
            warehouseId,
          })),
        });
      }
    });
  }

  async setBranchTills(branchId: number, tillIds: number[]) {
    await prisma.$transaction(async (tx) => {
      await tx.branchTill.deleteMany({ where: { branchId } });
      if (tillIds.length > 0) {
        await tx.branchTill.createMany({
          data: tillIds.map((tillId) => ({
            branchId,
            tillId,
          })),
        });
      }
    });
  }

  async setBranchUsers(branchId: number, userIds: number[]) {
    await prisma.$transaction(async (tx) => {
      await tx.branchUser.deleteMany({ where: { branchId } });
      if (userIds.length > 0) {
        await tx.branchUser.createMany({
          data: userIds.map((userId) => ({
            branchId,
            userId,
          })),
        });
      }
    });
  }
}
