import { Request, Response } from "express";
import { CategoryService } from "../service/category.service";
import { CategoryStatus } from "../enums/category.enums";

const categoryService = new CategoryService();

export const createCategory = async (req: Request, res: Response) => {
  const result = await categoryService.create(req.body);
  if (result.status === CategoryStatus.SUCCESS) {
    res
      .status(201)
      .json({ message: "Kategori oluşturuldu", category: result.category });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const findAllCategories = async (req: Request, res: Response) => {
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await categoryService.findAllByCompany(parsedCompanyId);
  if (result.status === CategoryStatus.SUCCESS) {
    res.json({ categories: result.categories });
  } else if (result.error === "Şirket bulunamadı") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const findParentCategories = async (req: Request, res: Response) => {
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await categoryService.findParentsByCompany(parsedCompanyId);
  if (result.status === CategoryStatus.SUCCESS) {
    res.json({ categories: result.categories });
  } else if (result.error === "Şirket bulunamadı") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const findChildCategories = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedId = parseInt(id);
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedId) || Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "Geçersiz parametre" });
  }

  const result = await categoryService.findChildrenByParent(
    parsedCompanyId,
    parsedId,
  );
  if (result.status === CategoryStatus.SUCCESS) {
    res.json({ categories: result.categories });
  } else if (
    result.error === "Şirket bulunamadı" ||
    result.error === "Ust kategori bulunamadı"
  ) {
    res.status(404).json({ error: result.error });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Geçersiz kategori ID" });
  }

  const result = await categoryService.update(parsedId, req.body);
  if (result.status === CategoryStatus.SUCCESS) {
    res.json({ message: "Kategori güncellendi", category: result.category });
  } else if (result.error === "Kategori bulunamadı") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedId = parseInt(id);
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Geçersiz kategori ID" });
  }

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await categoryService.delete(parsedId, parsedCompanyId);
  if (result.status === CategoryStatus.SUCCESS) {
    res.json({ message: "Kategori silindi" });
  } else if (result.error === "Kategori bulunamadı") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(400).json({ error: result.error });
  }
};
