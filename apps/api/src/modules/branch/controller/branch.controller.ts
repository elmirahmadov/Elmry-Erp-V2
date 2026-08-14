import { Request, Response } from "express";
import { BranchService } from "../service/branch.service";

const branchService = new BranchService();

export const createBranch = async (req: Request, res: Response) => {
  const result = await branchService.create(req.body);
  if (result.status === "SUCCESS") {
    res
      .status(201)
      .json({ message: "Filial olusturuldu", branch: result.branch });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const findAllBranchesByCompany = async (req: Request, res: Response) => {
  const { companyId } = req.params as { companyId: string };
  const result = await branchService.findAllByCompany(companyId);
  if (result.status === "SUCCESS") {
    res.json({ branches: result.branches });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const findBranchById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (!Number.isNaN(parsedCompanyId)) {
    const detail = await branchService.findDetail(Number(id), parsedCompanyId);
    if (detail.status === "SUCCESS") {
      return res.json({ branch: detail.branch });
    }
    return res.status(404).json({ error: detail.error });
  }

  const result = await branchService.findById(id);
  if (result.status === "SUCCESS") {
    res.json({ branch: result.branch });
  } else {
    res.status(404).json({ error: result.error });
  }
};

export const createWarehouse = async (req: Request, res: Response) => {
  const result = await branchService.createWarehouse(req.body);

  if (result.status === "SUCCESS") {
    return res.status(201).json({
      message: "Depo olusturuldu",
      warehouse: result.warehouse,
    });
  }

  return res.status(400).json({ error: result.error });
};

export const findWarehousesByCompany = async (req: Request, res: Response) => {
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  const result = await branchService.findWarehousesByCompany(parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({ warehouses: result.warehouses });
  }

  return res.status(400).json({ error: result.error });
};

export const findWarehousesByBranch = async (req: Request, res: Response) => {
  const { branchId } = req.params as { branchId: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedBranchId = parseInt(branchId);
  const parsedCompanyId = parseInt(companyId || "");

  const result = await branchService.findWarehousesByBranch(
    parsedBranchId,
    parsedCompanyId,
  );

  if (result.status === "SUCCESS") {
    return res.json({ warehouses: result.warehouses });
  }

  return res.status(400).json({ error: result.error });
};

export const setBranchWarehouses = async (req: Request, res: Response) => {
  const { branchId } = req.params as { branchId: string };
  const companyId = Number(req.body?.companyId);
  const warehouseIds = Array.isArray(req.body?.warehouseIds)
    ? req.body.warehouseIds
    : [];

  const result = await branchService.setBranchWarehouses(
    Number(branchId),
    companyId,
    warehouseIds,
  );

  if (result.status === "SUCCESS") {
    return res.json({ branch: result.branch });
  }

  return res.status(400).json({ error: result.error });
};

export const setBranchTills = async (req: Request, res: Response) => {
  const { branchId } = req.params as { branchId: string };
  const companyId = Number(req.body?.companyId);
  const tillIds = Array.isArray(req.body?.tillIds) ? req.body.tillIds : [];

  const result = await branchService.setBranchTills(
    Number(branchId),
    companyId,
    tillIds,
  );

  if (result.status === "SUCCESS") {
    return res.json({ branch: result.branch });
  }

  return res.status(400).json({ error: result.error });
};

export const setBranchBanks = async (req: Request, res: Response) => {
  const { branchId } = req.params as { branchId: string };
  const companyId = Number(req.body?.companyId);
  const bankIds = Array.isArray(req.body?.bankIds) ? req.body.bankIds : [];

  const result = await branchService.setBranchBanks(
    Number(branchId),
    companyId,
    bankIds,
  );

  if (result.status === "SUCCESS") {
    return res.json({ branch: result.branch });
  }

  return res.status(400).json({ error: result.error });
};

export const setBranchUsers = async (req: Request, res: Response) => {
  const { branchId } = req.params as { branchId: string };
  const companyId = Number(req.body?.companyId);
  const userIds = Array.isArray(req.body?.userIds) ? req.body.userIds : [];

  const result = await branchService.setBranchUsers(
    Number(branchId),
    companyId,
    userIds,
  );

  if (result.status === "SUCCESS") {
    return res.json({ branch: result.branch });
  }

  return res.status(400).json({ error: result.error });
};
