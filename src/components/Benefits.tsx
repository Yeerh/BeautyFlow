import {
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { ButtonLink } from "./ButtonLink";
import { benefits, contactLinks, plans } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

const iconMap = {
  calendar: CalendarDays,
  check: CheckCircle2,
  message: MessageCircle,
  chart: TrendingUp,
} as const;

export function Benefits() {
  return (
    <section id="sobre" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Benefícios"
          title="Uma operação mais elegante por trás de uma marca mais forte"
          description="A BeautyFlow foi desenhada para unir imagem premium com eficiência comercial. O resultado é uma jornada mais leve para a clínica e mais convincente para a cliente."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.icon];

            return (
              <article
                key={benefit.title}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F8C8DC]/35"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/75 via-[#0B0B0B]/10 to-transparent" />
                  <div className="absolute left-5 top-5 inline-flex rounded-2xl border border-[#F8C8DC]/25 bg-black/35 p-3 text-[#F8C8DC] backdrop-blur-md">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {benefit.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-20">
          <SectionHeading
            eyebrow="Planos"
            title="Dois formatos para diferentes momentos de crescimento"
            description="Os planos foram pensados para posicionar seu atendimento com aparência premium e aumentar a previsibilidade comercial."
            align="center"
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[2rem] border p-8 shadow-[0_22px_70px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1 ${
                  plan.name === "Plus"
                    ? "border-[#F8C8DC]/35 bg-[linear-gradient(180deg,rgba(248,200,220,0.12),rgba(255,255,255,0.04))]"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#F8C8DC]">
                      {plan.name}
                    </span>
                    <p className="mt-5 text-4xl font-semibold tracking-tight text-white">
                      {plan.price}
                    </p>
                  </div>

                  {plan.name === "Plus" ? (
                    <span className="rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F8C8DC]">
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
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F8C8DC]" />
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
