import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Store, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { contactLinks } from "../data/landingContent";
import { buildApiUrl } from "@/lib/api";
import { SectionHeading } from "./SectionHeading";

type LocationItem = {
  id: number;
  businessName: string;
  businessPhotoUrl: string | null;
  businessAddress: string | null;
  ownerName: string;
};

const NETWORK_ERROR_MESSAGE =
  "Nao foi possivel carregar os locais registrados agora. Tente novamente em instantes.";

function getReadableError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

function resolveVisibleCount(width: number) {
  if (width < 768) {
    return 1;
  }

  if (width < 1200) {
    return 2;
  }

  return 3;
}

export function SocialProof() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [activeIndex, setActiveIndex] = useState(0);

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
          throw new Error(data.message || "Nao foi possivel carregar os locais.");
        }

        if (!isCancelled) {
          setLocations(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setLocationsError(getReadableError(error, NETWORK_ERROR_MESSAGE));
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
    if (typeof window === "undefined") {
      return;
    }

    const syncVisibleCount = () => {
      setVisibleCount(resolveVisibleCount(window.innerWidth));
    };

    syncVisibleCount();
    window.addEventListener("resize", syncVisibleCount);

    return () => {
      window.removeEventListener("resize", syncVisibleCount);
    };
  }, []);

  useEffect(() => {
    setActiveIndex((current) => {
      if (!locations.length) {
        return 0;
      }

      return current % locations.length;
    });
  }, [locations.length, visibleCount]);

  const canSlide = locations.length > visibleCount;

  const visibleLocations = useMemo(() => {
    if (!locations.length) {
      return [] as LocationItem[];
    }

    if (!canSlide) {
      return locations.slice(0, visibleCount);
    }

    return Array.from({ length: visibleCount }, (_, offset) => {
      const index = (activeIndex + offset) % locations.length;
      return locations[index];
    });
  }, [activeIndex, canSlide, locations, visibleCount]);

  useEffect(() => {
    if (!canSlide) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % locations.length);
    }, 4200);

    return () => {
      window.clearInterval(timer);
    };
  }, [canSlide, locations.length]);

  const handlePrevious = () => {
    if (!canSlide) {
      return;
    }

    setActiveIndex((current) => (current - 1 + locations.length) % locations.length);
  };

  const handleNext = () => {
    if (!canSlide) {
      return;
    }

    setActiveIndex((current) => (current + 1) % locations.length);
  };

  return (
    <section id="locais" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Prova social"
          title="Locais reais usando a BeautyFlow"
          description="Carrossel com os estabelecimentos registrados. No maximo 3 cards por visualizacao."
          align="center"
        />

        {locationsError ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
            {locationsError}
          </div>
        ) : null}

        {isLoadingLocations ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="h-[320px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>
        ) : null}

        {!isLoadingLocations && !locations.length ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/64">
            Ainda nao existem locais registrados para exibir no carrossel.
          </div>
        ) : null}

        {!isLoadingLocations && locations.length ? (
          <>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-white/60">
                Mostrando ate <span className="font-semibold text-white">3 locais</span> por vez
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={!canSlide}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${
                    canSlide
                      ? "border-white/15 bg-white/[0.04] text-white hover:border-[#00C896]/35 hover:text-[#00C896]"
                      : "cursor-not-allowed border-white/8 bg-white/[0.02] text-white/35"
                  }`}
                  aria-label="Card anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canSlide}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${
                    canSlide
                      ? "border-white/15 bg-white/[0.04] text-white hover:border-[#00C896]/35 hover:text-[#00C896]"
                      : "cursor-not-allowed border-white/8 bg-white/[0.02] text-white/35"
                  }`}
                  aria-label="Proximo card"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleLocations.map((location) => (
                <Link
                  key={`location-card-${location.id}`}
                  to={`${contactLinks.publicBarbershops}/${location.id}`}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00C896]/35"
                >
                  <div className="relative h-44">
                    {location.businessPhotoUrl ? (
                      <img
                        src={location.businessPhotoUrl}
                        alt={location.businessName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#111827,#14532d)]">
                        <Store className="h-10 w-10 text-white/65" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.08),rgba(11,11,11,0.78))]" />
                  </div>

                  <div className="space-y-3 p-5">
                    <h3 className="text-xl font-semibold text-white">{location.businessName}</h3>

                    <p className="flex items-center gap-2 text-sm text-white/64">
                      <UserRound className="h-4 w-4 text-[#00C896]" />
                      {location.ownerName}
                    </p>

                    <p className="flex items-start gap-2 text-sm text-white/58">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                      <span>{location.businessAddress || "Endereco nao informado"}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
