import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ButtonLink } from "./ButtonLink";
import { FlippingCard } from "@/components/ui/flipping-card";
import { benefits, contactLinks, plans } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

type BenefitFront = (typeof benefits)[number];

const featuredBenefits = benefits.filter((benefit) =>
  ["calendar", "check", "chart"].includes(benefit.icon),
);

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
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[inherit] bg-[linear-gradient(180deg,#151515_0%,#0B0B0B_100%)] p-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-2.5rem] top-[-2rem] h-28 w-28 rounded-full bg-[#00C896]/18 blur-3xl" />
        <div className="absolute bottom-[-2rem] right-[-1rem] h-24 w-24 rounded-full bg-[#F8C8DC]/14 blur-3xl" />
      </div>

      <div>
        <span className="inline-flex rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F8C8DC]">
          Beneficio
        </span>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          {data.title}
        </h3>
        <p className="mt-4 max-w-[15rem] text-sm leading-7 text-white/78">
          {data.description}
        </p>
      </div>

      <a
        href={contactLinks.serviceWhatsapp}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-max items-center gap-2 rounded-full border border-[#00C896]/25 bg-[#00C896]/12 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#00C896] transition-all duration-300 hover:translate-x-1 hover:bg-[#00C896] hover:text-[#0B0B0B]"
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
          {featuredBenefits.map((benefit) => (
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
