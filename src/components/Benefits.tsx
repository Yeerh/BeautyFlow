import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ButtonLink } from "./ButtonLink";
import { FlippingCard } from "@/components/ui/flipping-card";
import { benefits, contactLinks, plans } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

type BenefitFront = (typeof benefits)[number];

function BenefitFrontCard({ data }: { data: BenefitFront }) {
  return (
    <div className="flex h-full w-full flex-col rounded-[inherit] bg-[linear-gradient(180deg,#171717_0%,#0B0B0B_100%)] p-4 text-white">
      <img
        src={data.image}
        alt={data.title}
        className="h-52 w-full rounded-[1rem] border border-white/10 object-cover"
      />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h3 className="text-xl font-semibold tracking-tight text-white">{data.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/70">{data.description}</p>
      </div>
    </div>
  );
}

function BenefitBackCard({ data }: { data: BenefitFront }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[inherit] bg-[linear-gradient(180deg,rgba(0,200,150,0.18),rgba(248,200,220,0.08),rgba(11,11,11,0.96))] p-6 text-white">
      <div>
        <span className="inline-flex rounded-full border border-[#00C896]/25 bg-[#00C896]/12 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
          Beneficio
        </span>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {data.title}
        </h3>
        <p className="mt-4 text-sm leading-7 text-white/72">{data.description}</p>
      </div>

      <a
        href={contactLinks.serviceWhatsapp}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#F8C8DC] transition-transform duration-300 hover:translate-x-1"
      >
        Conhecer solucao
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}

export function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Beneficios"
          title="Vire os cards e veja o que faz a BeautyFlow render melhor"
          description="Cada recurso foi pensado para acelerar a agenda, reduzir atrito no atendimento e deixar a operação mais organizada."
        />

        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {benefits.map((benefit) => (
            <FlippingCard
              key={benefit.title}
              width={320}
              height={430}
              className="rounded-[1.6rem] border border-white/10 bg-transparent shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
              frontContent={<BenefitFrontCard data={benefit} />}
              backContent={<BenefitBackCard data={benefit} />}
            />
          ))}
        </div>

        <div className="mt-20">
          <SectionHeading
            eyebrow="Planos"
            title="Estrutura premium para diferentes momentos da operacao"
            description="Os planos mantem a mesma base visual e tecnologica, com niveis diferentes de profundidade para crescimento e automacao."
            align="center"
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[2rem] border p-8 shadow-[0_22px_70px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1 ${
                  plan.name === "Plus"
                    ? "border-[#00C896]/25 bg-[linear-gradient(180deg,rgba(0,200,150,0.08),rgba(255,255,255,0.04))]"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#00C896]">
                      {plan.name}
                    </span>
                    <p className="mt-5 text-4xl font-semibold tracking-tight text-white">
                      {plan.price}
                    </p>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/45">
                      por mes
                    </p>
                  </div>

                  {plan.name === "Plus" ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/68">
                      Mais completo
                    </span>
                  ) : null}
                </div>

                <p className="mt-6 text-sm leading-7 text-white/68">
                  {plan.description}
                </p>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                      <span className="text-sm leading-6 text-white/72">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <ButtonLink
                    href={contactLinks.serviceWhatsapp}
                    external
                    className="w-full"
                  >
                    Quero este plano
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
