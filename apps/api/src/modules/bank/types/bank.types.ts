export interface BankServiceResult {
  status: "SUCCESS" | "ERROR";
  error?: string;
  bank?: unknown;
  banks?: unknown[];
  selectedBankId?: number | null;
  transaction?: unknown;
  transactions?: unknown[];
  sourceBank?: unknown;
  targetBank?: unknown;
  sourceTransaction?: unknown;
  targetTransaction?: unknown;
}
