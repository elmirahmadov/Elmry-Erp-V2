export interface UserCreateDto {
  name: string;
  email: string;
  password: string;
  companyId: number;
  roleId: number;
  permissionNames?: string[];
  posBranchId?: number | null;
  posWarehouseId?: number | null;
  posTillId?: number | null;
  posBankId?: number | null;
}
