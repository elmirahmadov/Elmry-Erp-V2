export interface CategoryCreateDto {
  name: string;
  companyId: number;
  parentId?: number | null;
}

export interface CategoryUpdateDto {
  name: string;
  companyId: number;
  parentId?: number | null;
}
