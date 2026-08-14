import { CompanyRepository } from "../../company/repository/company.repository";
import { CustomerCreateDto, CustomerUpdateDto } from "../dto/customer.dto";
import { CustomerRepository } from "../repository/customer.repository";
import { CustomerServiceResult } from "../types/customer.types";
import { TillRepository } from "../../till/repository/till.repository";
import { BranchRepository } from "../../branch/repository/branch.repository";

const customerRepository = new CustomerRepository();
const companyRepository = new CompanyRepository();
const tillRepository = new TillRepository();
const branchRepository = new BranchRepository();

export class CustomerService {
  private normalizeOptionalString(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private normalizeStatus(status?: string) {
    return status === "inactive" ? "inactive" : "active";
  }

  async create(data: CustomerCreateDto): Promise<CustomerServiceResult> {
    try {
      const name = data.name?.trim();
      const companyId = Number(data.companyId);

      if (!name || Number.isNaN(companyId)) {
        return {
          status: "ERROR",
          error: "Musteri adi ve companyId zorunludur",
        };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const customer = await customerRepository.create({
        name,
        contactPerson: this.normalizeOptionalString(data.contactPerson),
        phone: this.normalizeOptionalString(data.phone),
        email: this.normalizeOptionalString(data.email),
        address: this.normalizeOptionalString(data.address),
        taxNumber: this.normalizeOptionalString(data.taxNumber),
        status: this.normalizeStatus(data.status),
        companyId,
      });

      return { status: "SUCCESS", customer };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: number): Promise<CustomerServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz companyId" };
      }

      const company = await companyRepository.findById(companyId);
      if (!company) {
        return { status: "ERROR", error: "Sirket bulunamadi" };
      }

      const customers = await customerRepository.findAllByCompany(companyId);
      return { status: "SUCCESS", customers };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async update(
    id: number,
    data: CustomerUpdateDto,
  ): Promise<CustomerServiceResult> {
    try {
      const companyId = Number(data.companyId);

      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz musteri bilgisi" };
      }

      const existing = await customerRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Musteri bulunamadi" };
      }

      const customer = await customerRepository.update(id, companyId, {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
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

      return { status: "SUCCESS", customer };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async delete(
    id: number,
    companyId: number,
  ): Promise<CustomerServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz musteri bilgisi" };
      }

      const existing = await customerRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Musteri bulunamadi" };
      }

      await customerRepository.delete(id, companyId);
      return { status: "SUCCESS" };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async addDebt(
    id: number,
    companyId: number,
    amount: number,
  ): Promise<CustomerServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId) || !amount || amount <= 0) {
        return { status: "ERROR", error: "Gecersiz borc bilgisi" };
      }

      const existing = await customerRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Musteri bulunamadi" };
      }

      const customer = await customerRepository.addDebt(id, companyId, amount);
      return { status: "SUCCESS", customer };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async addPaidSale(
    id: number,
    companyId: number,
    amount: number,
  ): Promise<CustomerServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId) || !amount || amount <= 0) {
        return { status: "ERROR", error: "Gecersiz satis bilgisi" };
      }
      const existing = await customerRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Musteri bulunamadi" };
      }
      const customer = await customerRepository.addPaidSale(
        id,
        companyId,
        amount,
      );
      return { status: "SUCCESS", customer };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async recordPaymentTotals(
    id: number,
    companyId: number,
    amount: number,
  ): Promise<CustomerServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId) || !amount || amount <= 0) {
        return { status: "ERROR", error: "Gecersiz odeme bilgisi" };
      }
      const existing = await customerRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Musteri bulunamadi" };
      }
      const customer = await customerRepository.addPayment(
        id,
        companyId,
        amount,
      );
      return { status: "SUCCESS", customer };
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
  ): Promise<CustomerServiceResult> {
    try {
      if (Number.isNaN(id) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz musteri bilgisi" };
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

      const existing = await customerRepository.findByIdAndCompany(
        id,
        companyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Musteri bulunamadi" };
      }

      const branch = await branchRepository.findById(branchId);
      if (!branch || branch.companyId !== companyId) {
        return { status: "ERROR", error: "Filiyal bulunamadi" };
      }

      const till = await tillRepository.findByIdAndBranch(tillId, branchId);
      if (!till) {
        return { status: "ERROR", error: "Kasa bulunamadi" };
      }

      await tillRepository.createTransaction({
        tillId,
        type: "medaxil",
        amount,
        description: `Musteri odenisi: ${existing.name}`,
        counterpartyType: "customer",
        counterpartyId: id,
        counterpartyName: existing.name,
        category: "Musteri odemesı",
        paymentMethod: "Nağd",
      });
      await tillRepository.updateBalance(tillId, amount);

      const customer = await customerRepository.addPayment(
        id,
        companyId,
        amount,
      );
      return { status: "SUCCESS", customer };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
