export interface CustomerCreateDto {
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  status?: string;
  companyId: number;
}

export interface CustomerUpdateDto {
  name?: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  status?: string;
  companyId: number;
}
