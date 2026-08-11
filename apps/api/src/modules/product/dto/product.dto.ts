export interface ProductCreateDto {
  name: string;
  companyId: number;
  parentCategoryId: number;
  subCategoryId?: number | null;
  barcode: string;
  stockQuantity?: number | null;
  branchStockQuantity?: number | null;
  companyStockQuantity?: number | null;
  stockUnit?: string | null;
  salePrice: number;
  purchasePrice?: number | null;
  imageUrl?: string | null;
  isActive?: boolean;
  description?: string | null;
}

export interface ProductUpdateDto extends ProductCreateDto {}
