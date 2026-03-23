import { Route, Routes } from "react-router-dom";
import { ProtectedClientRoute } from "./components/ProtectedClientRoute";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ClientAuthPage } from "./pages/ClientAuthPage";
import { ClientBookingPage } from "./pages/ClientBookingPage";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/cliente-acesso" element={<ClientAuthPage />} />
      <Route
        path="/cliente-agendamento"
        element={
          <ProtectedClientRoute>
            <ClientBookingPage />
          </ProtectedClientRoute>
        }
      />
    </Routes>
  );
}
