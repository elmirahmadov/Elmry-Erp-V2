export interface TillCreateDto {
  name: string;
  companyId: number;
}

export interface TillUpdateDto {
  name?: string;
  balance?: number;
  status?: string;
  companyId: number;
}

export interface TillListDto {
  branchId: number;
  companyId: number;
}

export interface TillOverviewDto {
  branchId: number;
  companyId: number;
  tillId?: number;
  startDate?: string;
  endDate?: string;
}

export interface TillTransactionCreateDto {
  tillId: number;
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
  carrierName?: string;
  orderNumber?: string;
}

export interface TillTransactionListDto {
  tillId: number;
  startDate?: string;
  endDate?: string;
}

export interface TillTransferCreateDto {
  sourceTillId: number;
  targetTillId: number;
  companyId: number;
  amount: number;
  description?: string;
}
