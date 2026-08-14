import { ENDPOINTS } from "../../services/EndpointResources.g";
import {
  buildApiUrl,
  fetchNoCache,
  handleApiResponse,
} from "../utils/fetch.utils";

export interface Till {
  id: number;
  name: string;
  companyId: number;
  balance: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  branches?: Array<{
    branch: { id: number; name: string };
  }>;
}

export interface TillTransaction {
  id: number;
  tillId: number;
  type: "medaxil" | "mexaric" | "gider" | "alis_iade" | "satis_iade";
  amount: number;
  description?: string;
  counterpartyType?: "supplier" | "customer" | "till";
  counterpartyId?: number;
  counterpartyName?: string;
  referenceNumber?: string;
  category?: string;
  paymentMethod?: string;
  currency?: string;
  carrierName?: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TillTransferResult {
  sourceTill: Till;
  targetTill: Till;
  sourceTransaction: TillTransaction;
  targetTransaction: TillTransaction;
}

export interface TillOverview {
  tills: Till[];
  transactions: TillTransaction[];
  selectedTillId: number | null;
}

interface FetchTillTransactionsParams {
  [key: string]: string | number | boolean | null | undefined;
  startDate?: string;
  endDate?: string;
}

interface FetchTillOverviewParams {
  [key: string]: string | number | boolean | null | undefined;
  startDate?: string;
  endDate?: string;
  branchId: number;
  companyId: number;
  tillId?: number;
}

const inFlightTillRequests = new Map<string, Promise<Till[]>>();
const inFlightTransactionRequests = new Map<
  string,
  Promise<TillTransaction[]>
>();
const inFlightOverviewRequests = new Map<string, Promise<TillOverview>>();

export async function fetchTills(companyId: number, branchId?: number) {
  const url = buildApiUrl(ENDPOINTS.TILLS.BASE, {
    companyId,
    ...(branchId ? { branchId } : {}),
  });
  const inFlight = inFlightTillRequests.get(url);

  if (inFlight) {
    return inFlight;
  }

  const request = fetchNoCache(url)
    .then((response: Response) =>
      handleApiResponse<{ tills?: Till[] }>(response, "Kasalar getirilemedi"),
    )
    .then((data: { tills?: Till[] }) => data.tills || [])
    .finally(() => {
      inFlightTillRequests.delete(url);
    });

  inFlightTillRequests.set(url, request);
  return request;
}

export async function createTill(name: string, companyId: number) {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.TILLS.BASE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, companyId }),
  });
  const result = await handleApiResponse<{ till: Till }>(
    response,
    "Kassa olusturulamadi",
  );
  return result.till;
}

export async function deleteTill(id: number, companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.TILLS.BASE}/${id}`, {
      companyId,
    }),
    { method: "DELETE" },
  );
  return handleApiResponse(response, "Kassa silinemedi");
}

export async function updateTill(
  id: number,
  companyId: number,
  payload: { name?: string; status?: "active" | "inactive" },
) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.TILLS.BASE}/${id}`),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, companyId }),
    },
  );
  const result = await handleApiResponse<{ till: Till }>(
    response,
    "Kassa guncellenemedi",
  );
  return result.till;
}

export async function updateTillTransaction(
  tillId: number,
  txId: number,
  payload: {
    description?: string;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
    carrierName?: string;
    orderNumber?: string;
  },
) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.TILLS.BASE}/${tillId}/transactions/${txId}`),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await handleApiResponse<{ transaction: TillTransaction }>(
    response,
    "İşlem güncellenemedi",
  );
  return result.transaction;
}

export async function deleteTillTransaction(
  tillId: number,
  txId: number,
) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.TILLS.BASE}/${tillId}/transactions/${txId}`),
    {
      method: "DELETE",
    },
  );
  return handleApiResponse(response, "İşlem silinemedi");
}

export async function fetchTillTransactions(
  tillId: number,
  params?: FetchTillTransactionsParams,
) {
  const url = buildApiUrl(ENDPOINTS.TILLS.TRANSACTIONS(tillId), params);
  const inFlight = inFlightTransactionRequests.get(url);

  if (inFlight) {
    return inFlight;
  }

  const request = fetchNoCache(url)
    .then((response: Response) =>
      handleApiResponse<{ transactions?: TillTransaction[] }>(
        response,
        "İşlemler getirilemedi",
      ),
    )
    .then((data: { transactions?: TillTransaction[] }) => data.transactions || [])
    .finally(() => {
      inFlightTransactionRequests.delete(url);
    });

  inFlightTransactionRequests.set(url, request);
  return request;
}

export async function fetchTillOverview(params: FetchTillOverviewParams) {
  const url = buildApiUrl(ENDPOINTS.TILLS.OVERVIEW, params);
  const inFlight = inFlightOverviewRequests.get(url);

  if (inFlight) {
    return inFlight;
  }

  const request = fetchNoCache(url)
    .then((response: Response) =>
      handleApiResponse<TillOverview>(response, "Kassa görünümü getirilemedi"),
    )
    .finally(() => {
      inFlightOverviewRequests.delete(url);
    });

  inFlightOverviewRequests.set(url, request);
  return request;
}

export async function createTillTransaction(
  tillId: number,
  payload: {
    companyId: number;
    type: "medaxil" | "mexaric" | "gider" | "alis_iade" | "satis_iade";
    amount: number;
    description?: string;
    counterpartyType?: "supplier" | "customer" | "till";
    counterpartyId?: number;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
    carrierName?: string;
    orderNumber?: string;
  },
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.TILLS.TRANSACTIONS(tillId)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await handleApiResponse<{ transaction: TillTransaction }>(
    response,
    "İşlem kaydedilemedi",
  );
  return result.transaction;
}

export async function transferBetweenTills(
  sourceTillId: number,
  payload: {
    companyId: number;
    targetTillId: number;
    amount: number;
    description?: string;
  },
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.TILLS.TRANSFER(sourceTillId)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await handleApiResponse<TillTransferResult>(
    response,
    "Transfer kaydedilemedi",
  );
  return result;
}
