import { Request, Response } from "express";
import { BankService } from "../service/bank.service";

const bankService = new BankService();

export const createBank = async (req: Request, res: Response) => {
  const result = await bankService.create(req.body);

  if (result.status === "SUCCESS") {
    return res
      .status(201)
      .json({ message: "Bank hesabi olusturuldu", bank: result.bank });
  }

  return res.status(400).json({ error: result.error });
};

export const findBanksByBranchAndCompany = async (
  req: Request,
  res: Response,
) => {
  const { branchId, companyId } = req.query as {
    branchId?: string;
    companyId?: string;
  };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  if (!branchId) {
    const result = await bankService.findAllByCompany(parsedCompanyId);
    if (result.status === "SUCCESS") {
      return res.json({ banks: result.banks });
    }
    return res.status(500).json({ error: result.error });
  }

  const parsedBranchId = parseInt(branchId);
  if (Number.isNaN(parsedBranchId)) {
    return res.status(400).json({ error: "branchId gecersiz" });
  }

  const result = await bankService.findAllByBranchAndCompany({
    branchId: parsedBranchId,
    companyId: parsedCompanyId,
  });

  if (result.status === "SUCCESS") {
    return res.json({ banks: result.banks });
  }

  if (result.error === "Sube bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const getBankOverview = async (req: Request, res: Response) => {
  const { branchId, companyId, bankId, startDate, endDate } = req.query as {
    branchId?: string;
    companyId?: string;
    bankId?: string;
    startDate?: string;
    endDate?: string;
  };

  const result = await bankService.getOverview({
    branchId: Number(branchId),
    companyId: Number(companyId),
    bankId: bankId ? Number(bankId) : undefined,
    startDate,
    endDate,
  });

  if (result.status === "SUCCESS") {
    return res.json({
      banks: result.banks,
      transactions: result.transactions,
      selectedBankId: result.selectedBankId,
    });
  }

  if (
    result.error === "branchId ve companyId zorunludur" ||
    result.error === "Gecersiz bank ID" ||
    result.error === "Gecersiz baslangic tarihi" ||
    result.error === "Gecersiz bitis tarihi" ||
    result.error === "Baslangic tarihi bitis tarihinden buyuk olamaz"
  ) {
    return res.status(400).json({ error: result.error });
  }

  if (result.error === "Sube bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const updateBank = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);
  const companyId = Number(req.body?.companyId);

  if (Number.isNaN(parsedId) || Number.isNaN(companyId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await bankService.update(parsedId, companyId, req.body);

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Bank hesabi guncellendi",
      bank: result.bank,
    });
  }

  if (result.error === "Bank hesabi bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const deleteBank = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);
  const companyId = Number(
    (req.query as { companyId?: string }).companyId || req.body?.companyId,
  );

  if (Number.isNaN(parsedId) || Number.isNaN(companyId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await bankService.delete(parsedId, companyId);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Bank hesabi silindi" });
  }

  if (result.error === "Bank hesabi bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const createBankTransaction = async (req: Request, res: Response) => {
  const { bankId } = req.params as { bankId: string };
  const parsedBankId = parseInt(bankId);

  if (Number.isNaN(parsedBankId)) {
    return res.status(400).json({ error: "Gecersiz bank ID" });
  }

  const result = await bankService.createTransaction({
    ...req.body,
    bankId: parsedBankId,
  });

  if (result.status === "SUCCESS") {
    return res.status(201).json({ transaction: result.transaction });
  }

  if (result.error === "Bank hesabi bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const transferBetweenBanks = async (req: Request, res: Response) => {
  const { bankId } = req.params as { bankId: string };
  const parsedSourceBankId = parseInt(bankId);

  if (Number.isNaN(parsedSourceBankId)) {
    return res.status(400).json({ error: "Gecersiz bank ID" });
  }

  const result = await bankService.transfer({
    ...req.body,
    sourceBankId: parsedSourceBankId,
  });

  if (result.status === "SUCCESS") {
    return res.status(201).json({
      sourceBank: result.sourceBank,
      targetBank: result.targetBank,
      sourceTransaction: result.sourceTransaction,
      targetTransaction: result.targetTransaction,
    });
  }

  if (result.error === "Bank hesabi bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const getBankTransactions = async (req: Request, res: Response) => {
  const { bankId } = req.params as { bankId: string };
  const { startDate, endDate } = req.query as {
    startDate?: string;
    endDate?: string;
  };
  const parsedBankId = parseInt(bankId);

  if (Number.isNaN(parsedBankId)) {
    return res.status(400).json({ error: "Gecersiz bank ID" });
  }

  const result = await bankService.getTransactions({
    bankId: parsedBankId,
    startDate,
    endDate,
  });

  if (result.status === "SUCCESS") {
    return res.json({ transactions: result.transactions });
  }

  if (
    result.error === "Gecersiz baslangic tarihi" ||
    result.error === "Gecersiz bitis tarihi" ||
    result.error === "Baslangic tarihi bitis tarihinden buyuk olamaz"
  ) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const updateBankTransaction = async (req: Request, res: Response) => {
  const { bankId, txId } = req.params as { bankId: string; txId: string };
  const parsedBankId = parseInt(bankId);
  const parsedTxId = parseInt(txId);

  if (Number.isNaN(parsedBankId) || Number.isNaN(parsedTxId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await bankService.updateTransaction(
    parsedTxId,
    parsedBankId,
    req.body,
  );

  if (result.status === "SUCCESS") {
    return res.json({ transaction: result.transaction });
  }

  if (result.error === "Islem bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const deleteBankTransaction = async (req: Request, res: Response) => {
  const { bankId, txId } = req.params as { bankId: string; txId: string };
  const parsedBankId = parseInt(bankId);
  const parsedTxId = parseInt(txId);

  if (Number.isNaN(parsedBankId) || Number.isNaN(parsedTxId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await bankService.deleteTransaction(parsedTxId, parsedBankId);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Islem silindi" });
  }

  if (result.error === "Islem bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};
