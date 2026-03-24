import { metrics } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

export function SocialProof() {
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
      </div>
    </section>
  );
}
