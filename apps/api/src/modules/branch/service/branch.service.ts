import { BranchRepository } from "../repository/branch.repository";
import { BranchCreateDto, WarehouseCreateDto } from "../dto/branch.dto";
import { CompanyRepository } from "../../company/repository/company.repository";
import { TillRepository } from "../../till/repository/till.repository";
import { UserRepository } from "../../user/repository/user.repository";

const branchRepository = new BranchRepository();
const companyRepository = new CompanyRepository();
const tillRepository = new TillRepository();
const userRepository = new UserRepository();

export class BranchService {
  async create(data: BranchCreateDto) {
    try {
      const name = data.name?.trim();
      const companyId = Number(data.companyId);

      if (!name || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Isim ve sirket ID zorunludur" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const branch = await branchRepository.create({
        name,
        companyId,
      });
      return { status: "SUCCESS", branch };
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

      const branches = await branchRepository.findAllByCompany(parsedCompanyId);
      return { status: "SUCCESS", branches };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findById(id: string) {
    try {
      const parsedId = Number(id);

      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return { status: "ERROR", error: "Gecersiz filial ID" };
      }

      const branch = await branchRepository.findById(parsedId);
      if (!branch) {
        return { status: "ERROR", error: "Filial bulunamadi" };
      }
      return { status: "SUCCESS", branch };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findDetail(branchId: number, companyId: number) {
    try {
      if (Number.isNaN(branchId) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "branchId ve companyId zorunludur" };
      }

      const branch = await branchRepository.findDetailByIdAndCompany(
        branchId,
        companyId,
      );
      if (!branch) {
        return { status: "ERROR", error: "Filial bulunamadi" };
      }

      return {
        status: "SUCCESS",
        branch: {
          id: branch.id,
          name: branch.name,
          companyId: branch.companyId,
          warehouses: branch.warehouses.map((item) => item.warehouse),
          tills: branch.tills.map((item) => item.till),
          users: branch.users.map((item) => item.user),
          warehouseIds: branch.warehouses.map((item) => item.warehouseId),
          tillIds: branch.tills.map((item) => item.tillId),
          userIds: branch.users.map((item) => item.userId),
        },
      };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async createWarehouse(data: WarehouseCreateDto) {
    try {
      const warehouseName = data.name?.trim();
      const companyId = Number(data.companyId);

      if (!warehouseName || Number.isNaN(companyId)) {
        return {
          status: "ERROR",
          error: "Depo adi ve companyId zorunludur",
        };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const existingWarehouse =
        await branchRepository.findWarehouseByCompanyAndName(
          companyId,
          warehouseName,
        );
      if (existingWarehouse) {
        return {
          status: "ERROR",
          error: "Bu sirkette ayni adla depo zaten var",
        };
      }

      const warehouse = await branchRepository.createWarehouse({
        name: warehouseName,
        companyId,
      });

      return { status: "SUCCESS", warehouse };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findWarehousesByCompany(companyId: number) {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "companyId zorunludur" };
      }

      const warehouses =
        await branchRepository.findWarehousesByCompany(companyId);
      return { status: "SUCCESS", warehouses };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findWarehousesByBranch(branchId: number, companyId: number) {
    try {
      if (Number.isNaN(branchId) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "branchId ve companyId zorunludur" };
      }

      const branch = await branchRepository.findByIdAndCompany(
        branchId,
        companyId,
      );
      if (!branch) {
        return { status: "ERROR", error: "Filial bulunamadi" };
      }

      const warehouses = await branchRepository.findWarehousesByBranch(
        branchId,
        companyId,
      );

      return { status: "SUCCESS", warehouses };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async setBranchWarehouses(
    branchId: number,
    companyId: number,
    warehouseIds: number[],
  ) {
    try {
      const branch = await branchRepository.findByIdAndCompany(
        branchId,
        companyId,
      );
      if (!branch) {
        return { status: "ERROR", error: "Filial bulunamadi" };
      }

      const uniqueIds = [...new Set(warehouseIds.map(Number).filter((id) => id > 0))];
      for (const warehouseId of uniqueIds) {
        const warehouse = await branchRepository.findWarehouseByIdAndCompany(
          warehouseId,
          companyId,
        );
        if (!warehouse) {
          return {
            status: "ERROR",
            error: `Depo bulunamadi: ${warehouseId}`,
          };
        }
      }

      await branchRepository.setBranchWarehouses(branchId, uniqueIds);
      return this.findDetail(branchId, companyId);
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async setBranchTills(
    branchId: number,
    companyId: number,
    tillIds: number[],
  ) {
    try {
      const branch = await branchRepository.findByIdAndCompany(
        branchId,
        companyId,
      );
      if (!branch) {
        return { status: "ERROR", error: "Filial bulunamadi" };
      }

      const uniqueIds = [...new Set(tillIds.map(Number).filter((id) => id > 0))];
      for (const tillId of uniqueIds) {
        const till = await tillRepository.findByIdAndCompany(tillId, companyId);
        if (!till) {
          return { status: "ERROR", error: `Kassa bulunamadi: ${tillId}` };
        }
      }

      await branchRepository.setBranchTills(branchId, uniqueIds);
      return this.findDetail(branchId, companyId);
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async setBranchUsers(
    branchId: number,
    companyId: number,
    userIds: number[],
  ) {
    try {
      const branch = await branchRepository.findByIdAndCompany(
        branchId,
        companyId,
      );
      if (!branch) {
        return { status: "ERROR", error: "Filial bulunamadi" };
      }

      const uniqueIds = [...new Set(userIds.map(Number).filter((id) => id > 0))];
      for (const userId of uniqueIds) {
        const user = await userRepository.findById(userId);
        if (!user || user.companyId !== companyId) {
          return {
            status: "ERROR",
            error: `Kullanici bulunamadi: ${userId}`,
          };
        }
      }

      await branchRepository.setBranchUsers(branchId, uniqueIds);
      return this.findDetail(branchId, companyId);
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
