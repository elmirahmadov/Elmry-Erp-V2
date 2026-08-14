import { ENDPOINTS } from "../../services/EndpointResources.g";
import {
  buildApiUrl,
  fetchNoCache,
  handleApiResponse,
} from "../utils/fetch.utils";

export interface Branch {
  id: number;
  name: string;
  companyId: number;
}

export interface WarehouseBranchLink {
  id: number;
  name: string;
}

export interface Warehouse {
  id: number;
  name: string;
  companyId: number;
  createdAt?: string;
  updatedAt?: string;
  branches?: Array<{
    branch: WarehouseBranchLink;
  }>;
}

export interface BranchDetail extends Branch {
  warehouses: Warehouse[];
  tills: Array<{
    id: number;
    name: string;
    companyId: number;
    balance: number;
    status: string;
  }>;
  banks: Array<{
    id: number;
    name: string;
    companyId: number;
    balance: number;
    status: string;
  }>;
  users: Array<{
    id: number;
    name: string | null;
    email: string;
    roleId: number;
    companyId: number;
  }>;
  warehouseIds: number[];
  tillIds: number[];
  bankIds: number[];
  userIds: number[];
}

export async function fetchBranches(companyId: number): Promise<Branch[]> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.BY_COMPANY(companyId)),
  );
  const data = await handleApiResponse<{ branches?: Branch[] }>(
    response,
    "Filiallar getirilemedi",
  );
  return data.branches || [];
}

export async function createBranch(
  name: string,
  companyId: number,
): Promise<Branch> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.CREATE),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, companyId }),
    },
  );
  const data = await handleApiResponse<{ branch: Branch }>(
    response,
    "Sube olusturulamadi",
  );
  return data.branch;
}

export async function fetchBranchDetail(
  branchId: number,
  companyId: number,
): Promise<BranchDetail> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.BY_ID(branchId), { companyId }),
  );
  const data = await handleApiResponse<{ branch: BranchDetail }>(
    response,
    "Sube detayi getirilemedi",
  );
  return data.branch;
}

export async function fetchWarehousesByCompany(
  companyId: number,
): Promise<Warehouse[]> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.WAREHOUSES, { companyId }),
  );
  const data = await handleApiResponse<{ warehouses?: Warehouse[] }>(
    response,
    "Anbarlar getirilemedi",
  );
  return data.warehouses || [];
}

export async function fetchWarehousesByBranch(
  branchId: number,
  companyId: number,
): Promise<Warehouse[]> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.WAREHOUSES_BY_BRANCH(branchId), {
      companyId,
    }),
  );

  const data = await handleApiResponse<{ warehouses?: Warehouse[] }>(
    response,
    "Anbarlar getirilemedi",
  );

  return data.warehouses || [];
}

export async function createWarehouse(
  name: string,
  companyId: number,
): Promise<Warehouse> {
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

export async function setBranchWarehouses(
  branchId: number,
  companyId: number,
  warehouseIds: number[],
): Promise<BranchDetail> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.WAREHOUSES_BY_BRANCH(branchId)),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, warehouseIds }),
    },
  );
  const data = await handleApiResponse<{ branch: BranchDetail }>(
    response,
    "Sube anbarlari guncellenemedi",
  );
  return data.branch;
}

export async function setBranchTills(
  branchId: number,
  companyId: number,
  tillIds: number[],
): Promise<BranchDetail> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.TILLS_BY_BRANCH(branchId)),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, tillIds }),
    },
  );
  const data = await handleApiResponse<{ branch: BranchDetail }>(
    response,
    "Sube kasalari guncellenemedi",
  );
  return data.branch;
}

export async function setBranchBanks(
  branchId: number,
  companyId: number,
  bankIds: number[],
): Promise<BranchDetail> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.BANKS_BY_BRANCH(branchId)),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, bankIds }),
    },
  );
  const data = await handleApiResponse<{ branch: BranchDetail }>(
    response,
    "Sube banklari guncellenemedi",
  );
  return data.branch;
}

export async function setBranchUsers(
  branchId: number,
  companyId: number,
  userIds: number[],
): Promise<BranchDetail> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BRANCHES.USERS_BY_BRANCH(branchId)),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, userIds }),
    },
  );
  const data = await handleApiResponse<{ branch: BranchDetail }>(
    response,
    "Sube kullanicilari guncellenemedi",
  );
  return data.branch;
}
