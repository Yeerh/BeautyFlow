import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronRight, LogIn, MapPin, Scissors, Store, UserRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { buildApiUrl } from "@/lib/api";

type LocationItem = {
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

const LOCATIONS_ERROR_MESSAGE =
  "Nao foi possivel carregar as barbearias agora. Tente novamente em alguns instantes.";
const DETAILS_ERROR_MESSAGE =
  "Nao foi possivel carregar os servicos desta barbearia agora. Tente novamente em alguns instantes.";

function getReadableError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function PublicBarbershopsPage() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useClientAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState("");

  const selectedLocationId = useMemo(() => {
    const parsedId = Number(locationId);
    return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  }, [locationId]);

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
          throw new Error(data.message || "Nao foi possivel carregar as barbearias.");
        }

        if (!isCancelled) {
          setLocations(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setLocationsError(getReadableError(error, LOCATIONS_ERROR_MESSAGE));
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

  useEffect(() => {
    let isCancelled = false;

    async function loadLocationDetails() {
      if (!locationId) {
        setSelectedLocation(null);
        setServices([]);
        setServicesError("");
        setIsLoadingServices(false);
        return;
      }

      if (!selectedLocationId) {
        setSelectedLocation(null);
        setServices([]);
        setServicesError("Barbearia invalida. Selecione uma opcao da lista.");
        setIsLoadingServices(false);
        return;
      }

      setIsLoadingServices(true);
      setServicesError("");

      try {
        const response = await fetch(buildApiUrl(`/api/locations?adminId=${selectedLocationId}`));
        const data = (await response.json().catch(() => ({}))) as {
          location?: LocationItem;
          services?: ServiceItem[];
          message?: string;
        };

        if (!response.ok || !data.location) {
          throw new Error(data.message || "Nao foi possivel carregar esta barbearia.");
        }

        if (!isCancelled) {
          setSelectedLocation(data.location);
          setServices(Array.isArray(data.services) ? data.services : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setSelectedLocation(null);
          setServices([]);
          setServicesError(getReadableError(error, DETAILS_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingServices(false);
        }
      }
    }

    void loadLocationDetails();

    return () => {
      isCancelled = true;
    };
  }, [locationId, selectedLocationId]);

  const isClientAuthenticated = isAuthenticated && user?.role === "client";
  const bookingPath = selectedLocation ? `${contactLinks.clientBooking}/${selectedLocation.id}` : "";

  const handleOpenLocation = (nextLocationId: number) => {
    navigate(`/barbearias/${nextLocationId}`);
  };

  const handleBooking = () => {
    if (!selectedLocation || !bookingPath) {
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
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-[#00C896]/14 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#00C896]/8 blur-3xl" />
      </div>

      <header className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/76 transition-colors duration-300 hover:border-[#00C896]/35 hover:text-[#00C896]"
          >
            Voltar para home
          </Link>

          <Link
            to={contactLinks.clientPortal}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-2.5 text-sm font-semibold text-[#00C896] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00C896]/16"
          >
            <LogIn className="h-4 w-4" />
            Login / Cadastro
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
            <div className="mb-6">
              <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                Barbearias
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-white">Barbearias registradas</h1>
              <p className="mt-2 text-sm text-white/62">
                Veja os servicos sem login e escolha onde voce quer agendar.
              </p>
            </div>

            {locationsError ? (
              <div className="mb-4 flex items-start gap-3 rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {locationsError}
              </div>
            ) : null}

            {isLoadingLocations ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/60">
                Carregando barbearias...
              </div>
            ) : null}

            {!isLoadingLocations && !locations.length ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/60">
                Nenhuma barbearia ativa foi encontrada no momento.
              </div>
            ) : null}

            {!isLoadingLocations && locations.length ? (
              <div className="grid gap-4">
                {locations.map((location) => {
                  const isSelected = selectedLocation?.id === location.id;

                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => handleOpenLocation(location.id)}
                      className={`overflow-hidden rounded-[1.5rem] border text-left transition-all duration-300 ${
                        isSelected
                          ? "border-[#00C896]/30 bg-[#00C896]/10"
                          : "border-white/10 bg-black/20 hover:border-[#00C896]/25 hover:bg-black/30"
                      }`}
                    >
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-white/10 sm:h-20 sm:w-24">
                          {location.businessPhotoUrl ? (
                            <img
                              src={location.businessPhotoUrl}
                              alt={location.businessName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#111827,#14532d)]">
                              <Store className="h-6 w-6 text-white/65" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-semibold text-white">{location.businessName}</p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-white/58">
                            <UserRound className="h-4 w-4 text-[#00C896]" />
                            {location.ownerName}
                          </p>
                          <p className="mt-1 flex items-start gap-2 text-sm text-white/52">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                            <span>{location.businessAddress || "Endereco nao informado"}</span>
                          </p>
                        </div>

                        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/80">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
            {!locationId ? (
              <div className="rounded-[1.75rem] border border-dashed border-white/16 bg-black/20 px-6 py-12 text-center text-sm text-white/62">
                Selecione uma barbearia na lista para visualizar os servicos disponiveis.
              </div>
            ) : null}

            {locationId && isLoadingServices ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/60">
                Carregando servicos...
              </div>
            ) : null}

            {locationId && servicesError ? (
              <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                {servicesError}
              </div>
            ) : null}

            {selectedLocation && !isLoadingServices ? (
              <>
                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
                  <div className="relative h-56">
                    {selectedLocation.businessPhotoUrl ? (
                      <img
                        src={selectedLocation.businessPhotoUrl}
                        alt={selectedLocation.businessName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#111827,#14532d)]">
                        <Store className="h-10 w-10 text-white/65" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.08),rgba(11,11,11,0.82))]" />
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h2 className="text-3xl font-semibold text-white">{selectedLocation.businessName}</h2>
                      <p className="mt-2 text-sm text-white/58">
                        Atendimento com {selectedLocation.ownerName}
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        {selectedLocation.businessAddress || "Endereco nao informado"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">Servicos disponiveis</h3>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00C896]">
                      <Scissors className="h-3.5 w-3.5" />
                      {services.length} servicos
                    </span>
                  </div>

                  {!services.length ? (
                    <div className="rounded-[1.25rem] border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#fde7b0]">
                      Esta barbearia ainda nao possui servicos ativos.
                    </div>
                  ) : null}

                  {services.length ? (
                    <div className="grid gap-3">
                      {services.map((service) => (
                        <article
                          key={service.id}
                          className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 sm:p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-semibold text-white">{service.name}</h4>
                              <p className="mt-2 text-sm leading-6 text-white/62">
                                {service.description || "Sem descricao informada para este servico."}
                              </p>
                            </div>
                            <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-3 py-1 text-sm font-semibold text-[#d7fff4]">
                              {service.priceLabel}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={!services.length}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
                      services.length
                        ? "bg-[#00C896] text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
                        : "cursor-not-allowed border border-white/10 bg-white/5 text-white/38"
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    {isClientAuthenticated ? "Agendar neste local" : "Login ou cadastro para agendar"}
                  </button>

                  <p className="text-xs leading-6 text-white/50">
                    Visualizacao de servicos sem login. Para concluir o agendamento, o sistema redireciona para login/cadastro.
                  </p>
                </div>
              </>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
