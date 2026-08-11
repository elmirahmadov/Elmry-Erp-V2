const getApiBaseUrl = (): string => {
  // Dev'de Vite proxy kullan (same-origin /api) — CORS sorunu olmaz
  if (import.meta.env.DEV) {
    return "";
  }

  let url = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  if (url.endsWith("/")) url = url.slice(0, -1);
  return url;
};

export const buildApiUrl = (
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
) => {
  let baseUrl = getApiBaseUrl();
  let apiPath = path.startsWith("/") ? path : `/${path}`;

  if (baseUrl.endsWith("/api") && apiPath.startsWith("/api")) {
    apiPath = apiPath.replace(/^\/api/, "");
  }

  // Relative URL (dev proxy)
  if (!baseUrl) {
    const url = new URL(apiPath, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        url.searchParams.set(key, String(value));
      });
    }
    return url.pathname + url.search;
  }

  const url = new URL(`${baseUrl}${apiPath}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

export const fetchNoCache = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  let token = "";
  try {
    token = localStorage.getItem("admin_token") || "";
  } catch {}
  const headers = new Headers(init?.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers, cache: "no-store" });
};

export const handleApiResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const message =
      (typeof data?.error === "string" && data.error) ||
      (typeof data?.message === "string" && data.message) ||
      fallbackMessage;
    throw new Error(message);
  }
  return (data ?? {}) as T;
};
