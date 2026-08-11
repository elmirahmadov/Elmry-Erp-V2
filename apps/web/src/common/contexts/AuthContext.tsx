"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AuthBootstrapData,
  AuthBranch,
  AuthUser,
  fetchAuthBootstrap,
} from "../actions/auth.actions";

interface AuthContextType {
  user: AuthUser | null;
  companyName: string | null;
  branches: AuthBranch[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthBootstrapData, token?: string) => void;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readAccessToken(): string | null {
  try {
    const fromStorage = localStorage.getItem("token");
    if (fromStorage) return fromStorage;
  } catch {
    /* ignore */
  }

  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || null
  );
}

function clearAuthStorage() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  } catch {
    /* ignore */
  }
  document.cookie = "token=; path=/; max-age=0";
  document.cookie = "refreshToken=; path=/; max-age=0";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [branches, setBranches] = useState<AuthBranch[]>([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(readAccessToken()));
  const mountedRef = useRef(true);
  const hydrateRequestId = useRef(0);

  const login = useCallback((data: AuthBootstrapData, _token?: string) => {
    if (!mountedRef.current) return;
    setUser(data.user);
    setCompanyName(data.companyName);
    setBranches(Array.isArray(data.branches) ? data.branches : []);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    if (!mountedRef.current) return;
    setUser(null);
    setCompanyName(null);
    setBranches([]);
    setIsLoading(false);
  }, []);

  const refreshSession = useCallback(async () => {
    const token = readAccessToken();
    if (!token) {
      if (mountedRef.current) {
        setUser(null);
        setCompanyName(null);
        setBranches([]);
        setIsLoading(false);
      }
      return false;
    }

    const requestId = ++hydrateRequestId.current;
    try {
      const bootstrap = await fetchAuthBootstrap();
      if (!mountedRef.current || requestId !== hydrateRequestId.current) {
        return false;
      }
      login(bootstrap, token);
      return true;
    } catch {
      if (!mountedRef.current || requestId !== hydrateRequestId.current) {
        return false;
      }
      clearAuthStorage();
      setUser(null);
      setCompanyName(null);
      setBranches([]);
      setIsLoading(false);
      return false;
    }
  }, [login]);

  useEffect(() => {
    mountedRef.current = true;
    const token = readAccessToken();

    if (!token) {
      setIsLoading(false);
      return () => {
        mountedRef.current = false;
      };
    }

    setIsLoading(true);
    void refreshSession();

    return () => {
      mountedRef.current = false;
      // Invalidate in-flight hydrate from this mount (Strict Mode safe)
      hydrateRequestId.current += 1;
    };
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      user,
      companyName,
      branches,
      isLoading,
      isAuthenticated: Boolean(user?.companyId),
      login,
      logout,
      refreshSession,
    }),
    [user, companyName, branches, isLoading, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
