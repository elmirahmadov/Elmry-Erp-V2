import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Yukleniyor...
      </div>
    );
  }
  if (!user || user.roleId !== 1) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
