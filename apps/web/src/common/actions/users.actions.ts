import { ENDPOINTS } from "../../services/EndpointResources.g";
import {
  buildApiUrl,
  fetchNoCache,
  handleApiResponse,
} from "../utils/fetch.utils";

export interface CompanyUser {
  id: number;
  name: string | null;
  email: string;
  roleId: number;
  companyId: number;
  createdAt?: string;
  updatedAt?: string;
  branches?: Array<{
    branch: { id: number; name: string };
  }>;
}

export async function fetchUsersByCompany(
  companyId: number,
): Promise<CompanyUser[]> {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.USERS.BY_COMPANY(companyId)),
  );
  const data = await handleApiResponse<{ users?: CompanyUser[] }>(
    response,
    "Kullanicilar getirilemedi",
  );
  return data.users || [];
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  companyId: number;
  roleId: number;
}): Promise<CompanyUser> {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.USERS.CREATE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleApiResponse<{ user: CompanyUser }>(
    response,
    "Kullanici olusturulamadi",
  );
  return data.user;
}

export async function updateUser(
  id: number,
  payload: {
    name?: string;
    email?: string;
    password?: string;
    roleId?: number;
    companyId?: number;
  },
): Promise<CompanyUser> {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.USERS.BY_ID(id)), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await handleApiResponse<{ user: CompanyUser }>(
    response,
    "Kullanici guncellenemedi",
  );
  return data.user;
}
