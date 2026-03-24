import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { contactLinks } from "@/data/landingContent";
import { useClientAuth } from "@/context/ClientAuthContext";

export function ProtectedClientRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, user } = useClientAuth();

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
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
