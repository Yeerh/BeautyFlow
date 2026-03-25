import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { contactLinks, metrics } from "../data/landingContent";
import { buildApiUrl } from "@/lib/api";
import { SectionHeading } from "./SectionHeading";

export function SocialProof() {
  const [locationsCount, setLocationsCount] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadLocationsCount() {
      try {
        const response = await fetch(buildApiUrl("/api/locations"));
        const data = (await response.json().catch(() => ({}))) as {
          items?: unknown[];
        };

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar os locais.");
        }

        if (!isCancelled) {
          setLocationsCount(Array.isArray(data.items) ? data.items.length : 0);
        }
      } catch {
        if (!isCancelled) {
          setLocationsCount(null);
        }
      }
    }

    void loadLocationsCount();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <section id="locais" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Prova social"
          title="Resultados que passam confianca sem perder a objetividade"
          description="A combinacao entre estetica limpa, velocidade e clareza ajuda a convencer publicos diferentes com a mesma forca."
          align="center"
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Link
            to={contactLinks.publicBarbershops}
            className="group rounded-[2rem] border border-[#00C896]/25 bg-[linear-gradient(180deg,rgba(0,200,150,0.14),rgba(255,255,255,0.04))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00C896]/40"
          >
            <p className="text-4xl font-semibold tracking-tight text-[#00C896]">
              {locationsCount === null ? "--" : locationsCount}
            </p>
            <p className="mt-3 text-lg font-medium text-white">locais registrados</p>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Clique para ver as barbearias cadastradas e os servicos disponiveis.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d7fff4] transition-colors duration-300 group-hover:text-white">
              Ver barbearias
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>

          {metrics.slice(1).map((metric) => (
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
      </div>
    </section>
  );
}
