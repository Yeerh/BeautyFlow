import { useEffect, useState } from "react";
import { AlertCircle, Mail, MapPin, Store, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSidebarShell } from "@/components/RoleSidebarShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { buildApiUrl } from "@/lib/api";
import { buildClientMenu, clientRoutes } from "@/lib/portalNavigation";

type LocationItem = {
  id: number;
  businessName: string;
  businessPhotoUrl: string | null;
  businessAddress: string | null;
  ownerName: string;
};

const LOCATIONS_ERROR_MESSAGE =
  "Não foi possível carregar os locais disponíveis agora. Tente novamente em alguns instantes.";

function getReadableLocationsError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function ClientLocationsPage() {
  const navigate = useNavigate();
  const { logout, user } = useClientAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadLocations() {
      setIsLoadingLocations(true);
      setLocationsError("");

      try {
        const response = await fetch(buildApiUrl("/api/locations"));
        const data = (await response.json().catch(() => ({}))) as {
          items?: LocationItem[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Não foi possível carregar os locais.");
        }

        if (!isCancelled) {
          setLocations(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setLocationsError(getReadableLocationsError(error, LOCATIONS_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingLocations(false);
        }
      }
    }

    void loadLocations();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate(contactLinks.clientPortal, { replace: true });
  };

  const menuItems = buildClientMenu(handleLogout);

  return (
    <RoleSidebarShell
      badge="Cliente"
      title="Agendamentos"
      description="Escolha a barbearia ou o estúdio disponível antes de seguir para a reserva."
      menuItems={menuItems}
      userName={user?.name || "Cliente BeautyFlow"}
      userSubtitle={user?.email || "Área do cliente"}
      userImageUrl={user?.businessPhotoUrl || null}
      actions={
        <>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <UserRound className="h-4 w-4 text-[#00C896]" />
            {user?.name || "Cliente BeautyFlow"}
          </div>
          <button
            type="button"
            onClick={() => navigate(clientRoutes.profile)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
          >
            <Mail className="h-4 w-4" />
            Ver perfil
          </button>
        </>
      }
    >
      {locationsError ? (
        <div className="mb-6 flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {locationsError}
        </div>
      ) : null}

      {isLoadingLocations ? (
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-10 text-sm text-white/62 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          Carregando locais disponíveis...
        </div>
      ) : null}

      {!isLoadingLocations && !locations.length ? (
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-10 text-sm text-white/62 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          Nenhum local ativo foi cadastrado ainda.
        </div>
      ) : null}

      {!isLoadingLocations && locations.length ? (
        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {locations.map((location) => (
            <article
              key={location.id}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            >
              <div className="relative h-56">
                {location.businessPhotoUrl ? (
                  <img
                    src={location.businessPhotoUrl}
                    alt={location.businessName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#111827,#14532d)]">
                    <Store className="h-10 w-10 text-white/65" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.08),rgba(11,11,11,0.78))]" />
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{location.businessName}</h2>
                  <p className="mt-2 text-sm text-white/58">
                    Proprietário: {location.ownerName}
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/70">
                  <span className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                    {location.businessAddress || "Endereço não informado"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`${clientRoutes.bookings}/${location.id}`)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
                >
                  Escolher este local
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </RoleSidebarShell>
  );
}
