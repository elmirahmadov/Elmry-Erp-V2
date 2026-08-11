import { TillRepository } from "../repository/till.repository";
import {
  TillCreateDto,
  TillUpdateDto,
  TillListDto,
  TillOverviewDto,
  TillTransactionCreateDto,
  TillTransactionListDto,
  TillTransferCreateDto,
} from "../dto/till.dto";
import { TillServiceResult } from "../types/till.types";
import { BranchRepository } from "../../branch/repository/branch.repository";
import { SupplierRepository } from "../../supplier/repository/supplier.repository";

const tillRepository = new TillRepository();
const branchRepository = new BranchRepository();
const supplierRepository = new SupplierRepository();

export class TillService {
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

  async create(data: TillCreateDto): Promise<TillServiceResult> {
    try {
      const name = data.name?.trim();
      const companyId = Number(data.companyId);

      if (!name || Number.isNaN(companyId)) {
        return {
          status: "ERROR",
          error: "Kassa adi ve companyId zorunludur",
        };
      }

      const existing = await tillRepository.findByCompanyAndName(
        companyId,
        name,
      );
      if (existing) {
        return {
          status: "ERROR",
          error: "Bu sirkette ayni adla kassa zaten var",
        };
      }

      const till = await tillRepository.create({
        name,
        companyId,
      });

      return { status: "SUCCESS", till };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByCompany(companyId: number): Promise<TillServiceResult> {
    try {
      if (Number.isNaN(companyId)) {
        return { status: "ERROR", error: "companyId zorunludur" };
      }

      const tills = await tillRepository.findAllByCompany(companyId);
      return { status: "SUCCESS", tills };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async findAllByBranchAndCompany(
    data: TillListDto,
  ): Promise<TillServiceResult> {
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

      const tills = await tillRepository.findAllByBranchAndCompany(
        branchId,
        companyId,
      );
      return { status: "SUCCESS", tills };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async getOverview(data: TillOverviewDto): Promise<TillServiceResult> {
    try {
      const branchId = Number(data.branchId);
      const companyId = Number(data.companyId);
      const tillId =
        data.tillId === undefined || data.tillId === null || data.tillId === 0
          ? undefined
          : Number(data.tillId);

      if (Number.isNaN(branchId) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "branchId ve companyId zorunludur" };
      }

      if (tillId !== undefined && Number.isNaN(tillId)) {
        return { status: "ERROR", error: "Gecersiz kassa ID" };
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

      const tills = await tillRepository.findAllByBranchAndCompany(
        branchId,
        companyId,
      );
      const selectedTill =
        (tillId !== undefined
          ? tills.find((item) => item.id === tillId)
          : undefined) ??
        tills[0] ??
        null;

      const transactions = selectedTill
        ? await tillRepository.findTransactionsByTill(selectedTill.id, {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          })
        : [];

      return {
        status: "SUCCESS",
        tills,
        transactions,
        selectedTillId: selectedTill?.id ?? null,
      };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async update(
    id: number,
    companyId: number,
    data: TillUpdateDto,
  ): Promise<TillServiceResult> {
    try {
      const parsedId = Number(id);
      const parsedCompanyId = Number(companyId);

      if (Number.isNaN(parsedId) || Number.isNaN(parsedCompanyId)) {
        return { status: "ERROR", error: "Gecersiz kassa bilgisi" };
      }

      const existing = await tillRepository.findByIdAndCompany(
        parsedId,
        parsedCompanyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Kassa bulunamadi" };
      }

      const till = await tillRepository.update(parsedId, parsedCompanyId, {
        ...(data.name !== undefined ? { name: data.name?.trim() } : {}),
        ...(data.balance !== undefined ? { balance: data.balance } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      });

      return { status: "SUCCESS", till };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async delete(id: number, companyId: number): Promise<TillServiceResult> {
    try {
      const parsedId = Number(id);
      const parsedCompanyId = Number(companyId);

      if (Number.isNaN(parsedId) || Number.isNaN(parsedCompanyId)) {
        return { status: "ERROR", error: "Gecersiz kassa bilgisi" };
      }

      const existing = await tillRepository.findByIdAndCompany(
        parsedId,
        parsedCompanyId,
      );
      if (!existing) {
        return { status: "ERROR", error: "Kassa bulunamadi" };
      }

      await tillRepository.delete(parsedId, parsedCompanyId);
      return { status: "SUCCESS" };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async createTransaction(
    data: TillTransactionCreateDto,
  ): Promise<TillServiceResult> {
    try {
      const tillId = Number(data.tillId);
      const companyId = Number(data.companyId);
      const amount = Number(data.amount);

      if (Number.isNaN(tillId) || Number.isNaN(companyId)) {
        return { status: "ERROR", error: "Gecersiz kassa veya sirket bilgisi" };
      }
      if (!amount || amount <= 0) {
        return { status: "ERROR", error: "Tutar 0'dan buyuk olmalidir" };
      }
      if (!["medaxil", "mexaric", "gider"].includes(data.type)) {
        return { status: "ERROR", error: "Gecersiz islem turu" };
      }

      const existingTill = await tillRepository.findByIdAndCompany(
        tillId,
        companyId,
      );

      if (!existingTill) {
        return { status: "ERROR", error: "Kassa bulunamadi" };
      }

      const balanceDelta = data.type === "medaxil" ? amount : -amount;

      if (data.type !== "medaxil" && existingTill.balance + balanceDelta < 0) {
        return { status: "ERROR", error: "Kassa bakiyesi yetersiz" };
      }

      const transaction = await tillRepository.createTransaction({
        tillId,
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
        carrierName: data.carrierName,
        orderNumber: data.orderNumber,
      });

      await tillRepository.updateBalance(tillId, balanceDelta);

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
          if (data.type === "medaxil") {
            await supplierRepository.addMedaxil(supplierId, companyId, amount);
          }
          if (data.type === "mexaric") {
            await supplierRepository.addMexaric(supplierId, companyId, amount);
          }
        }
      }

      return { status: "SUCCESS", transaction };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async transfer(data: TillTransferCreateDto): Promise<TillServiceResult> {
    try {
      const sourceTillId = Number(data.sourceTillId);
      const targetTillId = Number(data.targetTillId);
      const companyId = Number(data.companyId);
      const amount = Number(data.amount);
      const description = data.description?.trim();

      if (
        Number.isNaN(sourceTillId) ||
        Number.isNaN(targetTillId) ||
        Number.isNaN(companyId)
      ) {
        return { status: "ERROR", error: "Gecersiz kassa veya sirket bilgisi" };
      }

      if (sourceTillId === targetTillId) {
        return {
          status: "ERROR",
          error: "Kaynak ve hedef kassa ayni olamaz",
        };
      }

      if (!amount || amount <= 0) {
        return { status: "ERROR", error: "Tutar 0'dan buyuk olmalidir" };
      }

      const [sourceTill, targetTill] = await Promise.all([
        tillRepository.findByIdAndCompany(sourceTillId, companyId),
        tillRepository.findByIdAndCompany(targetTillId, companyId),
      ]);

      if (!sourceTill || !targetTill) {
        return { status: "ERROR", error: "Kassa bulunamadi" };
      }

      if (sourceTill.balance < amount) {
        return { status: "ERROR", error: "Kassa bakiyesi yetersiz" };
      }

      const transferResult = await tillRepository.transferBetweenTills({
        sourceTillId,
        targetTillId,
        amount,
        description,
        sourceTillName: sourceTill.name,
        targetTillName: targetTill.name,
      });

      return {
        status: "SUCCESS",
        sourceTill: transferResult.sourceTill,
        targetTill: transferResult.targetTill,
        sourceTransaction: transferResult.sourceTransaction,
        targetTransaction: transferResult.targetTransaction,
      };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async getTransactions(
    data: TillTransactionListDto,
  ): Promise<TillServiceResult> {
    try {
      const id = Number(data.tillId);
      if (Number.isNaN(id)) {
        return { status: "ERROR", error: "Gecersiz kassa ID" };
      }

      const dateRange = this.parseTransactionDateRange(data);
      if ("error" in dateRange) {
        return { status: "ERROR", error: dateRange.error };
      }

      const transactions = await tillRepository.findTransactionsByTill(id, {
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
    tillId: number,
    data: {
      description?: string;
      counterpartyName?: string;
      referenceNumber?: string;
      category?: string;
      paymentMethod?: string;
      currency?: string;
      carrierName?: string;
      orderNumber?: string;
    },
  ): Promise<TillServiceResult> {
    try {
      if (Number.isNaN(txId) || Number.isNaN(tillId)) {
        return { status: "ERROR", error: "Gecersiz islem ID" };
      }
      const existing = await tillRepository.findTransactionById(txId);
      if (!existing || existing.tillId !== tillId) {
        return { status: "ERROR", error: "Islem bulunamadi" };
      }
      const transaction = await tillRepository.updateTransaction(
        txId,
        tillId,
        data,
      );
      return { status: "SUCCESS", transaction };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }

  async deleteTransaction(
    txId: number,
    tillId: number,
  ): Promise<TillServiceResult> {
    try {
      if (Number.isNaN(txId) || Number.isNaN(tillId)) {
        return { status: "ERROR", error: "Gecersiz islem ID" };
      }
      const existing = await tillRepository.findTransactionById(txId);
      if (!existing || existing.tillId !== tillId) {
        return { status: "ERROR", error: "Islem bulunamadi" };
      }

      const balanceDelta =
        existing.type === "medaxil" ? -existing.amount : existing.amount;

      await tillRepository.updateBalance(tillId, balanceDelta);
      await tillRepository.deleteTransaction(txId, tillId);

      return { status: "SUCCESS" };
    } catch (error) {
      return { status: "ERROR", error: (error as Error).message };
    }
  }
}
