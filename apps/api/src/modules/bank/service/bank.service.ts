import { BankRepository } from "../repository/bank.repository";
import {
  BankCreateDto,
  BankUpdateDto,
  BankListDto,
  BankOverviewDto,
  BankTransactionCreateDto,
  BankTransactionListDto,
  BankTransferCreateDto,
} from "../dto/bank.dto";
import { BankServiceResult } from "../types/bank.types";
import { BranchRepository } from "../../branch/repository/branch.repository";
import { SupplierRepository } from "../../supplier/repository/supplier.repository";

const bankRepository = new BankRepository();
const branchRepository = new BranchRepository();
const supplierRepository = new SupplierRepository();

export class BankService {
  private parseTransactionDateRange(data: {
    startDate?: string;
    endDate?: string;
  }) {
    const startDate = data.startDate
      ? new Date(`${data.startDate}T00:00:00.000`)
      : undefined;
    const endDate = data.endDate
      ? new Date(`${data.endDate}T23:59:59.999`)
      : undefined;

    if (startDate && Number.isNaN(startDate.getTime())) {
      return { error: "Gecersiz baslangic tarihi" };
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      return { error: "Gecersiz bitis tarihi" };
    }

    if (startDate && endDate && startDate > endDate) {
      return { error: "Baslangic tarihi bitis tarihinden buyuk olamaz" };
    }

    return { startDate, endDate };
  }

