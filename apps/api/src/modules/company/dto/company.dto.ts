export interface CompanySetupDto {
  name: string;
  ownerName: string;
  ownerSurname: string;
  birthDate: string;
  phone: string;
  extraPhone?: string;
  email?: string;
  imageUrl?: string;
}

export interface CompanyUpdateDto {
  name?: string;
  ownerName?: string;
  ownerSurname?: string;
  birthDate?: string;
  phone?: string;
  extraPhone?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}
