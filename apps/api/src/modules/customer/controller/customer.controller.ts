import { Request, Response } from "express";
import { CustomerService } from "../service/customer.service";

const customerService = new CustomerService();

export const createCustomer = async (req: Request, res: Response) => {
  const result = await customerService.create(req.body);

  if (result.status === "SUCCESS") {
    return res
      .status(201)
      .json({ message: "Musteri olusturuldu", customer: result.customer });
  }

  return res.status(400).json({ error: result.error });
};

export const findAllCustomers = async (req: Request, res: Response) => {
  const { companyId } = req.query as { companyId?: string };
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await customerService.findAllByCompany(parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({ customers: result.customers });
  }

  if (result.error === "Sirket bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(500).json({ error: result.error });
};

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const parsedId = parseInt(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz musteri ID" });
  }

  const result = await customerService.update(parsedId, req.body);

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Musteri guncellendi",
      customer: result.customer,
    });
  }

  if (result.error === "Musteri bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId } = req.query as { companyId?: string };
  const parsedId = parseInt(id);
  const parsedCompanyId = parseInt(companyId || "");

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz musteri ID" });
  }

  if (Number.isNaN(parsedCompanyId)) {
    return res.status(400).json({ error: "companyId zorunludur" });
  }

  const result = await customerService.delete(parsedId, parsedCompanyId);

  if (result.status === "SUCCESS") {
    return res.json({ message: "Musteri silindi" });
  }

  if (result.error === "Musteri bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const addDebtToCustomer = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId, amount } = req.body as {
    companyId?: number;
    amount?: number;
  };
  const parsedId = parseInt(id);
  const parsedCompanyId = Number(companyId);
  const parsedAmount = Number(amount);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz musteri ID" });
  }

  const result = await customerService.addDebt(
    parsedId,
    parsedCompanyId,
    parsedAmount,
  );

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Borc eklendi",
      customer: result.customer,
    });
  }

  if (result.error === "Musteri bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const addPaidSaleToCustomer = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId, amount } = req.body as {
    companyId?: number;
    amount?: number;
  };
  const parsedId = parseInt(id);
  const result = await customerService.addPaidSale(
    parsedId,
    Number(companyId),
    Number(amount),
  );

  if (result.status === "SUCCESS") {
    return res.json({ message: "Satis yazildi", customer: result.customer });
  }
  if (result.error === "Musteri bulunamadi") {
    return res.status(404).json({ error: result.error });
  }
  return res.status(400).json({ error: result.error });
};

export const addPaymentToCustomer = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { companyId, amount, branchId, tillId } = req.body as {
    companyId?: number;
    amount?: number;
    branchId?: number;
    tillId?: number;
  };
  const parsedId = parseInt(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz musteri ID" });
  }

  const result = await customerService.addPayment(
    parsedId,
    Number(companyId),
    Number(amount),
    Number(branchId),
    Number(tillId),
  );

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Odeme eklendi",
      customer: result.customer,
    });
  }

  if (result.error === "Musteri bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};

export const recordCustomerPaymentTotals = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params as { id: string };
  const { companyId, amount } = req.body as {
    companyId?: number;
    amount?: number;
  };
  const parsedId = parseInt(id);

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Gecersiz musteri ID" });
  }

  const result = await customerService.recordPaymentTotals(
    parsedId,
    Number(companyId),
    Number(amount),
  );

  if (result.status === "SUCCESS") {
    return res.json({
      message: "Odeme kaydedildi",
      customer: result.customer,
    });
  }

  if (result.error === "Musteri bulunamadi") {
    return res.status(404).json({ error: result.error });
  }

  return res.status(400).json({ error: result.error });
};
