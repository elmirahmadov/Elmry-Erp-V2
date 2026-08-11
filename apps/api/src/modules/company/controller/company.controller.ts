import { Request, Response } from "express";
import { CompanyService } from "../service/company.service";
import { BranchService } from "../../branch/service/branch.service";

const companyService = new CompanyService();
const branchService = new BranchService();

export const setupCompany = async (req: Request, res: Response) => {
  const result = await companyService.setup(req.body);
  if (result.status === "SUCCESS") {
    res
      .status(201)
      .json({ message: "Şirket kuruldu", company: result.company });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const findAllCompanies = async (req: Request, res: Response) => {
  const result = await companyService.findAll();
  if (result.status === "SUCCESS") {
    res.json({ companies: result.companies });
  } else {
    res.status(500).json({ error: result.error });
  }
};

export const findCompanyById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await companyService.findById(id);
  if (result.status === "SUCCESS") {
    res.json({ company: result.company });
  } else {
    res.status(404).json({ error: result.error });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await companyService.update(id, req.body);
  if (result.status === "SUCCESS") {
    res.json({ message: "Sirket guncellendi", company: result.company });
  } else if (result.error === "Sirket bulunamadi") {
    res.status(404).json({ error: result.error });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const getCompanyWithBranches = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const companyResult = await companyService.findById(id);
  if (companyResult.status !== "SUCCESS") {
    return res.status(404).json({ error: companyResult.error });
  }

  const branchesResult = await branchService.findAllByCompany(id);
  if (branchesResult.status !== "SUCCESS") {
    return res.status(500).json({ error: branchesResult.error });
  }

  res.json({
    companyName: companyResult.company!.name,
    branches: branchesResult.branches!.map((b) => b.name),
  });
};
