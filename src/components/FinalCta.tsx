import { ButtonLink } from "./ButtonLink";
import { contactLinks } from "../data/landingContent";

export function FinalCta() {
  return (
    <section id="cta" className="scroll-mt-28 px-6 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-[#F8C8DC]/20 bg-gradient-to-br from-[#F8C8DC]/18 via-[#1a1a1a] to-[#F5E6E8]/12 px-8 py-12 shadow-[0_28px_100px_rgba(0,0,0,0.4)] sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-[#F8C8DC]/18 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#F5E6E8]/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#F8C8DC]">
              CTA final
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pare de perder clientes todos os dias
            </h2>
            <p className="mt-4 text-base leading-8 text-white/72 sm:text-lg">
              Transforme visitas em agendamentos com uma presença digital premium, rápida e orientada para conversão.
            </p>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <ButtonLink href={contactLinks.schedule} className="px-8 py-4 text-base">
              Agendar agora
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
