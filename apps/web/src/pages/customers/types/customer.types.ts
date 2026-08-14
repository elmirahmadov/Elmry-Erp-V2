export interface Customer {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxNumber: string | null;
  status: "active" | "inactive";
  totalSales: number;
  totalReturn: number;
  totalPayment: number;
  debt: number;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormState {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  status: "active" | "inactive";
}

export const emptyCustomerForm = (): CustomerFormState => ({
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  taxNumber: "",
  status: "active",
});
