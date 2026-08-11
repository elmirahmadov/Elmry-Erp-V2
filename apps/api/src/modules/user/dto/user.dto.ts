export interface UserCreateDto {
  name: string;
  email: string;
  password: string;
  companyId: number;
  roleId: number;
  permissionNames?: string[];
}
