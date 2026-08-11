import { UserRepository } from "../repository/user.repository";
import { UserCreateDto } from "../dto/user.dto";
import { CompanyRepository } from "../../company/repository/company.repository";
import { PermissionRepository } from "../../permission/repository/permission.repository";
import { prisma } from "@elmry/database";
import bcrypt from "bcrypt";

const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const permissionRepository = new PermissionRepository();

export class UserService {
  async create(data: UserCreateDto) {
    try {
      if (
        !data.name ||
        !data.email ||
        !data.password ||
        !data.companyId ||
        !data.roleId
      ) {
        return { status: "ERROR", error: "T�m zorunlu alanlar doldurulmali" };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { status: "ERROR", error: "Ge�ersiz email" };
      }

      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        return { status: "ERROR", error: "Bu email zaten kullaniliyor" };
      }

      const hashedPassword = bcrypt.hashSync(data.password, 10);

      const company = await companyRepository.findById(data.companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const user = await userRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        companyId: data.companyId,
        roleId: data.roleId,
      });

      if (data.permissionNames && data.permissionNames.length > 0) {
        for (const permName of data.permissionNames) {
          let perm = await permissionRepository.findByName(permName);
          if (!perm) {
            perm = await permissionRepository.create({ name: permName });
          }
          if (perm) {
            await userRepository.assignPermission(user.id, perm.id);
          }
        }
      }

      return { status: "SUCCESS", user };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: string) {
    try {
      const parsedCompanyId = Number(companyId);

      if (!Number.isInteger(parsedCompanyId) || parsedCompanyId <= 0) {
        return { status: "ERROR", error: "Gecersiz sirket ID" };
      }

      const users = await userRepository.findAllByCompany(parsedCompanyId);
      return { status: "SUCCESS", users };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findById(id: string) {
    try {
      const parsedId = Number(id);

      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return { status: "ERROR", error: "Gecersiz kullanici ID" };
      }

      const user = await userRepository.findById(parsedId);
      if (!user) {
        return { status: "ERROR", error: "Kullanici bulunamadi" };
      }
      return { status: "SUCCESS", user };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async update(id: number, data: any) {
    try {
      const payload = { ...data };
      if (payload.password) {
        payload.password = bcrypt.hashSync(payload.password, 10);
      }
      const user = await userRepository.update(id, payload);
      return { status: "SUCCESS", user };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async assignPermission(userId: number, permissionId: number) {
    try {
      const user = await userRepository.assignPermission(userId, permissionId);
      return { status: "SUCCESS", user };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async removePermission(userId: number, permissionId: number) {
    try {
      const user = await userRepository.removePermission(userId, permissionId);
      return { status: "SUCCESS", user };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async getUserWithPermissions(id: string) {
    try {
      const parsedId = Number(id);

      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return { status: "ERROR", error: "Gecersiz kullanici ID" };
      }

      const user = await userRepository.findById(parsedId);
      if (!user) {
        return { status: "ERROR", error: "Kullanici bulunamadi" };
      }
      const userWithPerms = await prisma.user.findUnique({
        where: { id: parsedId },
        include: { permissions: true },
      });
      return { status: "SUCCESS", user: userWithPerms };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