  async create(data: BankCreateDto): Promise<BankServiceResult> {
    try {
      const name = data.name?.trim();
      const companyId = Number(data.companyId);

      if (!name || Number.isNaN(companyId)) {
        return {
          status: "ERROR",
          error: "Bank adi ve companyId zorunludur",
        };
      }

      const existing = await bankRepository.findByCompanyAndName(
        companyId,
        name,
      );
      if (existing) {
        return {
          status: "ERROR",
          error: "Bu sirkette ayni adla bank hesabi zaten var",
        };
      }

      const bank = await bankRepository.create({
        name,
        companyId,
        accountNumber: data.accountNumber?.trim() || undefined,
        iban: data.iban?.trim() || undefined,
      });

      return { status: "SUCCESS", bank };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: number): Promise<BankServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "companyId zorunludur" };
      }

      const banks = await bankRepository.findAllByCompany(companyId);
      return { status: "SUCCESS", banks };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByBranchAndCompany(
    data: BankListDto,
  ): Promise<BankServiceResult> {
    try {
      const branchId = Number(data.branchId);
      const companyId = Number(data.companyId);

      if (Number.isNaN(branchId) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "branchId ve companyId zorunludur" };
      }

      const branch = await branchRepository.findByIdAndCompany(
        branchId,
        companyId,
      );
      if (!branch) {
        return { status: "ERROR", error: "Sube bulunamadi" };
      }

      const banks = await bankRepository.findAllByBranchAndCompany(
        branchId,
        companyId,
      );
      return { status: "SUCCESS", banks };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async getOverview(data: BankOverviewDto): Promise<BankServiceResult> {
    try {
      const branchId = Number(data.branchId);
      const companyId = Number(data.companyId);
      const bankId =
        data.bankId === undefined || data.bankId === null || data.bankId === 0
          ? undefined
          : Number(data.bankId);

      if (Number.isNaN(branchId) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "branchId ve companyId zorunludur" };
      }

      if (bankId !== undefined && Number.isNaN(bankId)) {
        return { status: "ERROR", error: "Gecersiz bank ID" };
      }

      const dateRange = this.parseTransactionDateRange(data);
      if ("error" in dateRange) {
        return { status: "ERROR", error: dateRange.error };
      }

      const branch = await branchRepository.findByIdAndCompany(
        branchId,
        companyId,
      );
      if (!branch) {
        return { status: "ERROR", error: "Sube bulunamadi" };
      }

      const banks = await bankRepository.findAllByBranchAndCompany(
        branchId,
        companyId,
      );
      const selectedBank =
        (bankId !== undefined
          ? banks.find((item) => item.id === bankId)
          : undefined) ??
        banks[0] ??
        null;

      const transactions = selectedBank
        ? await bankRepository.findTransactionsByBank(selectedBank.id, {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          })
        : [];

      return {
        status: "SUCCESS",
        banks,
        transactions,
        selectedBankId: selectedBank?.id ?? null,
      };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async update(
    id: number,
    companyId: number,
    data: BankUpdateDto,
  ): Promise<BankServiceResult> {
    try {
      const parsedId = Number(id);
      const parsedCompanyId = Number(companyId);

      if (Number.isNaN(parsedId) || Number.isNaN(parsedCompanyId)) {
        return { status: "ERROR", error: "Gecersiz bank bilgisi" };
      }

      const existing = await bankRepository.findByIdAndCompany(
        parsedId,
        parsedCompanyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Bank hesabi bulunamadi" };
      }

      const bank = await bankRepository.update(parsedId, parsedCompanyId, {
        ...(data.name !== undefined ? { name: data.name?.trim() } : {}),
        ...(data.accountNumber !== undefined
          ? { accountNumber: data.accountNumber }
          : {}),
        ...(data.iban !== undefined ? { iban: data.iban } : {}),
        ...(data.balance !== undefined ? { balance: data.balance } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      });

      return { status: "SUCCESS", bank };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async delete(id: number, companyId: number): Promise<BankServiceResult> {
    try {
      const parsedId = Number(id);
      const parsedCompanyId = Number(companyId);

      if (Number.isNaN(parsedId) || Number.isNaN(parsedCompanyId)) {
        return { status: "ERROR", error: "Gecersiz bank bilgisi" };
      }

      const existing = await bankRepository.findByIdAndCompany(
        parsedId,
        parsedCompanyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Bank hesabi bulunamadi" };
      }

      await bankRepository.delete(parsedId, parsedCompanyId);
      return { status: "SUCCESS" };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async createTransaction(
    data: BankTransactionCreateDto,
  ): Promise<BankServiceResult> {
    try {
      const bankId = Number(data.bankId);
      const companyId = Number(data.companyId);
      const amount = Number(data.amount);

      if (Number.isNaN(bankId) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz bank veya sirket bilgisi" };
      }
      if (!amount || amount <= 0) {
        return { status: "ERROR", error: "Tutar 0'dan buyuk olmalidir" };
      }
      const inflowTypes = ["medaxil", "alis_iade"];
      const allowedTypes = [
        "medaxil",
        "mexaric",
        "gider",
        "alis_iade",
        "satis_iade",
      ];
      if (!allowedTypes.includes(data.type)) {
        return { status: "ERROR", error: "Gecersiz islem turu" };
      }

      const existingBank = await bankRepository.findByIdAndCompany(
        bankId,
        companyId,
      );

      if (!existingBank) {
        return { status: "ERROR", error: "Bank hesabi bulunamadi" };
      }

      const isInflow = inflowTypes.includes(data.type);
      const balanceDelta = isInflow ? amount : -amount;

      if (!isInflow && existingBank.balance + balanceDelta < 0) {
        return { status: "ERROR", error: "Bank bakiyesi yetersiz" };
      }

      const transaction = await bankRepository.createTransaction({
        bankId,
        type: data.type,
        amount,
        description: data.description,
        counterpartyType: data.counterpartyType,
        counterpartyId: data.counterpartyId,
        counterpartyName: data.counterpartyName,
        referenceNumber: data.referenceNumber,
        category: data.category,
        paymentMethod: data.paymentMethod,
        currency: data.currency,
      });

      await bankRepository.updateBalance(bankId, balanceDelta);

      if (
        data.counterpartyType === "supplier" &&
        data.counterpartyId &&
        !Number.isNaN(Number(data.counterpartyId))
      ) {
        const supplierId = Number(data.counterpartyId);
        const supplier = await supplierRepository.findByIdAndCompany(
          supplierId,
          companyId,
        );

        if (supplier) {
          if (data.type === "medaxil" || data.type === "alis_iade") {
            await supplierRepository.addMedaxil(supplierId, companyId, amount);
          }
          if (data.type === "mexaric" || data.type === "satis_iade") {
            await supplierRepository.addMexaric(supplierId, companyId, amount);
          }
        }
      }

      return { status: "SUCCESS", transaction };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async transfer(data: BankTransferCreateDto): Promise<BankServiceResult> {
    try {
      const sourceBankId = Number(data.sourceBankId);
      const targetBankId = Number(data.targetBankId);
      const companyId = Number(data.companyId);
      const amount = Number(data.amount);
      const description = data.description?.trim();

      if (
        Number.isNaN(sourceBankId) ||
        Number.isNaN(targetBankId) ||
        Number.isNaN(companyId)
      ) {
        return { status: "ERROR", error: "Gecersiz bank veya sirket bilgisi" };
      }

      if (sourceBankId === targetBankId) {
        return {
          status: "ERROR",
          error: "Kaynak ve hedef bank ayni olamaz",
        };
      }

      if (!amount || amount <= 0) {
        return { status: "ERROR", error: "Tutar 0'dan buyuk olmalidir" };
      }

      const [sourceBank, targetBank] = await Promise.all([
        bankRepository.findByIdAndCompany(sourceBankId, companyId),
        bankRepository.findByIdAndCompany(targetBankId, companyId),
      ]);

      if (!sourceBank || !targetBank) {
        return { status: "ERROR", error: "Bank hesabi bulunamadi" };
      }

      if (sourceBank.balance < amount) {
        return { status: "ERROR", error: "Bank bakiyesi yetersiz" };
      }

      const transferResult = await bankRepository.transferBetweenBanks({
        sourceBankId,
        targetBankId,
        amount,
        description,
        sourceBankName: sourceBank.name,
        targetBankName: targetBank.name,
      });

      return {
        status: "SUCCESS",
        sourceBank: transferResult.sourceBank,
        targetBank: transferResult.targetBank,
        sourceTransaction: transferResult.sourceTransaction,
        targetTransaction: transferResult.targetTransaction,
      };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async getTransactions(
    data: BankTransactionListDto,
  ): Promise<BankServiceResult> {
    try {
      const id = Number(data.bankId);
      if (Number.isNaN(id)) {
        return { status: "ERROR", error: "Gecersiz bank ID" };
      }

      const dateRange = this.parseTransactionDateRange(data);
      if ("error" in dateRange) {
        return { status: "ERROR", error: dateRange.error };
      }

      const transactions = await bankRepository.findTransactionsByBank(id, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      return { status: "SUCCESS", transactions };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async updateTransaction(
    txId: number,
    bankId: number,
    data: {
      description?: string;
      counterpartyName?: string;
      referenceNumber?: string;
      category?: string;
      paymentMethod?: string;
      currency?: string;
    },
  ): Promise<BankServiceResult> {
    try {
      if (Number.isNaN(txId) || Number.isNaN(bankId)) {
        return { status: "ERROR", error: "Gecersiz islem ID" };
      }
      const existing = await bankRepository.findTransactionById(txId);
      if (!existing || existing.bankId !== bankId) {
        return { status: "ERROR", error: "Islem bulunamadi" };
      }
      const transaction = await bankRepository.updateTransaction(
        txId,
        bankId,
        data,
      );
      return { status: "SUCCESS", transaction };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async deleteTransaction(
    txId: number,
    bankId: number,
  ): Promise<BankServiceResult> {
    try {
      if (Number.isNaN(txId) || Number.isNaN(bankId)) {
        return { status: "ERROR", error: "Gecersiz islem ID" };
      }
      const existing = await bankRepository.findTransactionById(txId);
      if (!existing || existing.bankId !== bankId) {
        return { status: "ERROR", error: "Islem bulunamadi" };
      }

      const wasInflow =
        existing.type === "medaxil" || existing.type === "alis_iade";
      const balanceDelta = wasInflow ? -existing.amount : existing.amount;

      await bankRepository.updateBalance(bankId, balanceDelta);
      await bankRepository.deleteTransaction(txId, bankId);

      return { status: "SUCCESS" };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
