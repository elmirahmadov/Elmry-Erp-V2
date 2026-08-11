export interface SupplierServiceResult {
  status: "SUCCESS" | "ERROR";
  supplier?: unknown;
  suppliers?: unknown[];
  error?: string;
}
