import { prisma } from "@elmry/database";

export class PermissionRepository {
  async create(data: any) {
    return await prisma.permission.create({ data });
  }

  async findAll() {
    return await prisma.permission.findMany();
  }

  async findById(id: number) {
    return await prisma.permission.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return await prisma.permission.findUnique({ where: { name } });
  }
}
