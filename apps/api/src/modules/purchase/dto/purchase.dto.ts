export interface PurchaseVoucherLineDto {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseVoucherCreateDto {
  serialNo: string;
  type: "alis" | "iade";
  branchName: string;
  warehouseName: string;
  supplierId: number;
  companyId: number;
  voucherDate: string;
  note?: string;
  status?: string;
  lines: PurchaseVoucherLineDto[];
}

export interface PurchaseVoucherUpdateDto extends PurchaseVoucherCreateDto {}
