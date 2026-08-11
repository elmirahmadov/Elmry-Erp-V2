import type { PurchaseVoucher, PurchaseVoucherLine } from "@elmry/database";

export interface PurchaseVoucherWithRelations extends PurchaseVoucher {
  lines: PurchaseVoucherLine[];
}

export interface PaginatedPurchaseVouchers {
  data: PurchaseVoucherWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseModalPaginatedSection<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseModalDataPayload {
  suppliers: PurchaseModalPaginatedSection<{
    id: number;
    name: string;
    status: string;
    totalPurchase: number;
  }>;
  products: PurchaseModalPaginatedSection<{
    id: number;
    name: string;
    barcode: string;
    stockQuantity: number;
    companyStockQuantity: number;
    stockUnit: string;
    purchasePrice: number | null;
    parentCategory: {
      name: string;
    } | null;
  }>;
  productCategories: Array<{
    name: string;
    count: number;
  }>;
  supplierCategories: Array<{
    name: string;
    count: number;
  }>;
  warehouses: Array<{
    id: number;
    name: string;
    companyId: number;
    branchId: number;
    branch: {
      id: number;
      name: string;
    };
  }>;
}

export interface PurchaseServiceResult {
  status: "SUCCESS" | "ERROR";
  error?: string;
  vouchers?: PurchaseVoucherWithRelations[];
  paginatedVouchers?: PaginatedPurchaseVouchers;
  voucher?: PurchaseVoucherWithRelations;
  modalData?: PurchaseModalDataPayload;
}
