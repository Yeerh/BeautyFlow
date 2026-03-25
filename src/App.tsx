import { Route, Routes } from "react-router-dom";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ProtectedClientRoute } from "./components/ProtectedClientRoute";
import { AdminAuthPage } from "./pages/AdminAuthPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AboutPlatformPage } from "./pages/AboutPlatformPage";
import { ClientAuthPage } from "./pages/ClientAuthPage";
import { ClientBookingPage } from "./pages/ClientBookingPage";
import { ClientHistoryPage } from "./pages/ClientHistoryPage";
import { ClientLocationsPage } from "./pages/ClientLocationsPage";
import { ClientProfilePage } from "./pages/ClientProfilePage";
import { LandingPage } from "./pages/LandingPage";
import { PublicBarbershopsPage } from "./pages/PublicBarbershopsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sobre-plataforma" element={<AboutPlatformPage />} />
      <Route path="/barbearias" element={<PublicBarbershopsPage />} />
      <Route path="/barbearias/:locationId" element={<PublicBarbershopsPage />} />
      <Route path="/admin-acesso" element={<AdminAuthPage />} />
      <Route
        path="/admin/*"
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
      <Route
        path="/cliente-historico"
        element={
          <ProtectedClientRoute>
            <ClientHistoryPage />
          </ProtectedClientRoute>
        }
      />
      <Route
        path="/cliente-perfil"
        element={
          <ProtectedClientRoute>
            <ClientProfilePage />
          </ProtectedClientRoute>
        }
      />
    </Routes>
  );
}
