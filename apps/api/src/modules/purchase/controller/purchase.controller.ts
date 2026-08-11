import { Request, Response } from "express";
import { PurchaseService } from "../service/purchase.service";
import { getPaginationOptions } from "../../../core/utils/pagination";

const purchaseService = new PurchaseService();

export const getPurchaseModalData = async (req: Request, res: Response) => {
  const {
    companyId,
    productPage,
    productLimit,
    productSearch,
    productCategory,
    supplierPage,
    supplierLimit,
    supplierSearch,
    supplierCategory,
  } = req.query as {
    companyId?: string;
    productPage?: string;
    productLimit?: string;
    productSearch?: string;
    productCategory?: string;
    supplierPage?: string;
    supplierLimit?: string;
    supplierSearch?: string;
    supplierCategory?: string;
  };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await purchaseService.getModalData(parsedCompanyId, {
    productPage: Math.max(1, parseInt(productPage || "1", 10) || 1),
    productLimit: Math.max(
      1,
      Math.min(100, parseInt(productLimit || "12", 10) || 12),
    ),
    productSearch,
    productCategory,
    supplierPage: Math.max(1, parseInt(supplierPage || "1", 10) || 1),
    supplierLimit: Math.max(
      1,
      Math.min(100, parseInt(supplierLimit || "12", 10) || 12),
    ),
    supplierSearch,
    supplierCategory,
  });

  if (result.status === "SUCCESS") {
    return res.json(result.modalData);
  }

  if (result.error === "Sirket bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const createPurchaseVoucher = async (req: Request, res: Response) => {
  const result = await purchaseService.create(req.body);

  if (result.status === "SUCCESS") {
    return res.status(201).json({
      message: "Sened olusturuldu",
      voucher: result.voucher,
    });
  }

  return res.status(400).json({ error: result.error });
};

export const findAllPurchaseVouchers = async (req: Request, res: Response) => {
  const { companyId, search, type } = req.query as {
    companyId?: string;
    search?: string;
    type?: string;
  };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const pagination = getPaginationOptions(req.query);
  const result = await purchaseService.findPaginatedByCompany(
    parsedCompanyId,
    pagination,
    search,
    type,
  );

  if (result.status === "SUCCESS") {
    return res.json(result.paginatedVouchers);
  }

  if (result.error === "Sirket bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const deletePurchaseVoucher = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedId = parseInt(id);
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz sened ID" });
  }
  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await purchaseService.delete(parsedId, parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Sened silindi" });
  }

  if (result.error === "Sened bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const updatePurchaseVoucher = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz sened ID" });
  }

  const result = await purchaseService.update(parsedId, req.body);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Sened guncellendi", voucher: result.voucher });
  }

  if (result.error === "Sened bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const confirmPurchaseVoucher = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.body as { companyId?: number };
  const parsedId = parseInt(id);
  const parsedCompanyId = Number(companyId);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz sened ID" });
  }
  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await purchaseService.confirm(parsedId, parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Sened tesdiqlendi",
      voucher: result.voucher,
    });
  }

  return res.status(400).json({ error: result.error });
};

export const unconfirmPurchaseVoucher = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.body as { companyId?: number };
  const parsedId = parseInt(id);
  const parsedCompanyId = Number(companyId);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz sened ID" });
  }
  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await purchaseService.unconfirm(parsedId, parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Sened tesdiqi legv edildi",
      voucher: result.voucher,
    });
  }

  return res.status(400).json({ error: result.error });
};
