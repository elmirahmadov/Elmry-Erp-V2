export interface BankCreateDto {
  name: string;
  companyId: number;
  accountNumber?: string;
  iban?: string;
}

export interface BankUpdateDto {
  name?: string;
  accountNumber?: string | null;
  iban?: string | null;
  balance?: number;
  status?: string;
  companyId: number;
}

export interface BankListDto {
  branchId: number;
  companyId: number;
}

export interface BankOverviewDto {
  branchId: number;
  companyId: number;
  bankId?: number;
  startDate?: string;
  endDate?: string;
}

export interface BankTransactionCreateDto {
  bankId: number;
  companyId: number;
  type: "medaxil" | "mexaric" | "gider" | "alis_iade" | "satis_iade";
  amount: number;
  description?: string;
  counterpartyType?: "supplier" | "customer";
  counterpartyId?: number;
  counterpartyName?: string;
  referenceNumber?: string;
  category?: string;
  paymentMethod?: string;
  currency?: string;
}

export interface BankTransactionListDto {
  bankId: number;
  startDate?: string;
  endDate?: string;
}

export interface BankTransferCreateDto {
  sourceBankId: number;
  targetBankId: number;
  companyId: number;
  amount: number;
  description?: string;
}
