import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { contactLinks, metrics } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";
import { SparksCarousel, type SparkItem } from "./ui/sparks-carousel";

type LocationItem = {
  id: number;
  businessName: string;
  businessPhotoUrl: string | null;
  businessAddress: string | null;
  ownerName: string;
};

const LOCATIONS_ERROR_MESSAGE =
  "Nao foi possivel carregar os locais registrados agora. Tente novamente em alguns instantes.";

function getReadableLocationsError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function SocialProof() {
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
          throw new Error(data.message || "Nao foi possivel carregar os locais.");
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

  const carouselItems: SparkItem[] = locations.map((location, index) => ({
    id: location.id,
    imageSrc: location.businessPhotoUrl || "/woman-getting-treatment-hairdresser-shop.jpg",
    title: location.businessName,
    subtitle: `Responsavel: ${location.ownerName}`,
    description: location.businessAddress || "Endereco nao informado",
    count: index + 1,
    countLabel: "LOCAL",
    href: contactLinks.clientPortal,
    ctaLabel: "Acessar portal",
  }));

  return (
    <section className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Prova social"
          title="Resultados que passam confiança sem perder a objetividade"
          description="A combinação entre estética limpa, velocidade e clareza ajuda a convencer públicos diferentes com a mesma força."
          align="center"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00C896]/25"
            >
              <p className="text-4xl font-semibold tracking-tight text-[#00C896]">
                {metric.value}
              </p>
              <p className="mt-3 text-lg font-medium text-white">{metric.label}</p>
              <p className="mt-4 text-sm leading-7 text-white/68">{metric.note}</p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          {locationsError ? (
            <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {locationsError}
            </div>
          ) : null}

          {isLoadingLocations ? (
            <div className="flex items-center gap-3 rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-8 text-sm text-white/62 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <LoaderCircle className="h-4 w-4 animate-spin text-[#00C896]" />
              Carregando locais registrados...
            </div>
          ) : null}

          {!isLoadingLocations && carouselItems.length ? (
            <SparksCarousel
              title="Locais registrados no sistema"
              subtitle="Veja alguns estabelecimentos que ja estao ativos na plataforma e prontos para receber agendamentos."
              items={carouselItems}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
