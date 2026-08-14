import { ENDPOINTS } from "../../services/EndpointResources";
import { buildApiUrl, fetchNoCache, handleApiResponse } from "../utils/fetch.utils";

export interface Company {
  id: number;
  name: string;
  ownerName: string;
  ownerSurname: string;
  birthDate: string;
  phone: string;
  extraPhone?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Branch {
  id: number;
  name: string;
  companyId: number;
}

export interface Warehouse {
  id: number;
  name: string;
  companyId: number;
  branches?: Array<{ branch: { id: number; name: string } }>;
}

export interface Till {
  id: number;
  name: string;
  companyId: number;
  balance: number;
  status: string;
  branches?: Array<{ branch: { id: number; name: string } }>;
}

export interface Bank {
  id: number;
  name: string;
  companyId: number;
  accountNumber?: string | null;
  iban?: string | null;
  balance: number;
  status: string;
  branches?: Array<{ branch: { id: number; name: string } }>;
}

export type CompanyPayload = {
  name: string;
  ownerName: string;
  ownerSurname: string;
  birthDate: string;
  phone: string;
  extraPhone?: string;
  email?: string;
  imageUrl?: string;
};

export async function fetchCompanies() {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.COMPANIES.BASE));
  const data = await handleApiResponse<{ companies?: Company[] }>(
    response,
    "Sirketler getirilemedi",
  );
  return data.companies || [];
}

export async function fetchCompany(id: number) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.COMPANIES.BY_ID(id)),
  );
  const data = await handleApiResponse<{ company: Company }>(
    response,
    "Sirket getirilemedi",
  );
  return data.company;
}

export async function setupCompany(payload: CompanyPayload) {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.COMPANIES.SETUP), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleApiResponse<{ company: Company }>(
    response,
    "Sirket olusturulamadi",
  );
  return data.company;
}

export async function updateCompany(
  id: number,
  payload: Partial<CompanyPayload>,
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.COMPANIES.BY_ID(id)),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const data = await handleApiResponse<{ company: Company }>(
    response,
    "Sirket guncellenemedi",
  );
  return data.company;
}

export async function fetchBranches(companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.BY_COMPANY(companyId)),
  );
  const data = await handleApiResponse<{ branches?: Branch[] }>(
    response,
    "Subeler getirilemedi",
  );
  return data.branches || [];
}

export async function createBranch(name: string, companyId: number) {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.BRANCHES.CREATE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, companyId }),
  });
  const data = await handleApiResponse<{ branch: Branch }>(
    response,
    "Sube olusturulamadi",
  );
  return data.branch;
}

export async function fetchWarehouses(companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.WAREHOUSES, { companyId }),
  );
  const data = await handleApiResponse<{ warehouses?: Warehouse[] }>(
    response,
    "Anbarlar getirilemedi",
  );
  return data.warehouses || [];
}

export async function createWarehouse(name: string, companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.WAREHOUSES),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, companyId }),
    },
  );
  const data = await handleApiResponse<{ warehouse: Warehouse }>(
    response,
    "Anbar olusturulamadi",
  );
  return data.warehouse;
}

export async function fetchTills(companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.TILLS.BASE, { companyId }),
  );
  const data = await handleApiResponse<{ tills?: Till[] }>(
    response,
    "Kasalar getirilemedi",
  );
  return data.tills || [];
}

export async function createTill(name: string, companyId: number) {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.TILLS.BASE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, companyId }),
  });
  const data = await handleApiResponse<{ till: Till }>(
    response,
    "Kassa olusturulamadi",
  );
  return data.till;
}

export async function fetchBanks(companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BANKS.BASE, { companyId }),
  );
  const data = await handleApiResponse<{ banks?: Bank[] }>(
    response,
    "Banklar getirilemedi",
  );
  return data.banks || [];
}

export async function createBank(name: string, companyId: number) {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.BANKS.BASE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, companyId }),
  });
  const data = await handleApiResponse<{ bank: Bank }>(
    response,
    "Bank olusturulamadi",
  );
  return data.bank;
}
