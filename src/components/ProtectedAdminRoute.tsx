import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { clientRoutes } from "@/lib/portalNavigation";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isSessionReady, user } = useClientAuth();

  if (!isSessionReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-acesso" replace state={{ from: location }} />;
  }

  if (user && user.role === "client") {
    return <Navigate to={clientRoutes.bookings} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
