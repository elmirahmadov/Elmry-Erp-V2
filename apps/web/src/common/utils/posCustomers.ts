import type { Customer } from "../../pages/customers/types/customer.types";

export type PosCustomer = {
  id: number;
  name: string;
  phone?: string | null;
  debt: number;
};

export const RETAIL_CUSTOMER_ID = -1;
export const RETAIL_CUSTOMER_NAME = "Pərakəndə Satış";

export function isRetailCustomer(
  customer: PosCustomer | null | undefined,
): boolean {
  if (!customer) return true;
  return (
    customer.id === RETAIL_CUSTOMER_ID ||
    customer.name === RETAIL_CUSTOMER_NAME
  );
}

export function getRetailCustomer(): PosCustomer {
  return {
    id: RETAIL_CUSTOMER_ID,
    name: RETAIL_CUSTOMER_NAME,
    debt: 0,
  };
}

export function toPosCustomers(apiCustomers: Customer[]): PosCustomer[] {
  const retail = getRetailCustomer();
  const mapped = apiCustomers
    .filter((c) => c.status !== "inactive")
    .map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      debt: Number(c.debt) || 0,
    }));
  return [retail, ...mapped];
}
