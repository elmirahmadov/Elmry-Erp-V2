import { Request, Response } from "express";
import { TillService } from "../service/till.service";

const tillService = new TillService();

export const createTill = async (req: Request, res: Response) => {
  const result = await tillService.create(req.body);

  if (result.status === "SUCCESS") {
    return res
      .status(201)
      .json({ message: "Kassa olusturuldu", till: result.till });
  }

  return res.status(400).json({ error: result.error });
};

export const findTillsByBranchAndCompany = async (
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
    const result = await tillService.findAllByCompany(parsedCompanyId);
    if (result.status === "SUCCESS") {
      return res.json({ tills: result.tills });
    }
    return res.status(500).json({ error: result.error });
  }

  const parsedBranchId = parseInt(branchId);
  if (Number.isNaN(parsedBranchId)) {
    return res.status(400).json({ error: "branchId gecersiz" });
  }

  const result = await tillService.findAllByBranchAndCompany({
    branchId: parsedBranchId,
    companyId: parsedCompanyId,
  });

  if (result.status === "SUCCESS") {
    return res.json({ tills: result.tills });
  }

  if (result.error === "Sube bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const getTillOverview = async (req: Request, res: Response) => {
  const { branchId, companyId, tillId, startDate, endDate } = req.query as {
    branchId?: string;
    companyId?: string;
    tillId?: string;
    startDate?: string;
    endDate?: string;
  };

  const result = await tillService.getOverview({
    branchId: Number(branchId),
    companyId: Number(companyId),
    tillId: tillId ? Number(tillId) : undefined,
    startDate,
    endDate,
  });

  if (result.status === "SUCCESS") {
    return res.json({
      tills: result.tills,
      transactions: result.transactions,
      selectedTillId: result.selectedTillId,
    });
  }

  if (
    result.error === "branchId ve companyId zorunludur" ||
    result.error === "Gecersiz kassa ID" ||
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

export const updateTill = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);
  const companyId = Number(req.body?.companyId);

  if (Number.isNaN(parsedId) || Number.isNaN(companyId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await tillService.update(parsedId, companyId, req.body);

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Kassa guncellendi",
      till: result.till,
    });
  }

  if (result.error === "Kassa bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const deleteTill = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);
  const companyId = Number(
    (req.query as { companyId?: string }).companyId || req.body?.companyId,
  );

  if (Number.isNaN(parsedId) || Number.isNaN(companyId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await tillService.delete(parsedId, companyId);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Kassa silindi" });
  }

  if (result.error === "Kassa bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const createTillTransaction = async (req: Request, res: Response) => {
  const { tillId } = req.params as { tillId: string };
  const parsedTillId = parseInt(tillId);

  if (Number.isNaN(parsedTillId)) {
    return res.status(400).json({ error: "Gecersiz kassa ID" });
  }

  const result = await tillService.createTransaction({
    ...req.body,
    tillId: parsedTillId,
  });

  if (result.status === "SUCCESS") {
    return res.status(201).json({ transaction: result.transaction });
  }

  if (result.error === "Kassa bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const transferBetweenTills = async (req: Request, res: Response) => {
  const { tillId } = req.params as { tillId: string };
  const parsedSourceTillId = parseInt(tillId);

  if (Number.isNaN(parsedSourceTillId)) {
    return res.status(400).json({ error: "Gecersiz kassa ID" });
  }

  const result = await tillService.transfer({
    ...req.body,
    sourceTillId: parsedSourceTillId,
  });

  if (result.status === "SUCCESS") {
    return res.status(201).json({
      sourceTill: result.sourceTill,
      targetTill: result.targetTill,
      sourceTransaction: result.sourceTransaction,
      targetTransaction: result.targetTransaction,
    });
  }

  if (result.error === "Kassa bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const getTillTransactions = async (req: Request, res: Response) => {
  const { tillId } = req.params as { tillId: string };
  const { startDate, endDate } = req.query as {
    startDate?: string;
    endDate?: string;
  };
  const parsedTillId = parseInt(tillId);

  if (Number.isNaN(parsedTillId)) {
    return res.status(400).json({ error: "Gecersiz kassa ID" });
  }

  const result = await tillService.getTransactions({
    tillId: parsedTillId,
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

export const updateTillTransaction = async (req: Request, res: Response) => {
  const { tillId, txId } = req.params as { tillId: string; txId: string };
  const parsedTillId = parseInt(tillId);
  const parsedTxId = parseInt(txId);

  if (Number.isNaN(parsedTillId) || Number.isNaN(parsedTxId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await tillService.updateTransaction(parsedTxId, parsedTillId, req.body);

  if (result.status === "SUCCESS") {
    return res.json({ transaction: result.transaction });
  }

  if (result.error === "Islem bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const deleteTillTransaction = async (req: Request, res: Response) => {
  const { tillId, txId } = req.params as { tillId: string; txId: string };
  const parsedTillId = parseInt(tillId);
  const parsedTxId = parseInt(txId);

  if (Number.isNaN(parsedTillId) || Number.isNaN(parsedTxId)) {
    return res.status(400).json({ error: "Gecersiz ID bilgisi" });
  }

  const result = await tillService.deleteTransaction(parsedTxId, parsedTillId);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Islem silindi" });
  }

  if (result.error === "Islem bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};
