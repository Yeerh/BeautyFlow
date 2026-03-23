import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";

export function AuthSuccessPage() {
  const navigate = useNavigate();
  const { completeTokenLogin } = useClientAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate(`${contactLinks.clientPortal}?error=missing_token`, {
        replace: true,
      });
      return;
    }

    try {
      completeTokenLogin(token);
      navigate(contactLinks.clientBooking, { replace: true });
    } catch {
      navigate(`${contactLinks.clientPortal}?error=invalid_token`, {
        replace: true,
      });
    }
  }, [completeTokenLogin, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 text-white">
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#00C896]" />
        <div>
          <p className="text-lg font-semibold">Conectando sua conta</p>
          <p className="mt-2 text-sm text-white/60">
            Aguarde enquanto validamos seu acesso e abrimos a agenda.
          </p>
        </div>
      </div>
    </div>
  );
}
