import { ENDPOINTS } from "../../services/EndpointResources.g";
import {
  buildApiUrl,
  fetchNoCache,
  handleApiResponse,
} from "../utils/fetch.utils";

export interface Bank {
  id: number;
  name: string;
  companyId: number;
  accountNumber?: string | null;
  iban?: string | null;
  balance: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  branches?: Array<{
    branch: { id: number; name: string };
  }>;
}

export interface BankTransaction {
  id: number;
  bankId: number;
  type: "medaxil" | "mexaric" | "gider" | "alis_iade" | "satis_iade";
  amount: number;
  description?: string;
  counterpartyType?: "supplier" | "customer" | "bank";
  counterpartyId?: number;
  counterpartyName?: string;
  referenceNumber?: string;
  category?: string;
  paymentMethod?: string;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransferResult {
  sourceBank: Bank;
  targetBank: Bank;
  sourceTransaction: BankTransaction;
  targetTransaction: BankTransaction;
}

export interface BankOverview {
  banks: Bank[];
  transactions: BankTransaction[];
  selectedBankId: number | null;
}

interface FetchBankTransactionsParams {
  [key: string]: string | number | boolean | null | undefined;
  startDate?: string;
  endDate?: string;
}

interface FetchBankOverviewParams {
  [key: string]: string | number | boolean | null | undefined;
  startDate?: string;
  endDate?: string;
  branchId: number;
  companyId: number;
  bankId?: number;
}

const inFlightBankRequests = new Map<string, Promise<Bank[]>>();
const inFlightTransactionRequests = new Map<
  string,
  Promise<BankTransaction[]>
>();
const inFlightOverviewRequests = new Map<string, Promise<BankOverview>>();

export async function fetchBanks(companyId: number, branchId?: number) {
  const url = buildApiUrl(ENDPOINTS.BANKS.BASE, {
    companyId,
    ...(branchId ? { branchId } : {}),
  });
  const inFlight = inFlightBankRequests.get(url);

  if (inFlight) {
    return inFlight;
  }

  const request = fetchNoCache(url)
    .then((response: Response) =>
      handleApiResponse<{ banks?: Bank[] }>(response, "Banklar getirilemedi"),
    )
    .then((data: { banks?: Bank[] }) => data.banks || [])
    .finally(() => {
      inFlightBankRequests.delete(url);
    });

  inFlightBankRequests.set(url, request);
  return request;
}

export async function createBank(
  name: string,
  companyId: number,
  extra?: { accountNumber?: string; iban?: string },
) {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.BANKS.BASE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, companyId, ...extra }),
  });
  const result = await handleApiResponse<{ bank: Bank }>(
    response,
    "Bank olusturulamadi",
  );
  return result.bank;
}

export async function deleteBank(id: number, companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.BANKS.BASE}/${id}`, {
      companyId,
    }),
    { method: "DELETE" },
  );
  return handleApiResponse(response, "Bank silinemedi");
}

export async function updateBank(
  id: number,
  companyId: number,
  payload: {
    name?: string;
    accountNumber?: string | null;
    iban?: string | null;
    status?: "active" | "inactive";
  },
) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.BANKS.BASE}/${id}`),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, companyId }),
    },
  );
  const result = await handleApiResponse<{ bank: Bank }>(
    response,
    "Bank guncellenemedi",
  );
  return result.bank;
}

export async function updateBankTransaction(
  bankId: number,
  txId: number,
  payload: {
    description?: string;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
  },
) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.BANKS.BASE}/${bankId}/transactions/${txId}`),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await handleApiResponse<{ transaction: BankTransaction }>(
    response,
    "İşlem güncellenemedi",
  );
  return result.transaction;
}

export async function deleteBankTransaction(bankId: number, txId: number) {
  const response = await fetchNoCache(
    buildApiUrl(`${ENDPOINTS.BANKS.BASE}/${bankId}/transactions/${txId}`),
    {
      method: "DELETE",
    },
  );
  return handleApiResponse(response, "İşlem silinemedi");
}

export async function fetchBankTransactions(
  bankId: number,
  params?: FetchBankTransactionsParams,
) {
  const url = buildApiUrl(ENDPOINTS.BANKS.TRANSACTIONS(bankId), params);
  const inFlight = inFlightTransactionRequests.get(url);

  if (inFlight) {
    return inFlight;
  }

  const request = fetchNoCache(url)
    .then((response: Response) =>
      handleApiResponse<{ transactions?: BankTransaction[] }>(
        response,
        "İşlemler getirilemedi",
      ),
    )
    .then(
      (data: { transactions?: BankTransaction[] }) => data.transactions || [],
    )
    .finally(() => {
      inFlightTransactionRequests.delete(url);
    });

  inFlightTransactionRequests.set(url, request);
  return request;
}

export async function fetchBankOverview(params: FetchBankOverviewParams) {
  const url = buildApiUrl(ENDPOINTS.BANKS.OVERVIEW, params);
  const inFlight = inFlightOverviewRequests.get(url);

  if (inFlight) {
    return inFlight;
  }

  const request = fetchNoCache(url)
    .then((response: Response) =>
      handleApiResponse<BankOverview>(response, "Bank görünümü getirilemedi"),
    )
    .finally(() => {
      inFlightOverviewRequests.delete(url);
    });

  inFlightOverviewRequests.set(url, request);
  return request;
}

export async function createBankTransaction(
  bankId: number,
  payload: {
    companyId: number;
    type: "medaxil" | "mexaric" | "gider" | "alis_iade" | "satis_iade";
    amount: number;
    description?: string;
    counterpartyType?: "supplier" | "customer" | "bank";
    counterpartyId?: number;
    counterpartyName?: string;
    referenceNumber?: string;
    category?: string;
    paymentMethod?: string;
    currency?: string;
  },
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BANKS.TRANSACTIONS(bankId)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await handleApiResponse<{ transaction: BankTransaction }>(
    response,
    "İşlem kaydedilemedi",
  );
  return result.transaction;
}

export async function transferBetweenBanks(
  sourceBankId: number,
  payload: {
    companyId: number;
    targetBankId: number;
    amount: number;
    description?: string;
  },
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.BANKS.TRANSFER(sourceBankId)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await handleApiResponse<BankTransferResult>(
    response,
    "Transfer kaydedilemedi",
  );
  return result;
}
