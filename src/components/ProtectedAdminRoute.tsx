import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, user } = useClientAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin-acesso" replace state={{ from: location }} />;
  }

  if (user && user.role === "client") {
    return <Navigate to="/cliente-agendamento" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
