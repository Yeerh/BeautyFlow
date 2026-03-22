import { CalendarDays, CheckCircle2, MessageCircle, TrendingUp } from "lucide-react";
import { benefits } from "../data/landingContent";
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
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="Benefícios"
            title="Uma operação mais elegante por trás de uma marca mais forte"
            description="A BeautyFlow foi desenhada para unir imagem premium com eficiência comercial. O resultado é uma jornada mais leve para a clínica e mais convincente para a cliente."
          />

          <div className="mt-10 space-y-4">
            {benefits.map((benefit) => {
              const Icon = iconMap[benefit.icon];

              return (
                <article
                  key={benefit.title}
                  className="flex gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#F8C8DC]/30"
                >
                  <div className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 text-[#F8C8DC]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/68">{benefit.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-12 top-12 h-40 rounded-full bg-[#F8C8DC]/18 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#111111] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#F8C8DC]">Painel BeautyFlow</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Agenda da semana</h3>
                </div>
                <div className="rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-2 text-sm font-medium text-[#F8C8DC]">
                  +32% ocupação
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Confirmados</p>
                  <p className="mt-2 text-3xl font-semibold text-white">48</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Reagendados</p>
                  <p className="mt-2 text-3xl font-semibold text-white">06</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Faltas</p>
                  <p className="mt-2 text-3xl font-semibold text-[#F8C8DC]">-32%</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  ["Limpeza de pele", "09:00", "Confirmado"],
                  ["Botox", "11:30", "Novo lead"],
                  ["Bioestimulador", "15:00", "Pago"],
                ].map(([service, time, status]) => (
                  <div
                    key={`${service}-${time}`}
                    className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div>
                      <p className="font-medium text-white">{service}</p>
                      <p className="mt-1 text-sm text-white/60">{time}</p>
                    </div>
                    <span className="rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#F8C8DC]">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
