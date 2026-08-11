export type AuthResponse = {
  status: string;
  token?: string;
  user?: any;
  error?: string;
};

export type UserPayload = {
  userId: number;
  companyId: number;
  role: string;
};
