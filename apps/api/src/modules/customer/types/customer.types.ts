export type CustomerServiceResult = {
  status: "SUCCESS" | "ERROR";
  error?: string;
  customer?: unknown;
  customers?: unknown[];
};
