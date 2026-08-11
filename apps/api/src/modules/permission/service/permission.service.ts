import { Prisma } from "@elmry/database";
import { PermissionRepository } from "../repository/permission.repository";


const permissionRepository = new PermissionRepository();

export class PermissionService {
  async create(data: any) {
    try {
      const permission = await permissionRepository.create(data);
      return { status: "SUCCESS", permission };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return { status: "ERROR", error: "Bu izin adi zaten mevcut" };
      }
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAll() {
    try {
      const permissions = await permissionRepository.findAll();
      return { status: "SUCCESS", permissions };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findById(id: number) {
    try {
      const permission = await permissionRepository.findById(id);
      if (!permission) {
        return { status: "ERROR", error: "Yetki bulunamadi" };
      }
      return { status: "SUCCESS", permission };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
