import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { contactLinks } from "@/data/landingContent";
import { useClientAuth } from "@/context/ClientAuthContext";
import { adminRoutes } from "@/lib/portalNavigation";

export function ProtectedClientRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, isSessionReady, user } = useClientAuth();

  if (!isSessionReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={contactLinks.clientPortal}
        replace
        state={{ from: location }}
      />
    );
  }

  if (user && user.role !== "client") {
    return <Navigate to={adminRoutes.panel} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
