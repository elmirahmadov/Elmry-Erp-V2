export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    BOOTSTRAP: "/api/auth/bootstrap",
    REFRESH: "/api/auth/refresh",
  },
  CATEGORIES: {
    BASE: "/api/categories",
    BY_ID: (id: number) => `/api/categories/${id}`,
  },
  PRODUCTS: {
    BASE: "/api/products",
    SEARCH: "/api/products/search",
    BY_ID: (id: number) => `/api/products/${id}`,
  },
  SUPPLIERS: {
    BASE: "/api/suppliers",
    BY_ID: (id: number) => `/api/suppliers/${id}`,
    PURCHASE_BY_ID: (id: number) => `/api/suppliers/${id}/purchase`,
    PAYMENT_BY_ID: (id: number) => `/api/suppliers/${id}/payment`,
  },
  PURCHASES: {
    BASE: "/api/purchases",
    MODAL_DATA: "/api/purchases/modal-data",
    BY_ID: (id: number) => `/api/purchases/${id}`,
    CONFIRM: (id: number) => `/api/purchases/${id}/confirm`,
    UNCONFIRM: (id: number) => `/api/purchases/${id}/unconfirm`,
  },
  TILLS: {
    BASE: "/api/tills",
    BY_BRANCH: (branchId: number) => `/api/tills?branchId=${branchId}`,
    OVERVIEW: "/api/tills/overview",
    TRANSACTIONS: (tillId: number) => `/api/tills/${tillId}/transactions`,
    TRANSFER: (tillId: number) => `/api/tills/${tillId}/transfer`,
  },
  BRANCHES: {
    CREATE: "/api/branches/create",
    BY_COMPANY: (companyId: number) => `/api/branches/company/${companyId}`,
    BY_ID: (id: number) => `/api/branches/${id}`,
    WAREHOUSES: "/api/branches/warehouses",
    WAREHOUSES_BY_BRANCH: (branchId: number) =>
      `/api/branches/${branchId}/warehouses`,
    TILLS_BY_BRANCH: (branchId: number) => `/api/branches/${branchId}/tills`,
    USERS_BY_BRANCH: (branchId: number) => `/api/branches/${branchId}/users`,
  },
  USERS: {
    CREATE: "/api/users/create",
    BY_COMPANY: (companyId: number) => `/api/users/company/${companyId}`,
    BY_ID: (id: number) => `/api/users/${id}`,
  },
} as const;
