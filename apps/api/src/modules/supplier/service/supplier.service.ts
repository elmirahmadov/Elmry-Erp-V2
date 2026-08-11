import { CompanyRepository } from "../../company/repository/company.repository";
import { SupplierCreateDto, SupplierUpdateDto } from "../dto/supplier.dto";
import { SupplierRepository } from "../repository/supplier.repository";
import { SupplierServiceResult } from "../types/supplier.types";
import { TillRepository } from "../../till/repository/till.repository";
import { BranchRepository } from "../../branch/repository/branch.repository";

const supplierRepository = new SupplierRepository();
const companyRepository = new CompanyRepository();
const tillRepository = new TillRepository();
const branchRepository = new BranchRepository();

export class SupplierService {
  private normalizeOptionalString(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeStatus(status?: string) {
    return status === "inactive" ? "inactive" : "active";
  }

  async create(data: SupplierCreateDto): Promise<SupplierServiceResult> {
    try {
      const name = data.name?.trim();
      const companyId = Number(data.companyId);

      if (!name || Number.isNaN(companyId)) {
        return {
          status: "ERROR",
          error: "Tedarikci adi ve companyId zorunludur",
        };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const supplier = await supplierRepository.create({
        name,
        contactPerson: this.normalizeOptionalString(data.contactPerson),
        phone: this.normalizeOptionalString(data.phone),
        email: this.normalizeOptionalString(data.email),
        address: this.normalizeOptionalString(data.address),
        taxNumber: this.normalizeOptionalString(data.taxNumber),
        status: this.normalizeStatus(data.status),
        companyId,
      });

      return { status: "SUCCESS", supplier };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: number): Promise<SupplierServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const suppliers = await supplierRepository.findAllByCompany(companyId);
      const totalsBySupplier =
        await supplierRepository.findPurchaseTotalsByCompany(companyId);

      const suppliersWithTotals = suppliers.map((supplier: any) => {
        const totals = totalsBySupplier.get(Number(supplier.id)) ?? {
          totalPurchase: 0,
          totalReturn: 0,
        };

        return {
          ...supplier,
          totalPurchase: totals.totalPurchase,
          totalReturn: totals.totalReturn,
        };
      });

      return { status: "SUCCESS", suppliers: suppliersWithTotals };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async update(
    id: number,
    data: SupplierUpdateDto,
  ): Promise<SupplierServiceResult> {
    try {
      const companyId = Number(data.companyId);

      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz tedarikci bilgisi" };
      }

      const existing = await supplierRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Tedarikci bulunamadi" };
      }

      const name = data.name?.trim();
      if (data.name !== undefined && !name) {
        return { status: "ERROR", error: "Tedarikci adi zorunludur" };
      }

      const supplier = await supplierRepository.update(id, companyId, {
        ...(data.name !== undefined ? { name } : {}),
        ...(data.contactPerson !== undefined
          ? { contactPerson: this.normalizeOptionalString(data.contactPerson) }
          : {}),
        ...(data.phone !== undefined
          ? { phone: this.normalizeOptionalString(data.phone) }
          : {}),
        ...(data.email !== undefined
          ? { email: this.normalizeOptionalString(data.email) }
          : {}),
        ...(data.address !== undefined
          ? { address: this.normalizeOptionalString(data.address) }
          : {}),
        ...(data.taxNumber !== undefined
          ? { taxNumber: this.normalizeOptionalString(data.taxNumber) }
          : {}),
        ...(data.status !== undefined
          ? { status: this.normalizeStatus(data.status) }
          : {}),
      });

      return { status: "SUCCESS", supplier };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async delete(id: number, companyId: number): Promise<SupplierServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz tedarikci bilgisi" };
      }

      const existing = await supplierRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Tedarikci bulunamadi" };
      }

      await supplierRepository.delete(id, companyId);
      return { status: "SUCCESS" };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async addPurchase(
    id: number,
    companyId: number,
    amount: number,
  ): Promise<SupplierServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz tedarikci bilgisi" };
      }
      if (!amount || amount <= 0) {
        return { status: "ERROR", error: "Gecerli bir tutar giriniz" };
      }
      const existing = await supplierRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Tedarikci bulunamadi" };
      }
      const supplier = await supplierRepository.addPurchase(
        id,
        companyId,
        amount,
      );
      return { status: "SUCCESS", supplier };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async addPayment(
    id: number,
    companyId: number,
    amount: number,
    branchId: number,
    tillId: number,
  ): Promise<SupplierServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz tedarikci bilgisi" };
      }
      if (!amount || amount <= 0) {
        return { status: "ERROR", error: "Gecerli bir tutar giriniz" };
      }
      if (Number.isNaN(branchId) || Number.isNaN(tillId)) {
        return {
          status: "ERROR",
          error: "Gecersiz filiyal veya kasa bilgisi",
        };
      }

      const existing = await supplierRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Tedarikci bulunamadi" };
      }

      // Validate branch belongs to company
      const branch = await branchRepository.findById(branchId);
      if (!branch || branch.companyId !== companyId) {
        return { status: "ERROR", error: "Filiyal bulunamadi" };
      }

      // Validate till belongs to branch
      const till = await tillRepository.findByIdAndBranch(tillId, branchId);
      if (!till) {
        return { status: "ERROR", error: "Kasa bulunamadi" };
      }

      if (till.balance < amount) {
        return { status: "ERROR", error: "Kasa bakiyesi yetersiz" };
      }

      // Supplier payment should be treated as cash-out (mexaric).
      await tillRepository.createTransaction({
        tillId,
        type: "mexaric",
        amount,
        description: `Tedarikci odemesi: ${existing.name}`,
        counterpartyType: "supplier",
        counterpartyId: id,
        counterpartyName: existing.name,
      });

      await tillRepository.updateBalance(tillId, -amount);

      // Keep supplier debt tracking in mexaric bucket.
      const supplier = await supplierRepository.addMexaric(
        id,
        companyId,
        amount,
      );

      return { status: "SUCCESS", supplier };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
