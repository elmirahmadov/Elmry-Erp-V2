import { Request, Response } from "express";
import { SupplierService } from "../service/supplier.service";

const supplierService = new SupplierService();

export const createSupplier = async (req: Request, res: Response) => {
  const result = await supplierService.create(req.body);

  if (result.status === "SUCCESS") {
    return res
      .status(201)
      .json({ message: "Tedarikci olusturuldu", supplier: result.supplier });
  }

  return res.status(400).json({ error: result.error });
};

export const findAllSuppliers = async (req: Request, res: Response) => {
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await supplierService.findAllByCompany(parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({ suppliers: result.suppliers });
  }

  if (result.error === "Sirket bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const updateSupplier = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz tedarikci ID" });
  }

  const result = await supplierService.update(parsedId, req.body);

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Tedarikci guncellendi",
      supplier: result.supplier,
    });
  }

  if (result.error === "Tedarikci bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedId = parseInt(id);
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz tedarikci ID" });
  }

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await supplierService.delete(parsedId, parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Tedarikci silindi" });
  }

  if (result.error === "Tedarikci bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const addPurchaseToSupplier = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId, amount } = req.body as {
    companyId?: number;
    amount?: number;
  };
  const parsedId = parseInt(id);
  const parsedCompanyId = Number(companyId);
  const parsedAmount = Number(amount);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz tedarikci ID" });
  }
  if (Number.isNaN(parsedCompanyId) || !parsedCompanyId) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Gecerli bir tutar giriniz" });
  }

  const result = await supplierService.addPurchase(
    parsedId,
    parsedCompanyId,
    parsedAmount,
  );

  if (result.status === "SUCCESS") {
    return res.json({ message: "Alis eklendi", supplier: result.supplier });
  }

  if (result.error === "Tedarikci bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const addPaymentToSupplier = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId, amount, branchId, tillId } = req.body as {
    companyId?: number;
    amount?: number;
    branchId?: number;
    tillId?: number;
  };
  const parsedId = parseInt(id);
  const parsedCompanyId = Number(companyId);
  const parsedAmount = Number(amount);
  const parsedBranchId = Number(branchId);
  const parsedTillId = Number(tillId);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz tedarikci ID" });
  }
  if (Number.isNaN(parsedCompanyId) || !parsedCompanyId) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Gecerli bir tutar giriniz" });
  }
  if (Number.isNaN(parsedBranchId) || !parsedBranchId) {
    return res.status(400).json({ error: "branchId zorunludur" });
  }
  if (Number.isNaN(parsedTillId) || !parsedTillId) {
    return res.status(400).json({ error: "tillId zorunludur" });
  }

  const result = await supplierService.addPayment(
    parsedId,
    parsedCompanyId,
    parsedAmount,
    parsedBranchId,
    parsedTillId,
  );

  if (result.status === "SUCCESS") {
    return res.json({ message: "Odeme eklendi", supplier: result.supplier });
  }

  if (result.error === "Tedarikci bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};
