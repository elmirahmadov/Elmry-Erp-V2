import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../loading";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
