import { CategoryStatus } from "../enums/category.enums";

export interface CategoryResponse {
  id: number;
  name: string;
  companyCategoryId: number | null;
  companyId: number | null;
  parentId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryServiceResult {
  status: CategoryStatus;
  error?: string;
  category?: CategoryResponse | null;
  categories?: CategoryResponse[];
}
