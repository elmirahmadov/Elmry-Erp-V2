export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    BOOTSTRAP: "/api/auth/bootstrap",
    REFRESH: "/api/auth/refresh",
  },
  COMPANIES: {
    BASE: "/api/companies",
    SETUP: "/api/companies/setup",
    BY_ID: (id: number) => `/api/companies/${id}`,
  },
  BRANCHES: {
    CREATE: "/api/branches/create",
    BY_COMPANY: (companyId: number) => `/api/branches/company/${companyId}`,
    WAREHOUSES: "/api/branches/warehouses",
  },
  TILLS: {
    BASE: "/api/tills",
  },
} as const;
