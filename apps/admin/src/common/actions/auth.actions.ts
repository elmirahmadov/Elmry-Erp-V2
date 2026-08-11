import { ENDPOINTS } from "../../services/EndpointResources";
import { buildApiUrl, fetchNoCache, handleApiResponse } from "../utils/fetch.utils";

export interface AuthUser {
  id: number | string;
  name: string | null;
  email: string;
  companyId: number;
  roleId: number;
}

export interface AuthBootstrapData {
  user: AuthUser;
  companyName: string | null;
}

export async function loginAction(payload: {
  companyName: string;
  email: string;
  password: string;
}) {
  const response = await fetch(buildApiUrl(ENDPOINTS.AUTH.LOGIN), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleApiResponse<{
    token: string;
    refreshToken: string;
    user?: AuthUser;
  }>(response, "Giris basarisiz");
}

export async function fetchAuthBootstrap() {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.AUTH.BOOTSTRAP));
  return handleApiResponse<AuthBootstrapData>(
    response,
    "Oturum bilgileri alinamadi",
  );
}
