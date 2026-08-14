export const generateBarcode = async (req: Request, res: Response) => {
  const { companyId } = req.body;
  if (!companyId) return res.status(400).json({ error: "companyId gerekli" });
  const barcode = await productService.generateUniqueBarcode(Number(companyId));
  res.json({ barcode });
};
import { Request, Response } from "express";
import { ProductService } from "../service/product.service";
import { ProductStatus } from "../enums/product.enums";

const productService = new ProductService();

export const createProduct = async (req: Request, res: Response) => {
  const result = await productService.create(req.body);
  if (result.status === ProductStatus.SUCCESS) {
    res
      .status(201)
      .json({ message: "Urun olusturuldu", product: result.product });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const findAllProducts = async (req: Request, res: Response) => {
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await productService.findAllByCompany(parsedCompanyId);
  if (result.status === ProductStatus.SUCCESS) {
    res.json({ products: result.products });
  } else if (result.error === "Sirket bulunamadi") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  const { companyId, id, name, barcode, q } = req.query as {
    companyId?: string;
    id?: string;
    name?: string;
    barcode?: string;
    q?: string;
  };

  const parsedCompanyId = parseInt(companyId || "");
  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const hasId = typeof id === "string" && id.trim() !== "";
  const parsedId = hasId ? parseInt(id as string) : undefined;
  if (hasId && Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "id sayisal olmali" });
  }

  const normalizedName = name?.trim();
  const normalizedBarcode = barcode?.trim();
  const normalizedQ = q?.trim();

  const result = await productService.searchByCompany(parsedCompanyId, {
    id: parsedId,
    name: normalizedName || undefined,
    barcode: normalizedBarcode || undefined,
    q: normalizedQ || undefined,
  });

  if (result.status === ProductStatus.SUCCESS) {
    return res.json({ products: result.products });
  }

  if (result.error === "Sirket bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz urun ID" });
  }

  const result = await productService.update(parsedId, req.body);
  if (result.status === ProductStatus.SUCCESS) {
    res.json({ message: "Urun guncellendi", product: result.product });
  } else if (result.error === "Urun bulunamadi") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedId = parseInt(id);
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz urun ID" });
  }

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await productService.delete(parsedId, parsedCompanyId);
  if (result.status === ProductStatus.SUCCESS) {
    res.json({ message: "Urun silindi" });
  } else if (result.error === "Urun bulunamadi") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(400).json({ error: result.error });
  }
};
