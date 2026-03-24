import { Route, Routes } from "react-router-dom";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ProtectedClientRoute } from "./components/ProtectedClientRoute";
import { AdminAuthPage } from "./pages/AdminAuthPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ClientAuthPage } from "./pages/ClientAuthPage";
import { ClientBookingPage } from "./pages/ClientBookingPage";
import { ClientLocationsPage } from "./pages/ClientLocationsPage";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin-acesso" element={<AdminAuthPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="/cliente-acesso" element={<ClientAuthPage />} />
      <Route
        path="/cliente-agendamento"
        element={
          <ProtectedClientRoute>
            <ClientLocationsPage />
          </ProtectedClientRoute>
        }
      />
      <Route
        path="/cliente-agendamento/:locationId"
        element={
          <ProtectedClientRoute>
            <ClientBookingPage />
          </ProtectedClientRoute>
        }
      />
    </Routes>
  );
}
