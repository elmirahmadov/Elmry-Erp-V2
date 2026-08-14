import { ENDPOINTS } from "../../services/EndpointResources.g";
import type { Customer } from "../../pages/customers/types/customer.types";
import {
  buildApiUrl,
  fetchNoCache,
  handleApiResponse,
} from "../utils/fetch.utils";

const inFlightCustomerRequests = new Map<string, Promise<Customer[]>>();

export async function fetchCustomers(companyId: number) {
  const url = buildApiUrl(ENDPOINTS.CUSTOMERS.BASE, { companyId });
  const inFlight = inFlightCustomerRequests.get(url);
  if (inFlight) return inFlight;

  const request = fetchNoCache(url)
    .then((response) =>
      handleApiResponse<{ customers?: Customer[] }>(
        response,
        "Müştərilər gətirilə bilmədi",
      ),
    )
    .then((data) => data.customers || [])
    .finally(() => {
      inFlightCustomerRequests.delete(url);
    });

  inFlightCustomerRequests.set(url, request);
  return request;
}

export async function createCustomer(
  data: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxNumber?: string;
    status?: "active" | "inactive";
    companyId: number;
  },
) {
  const response = await fetchNoCache(buildApiUrl(ENDPOINTS.CUSTOMERS.BASE), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await handleApiResponse<{ customer: Customer }>(
    response,
    "Müştəri yaradıla bilmədi",
  );
  return result.customer;
}

export async function updateCustomer(
  id: number,
  data: Partial<Customer> & { companyId: number },
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.CUSTOMERS.BY_ID(id)),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  const result = await handleApiResponse<{ customer: Customer }>(
    response,
    "Müştəri yenilənə bilmədi",
  );
  return result.customer;
}

export async function deleteCustomer(id: number, companyId: number) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.CUSTOMERS.BY_ID(id), { companyId }),
    { method: "DELETE" },
  );
  return handleApiResponse(response, "Müştəri silinə bilmədi");
}

export async function addCustomerDebt(
  id: number,
  companyId: number,
  amount: number,
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.CUSTOMERS.DEBT_BY_ID(id)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, amount }),
    },
  );
  const result = await handleApiResponse<{ customer: Customer }>(
    response,
    "Borc yazıla bilmədi",
  );
  return result.customer;
}

export async function addCustomerPaidSale(
  id: number,
  companyId: number,
  amount: number,
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.CUSTOMERS.SALE_BY_ID(id)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, amount }),
    },
  );
  const result = await handleApiResponse<{ customer: Customer }>(
    response,
    "Satış yazıla bilmədi",
  );
  return result.customer;
}

export async function addCustomerPayment(
  id: number,
  amount: number,
  companyId: number,
  branchId: number,
  tillId: number,
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.CUSTOMERS.PAYMENT_BY_ID(id)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, amount, branchId, tillId }),
    },
  );
  const result = await handleApiResponse<{ customer: Customer }>(
    response,
    "Ödəniş yazıla bilmədi",
  );
  return result.customer;
}

export async function recordCustomerPaymentTotals(
  id: number,
  companyId: number,
  amount: number,
) {
  const response = await fetchNoCache(
    buildApiUrl(ENDPOINTS.CUSTOMERS.PAYMENT_TOTALS_BY_ID(id)),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, amount }),
    },
  );
  const result = await handleApiResponse<{ customer: Customer }>(
    response,
    "Ödəniş yazıla bilmədi",
  );
  return result.customer;
}
