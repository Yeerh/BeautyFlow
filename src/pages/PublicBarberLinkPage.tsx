import { useEffect, useMemo, useState } from "react";
import { AlertCircle, LoaderCircle, LogIn, MapPin, Scissors, Store } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { buildApiUrl } from "@/lib/api";

type LocationDetails = {
  id: number;
  businessName: string;
  businessPhotoUrl: string | null;
  businessAddress: string | null;
  ownerName: string;
};

type ServiceItem = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  priceLabel: string;
};

const LINK_ERROR_MESSAGE =
  "Nao foi possivel carregar este link agora. Tente novamente em alguns instantes.";

function getReadableLinkError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function PublicBarberLinkPage() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useClientAuth();
  const [location, setLocation] = useState<LocationDetails | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  const selectedAdminId = useMemo(() => {
    const parsedId = Number(adminId);
    return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  }, [adminId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadLocationDetails() {
      if (!selectedAdminId) {
        setLocation(null);
        setServices([]);
        setPageError("Link invalido. Confira o endereco e tente novamente.");
        setIsLoadingPage(false);
        return;
      }

      setIsLoadingPage(true);
      setPageError("");

      try {
        const response = await fetch(buildApiUrl(`/api/locations?adminId=${selectedAdminId}`));
        const data = (await response.json().catch(() => ({}))) as {
          location?: LocationDetails;
          services?: ServiceItem[];
          message?: string;
        };

        if (!response.ok || !data.location) {
          throw new Error(data.message || "Nao foi possivel carregar este estabelecimento.");
        }

        if (!isCancelled) {
          setLocation(data.location);
          setServices(Array.isArray(data.services) ? data.services : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setLocation(null);
          setServices([]);
          setPageError(getReadableLinkError(error, LINK_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPage(false);
        }
      }
    }

    void loadLocationDetails();

    return () => {
      isCancelled = true;
    };
  }, [selectedAdminId]);

  const isClientAuthenticated = isAuthenticated && user?.role === "client";
  const bookingPath = location ? `${contactLinks.clientBooking}/${location.id}` : "";

  const handleBooking = () => {
    if (!location || !bookingPath) {
      return;
    }

    if (isClientAuthenticated) {
      navigate(bookingPath);
      return;
    }

    navigate(contactLinks.clientPortal, {
      state: {
        from: { pathname: bookingPath },
      },
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-5rem] top-[-5rem] h-72 w-72 rounded-full bg-[#00C896]/12 blur-3xl" />
        <div className="absolute right-[-7rem] top-1/3 h-80 w-80 rounded-full bg-[#F8C8DC]/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-white/6 blur-3xl" />
      </div>

      <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                Link de agendamento
              </span>
              <Link
                to={contactLinks.publicBarbershops}
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/68 transition-colors duration-300 hover:border-[#00C896]/35 hover:text-[#00C896]"
              >
                Ver barbearias
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
              <div className="relative h-44">
                {location?.businessPhotoUrl ? (
                  <img
                    src={location.businessPhotoUrl}
                    alt={location.businessName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#111827,#14532d)]">
                    <Store className="h-9 w-9 text-white/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.08),rgba(11,11,11,0.84))]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-2xl font-semibold text-white">
                    {location?.businessName || "BeautyFlow"}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-white/62">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                    <span>{location?.businessAddress || "Endereco nao informado"}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-semibold text-white">Resumo do pedido</h1>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      Escolha um dos servicos cadastrados e avance para o agendamento.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F8C8DC]">
                    <Scissors className="h-3.5 w-3.5" />
                    {services.length} servicos
                  </span>
                </div>

                {isLoadingPage ? (
                  <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/65">
                    <LoaderCircle className="h-4 w-4 animate-spin text-[#00C896]" />
                    Carregando resumo do pedido...
                  </div>
                ) : null}

                {pageError ? (
                  <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-4 text-sm text-[#fecaca]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {pageError}
                  </div>
                ) : null}

                {!isLoadingPage && !pageError ? (
                  <div className="mt-6 space-y-3">
                    {services.length ? (
                      services.map((service) => (
                        <article
                          key={service.id}
                          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-white">{service.name}</p>
                              <p className="mt-2 text-sm leading-6 text-white/60">
                                {service.description || "Sem descricao informada para este servico."}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-3 py-1 text-sm font-semibold text-[#d7fff4]">
                              {service.priceLabel}
                            </span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[1.5rem] border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-4 py-4 text-sm text-[#fde7b0]">
                        Esta barbearia ainda nao possui servicos ativos para agendamento.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={!services.length || !location}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
                        services.length && location
                          ? "bg-[#00C896] text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
                          : "cursor-not-allowed border border-white/10 bg-white/5 text-white/38"
                      }`}
                    >
                      <LogIn className="h-4 w-4" />
                      Agendar
                    </button>

                    <p className="text-xs leading-6 text-white/50">
                      Ao continuar, voce vai para login ou cadastro e depois retorna para concluir
                      o agendamento desta barbearia.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
