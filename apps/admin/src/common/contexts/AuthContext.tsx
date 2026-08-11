import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchAuthBootstrap,
  type AuthBootstrapData,
  type AuthUser,
} from "../actions/auth.actions";

interface AuthContextValue {
  user: AuthUser | null;
  companyName: string | null;
  token: string | null;
  loading: boolean;
  login: (data: AuthBootstrapData, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      const saved = localStorage.getItem("admin_token");
      if (!saved) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchAuthBootstrap();
        if (data.user.roleId !== 1) {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refreshToken");
          setLoading(false);
          return;
        }
        setUser(data.user);
        setCompanyName(data.companyName);
        setToken(saved);
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refreshToken");
      } finally {
        setLoading(false);
      }
    };
    void boot();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      companyName,
      token,
      loading,
      login: (data, nextToken) => {
        setUser(data.user);
        setCompanyName(data.companyName);
        setToken(nextToken);
        localStorage.setItem("admin_token", nextToken);
      },
      logout: () => {
        setUser(null);
        setCompanyName(null);
        setToken(null);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refreshToken");
      },
    }),
    [user, companyName, token, loading],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
