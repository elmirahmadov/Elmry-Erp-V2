export interface TillServiceResult {
  status: "SUCCESS" | "ERROR";
  error?: string;
  till?: unknown;
  tills?: unknown[];
  selectedTillId?: number | null;
  transaction?: unknown;
  transactions?: unknown[];
  sourceTill?: unknown;
  targetTill?: unknown;
  sourceTransaction?: unknown;
  targetTransaction?: unknown;
}
