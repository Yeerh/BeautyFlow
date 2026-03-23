import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  MessageSquareMore,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { ButtonLink } from "./ButtonLink";
import { contactLinks, platformServices } from "../data/landingContent";
import { SectionHeading } from "./SectionHeading";

const iconMap = {
  calendar: CalendarDays,
  users: UsersRound,
  message: MessageSquareMore,
  layout: LayoutDashboard,
  chart: BarChart3,
  shield: ShieldCheck,
} as const;

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Serviços"
          title="Recursos da plataforma para barbearias e salões de beleza"
          description="A BeautyFlow combina agendamento, acesso da cliente e gestão da operação em uma experiência rápida, limpa e profissional."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {platformServices.map((service) => {
            const Icon = iconMap[service.icon];

            return (
              <article
                key={service.title}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/[0.03] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#00C896]/25"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/70 via-[#0B0B0B]/10 to-transparent" />
                  <div className="absolute left-5 top-5 inline-flex rounded-2xl border border-[#00C896]/20 bg-black/35 p-3 text-[#00C896] backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-7">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
                      {service.badge}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {service.description}
                  </p>
                  <div className="mt-6">
                    <ButtonLink
                      href={contactLinks.serviceWhatsapp}
                      external
                      className="w-full"
                    >
                      Quero essa solução
                    </ButtonLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
