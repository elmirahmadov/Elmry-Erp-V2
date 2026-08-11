import { ProductStatus } from "../enums/product.enums";

export interface ProductResponse {
  id: number;
  name: string;
  barcode: string;
  stockQuantity: number;
  branchStockQuantity?: number;
  companyStockQuantity?: number;
  stockUnit: string;
  description: string | null;
  salePrice: number;
  purchasePrice: number | null;
  imageUrl: string | null;
  isActive: boolean;
  companyId: number;
  parentCategoryId: number;
  subCategoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductServiceResult {
  status: ProductStatus;
  error?: string;
  product?: ProductResponse | null;
  products?: ProductResponse[];
}
