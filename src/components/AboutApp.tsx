import { CalendarDays, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const aboutHighlights = [
  {
    icon: CalendarDays,
    title: "Agenda online",
    description:
      "Dias e horários disponíveis organizados em uma experiência objetiva para reservar serviços sem fricção.",
  },
  {
    icon: UsersRound,
    title: "Atendimento organizado",
    description:
      "Ideal para operações que precisam atender clientes com rapidez e apresentação profissional.",
  },
  {
    icon: ShieldCheck,
    title: "Fluxo confiável",
    description:
      "Da escolha do serviço até a confirmação, tudo é pensado para transmitir clareza e confiança.",
  },
] as const;

export function AboutApp() {
  return (
    <section id="sobre" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Sobre a Plataforma"
          title="BeautyFlow é um aplicativo para agendamento de serviços em barbearias e salões de beleza"
          description="A proposta é reunir tecnologia, agilidade e boa apresentação em uma plataforma feita para negócios de cuidado pessoal que precisam vender melhor o atendimento."
        />

        <div className="mt-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="overflow-hidden rounded-[2rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.1),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
              <Sparkles className="h-4 w-4" />
              Sistema de agendamento
            </span>

            <h3 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Um fluxo pensado para transformar busca por horário em atendimento confirmado.
            </h3>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
              A BeautyFlow ajuda barbearias e salões de beleza a apresentar seus serviços de
              forma mais organizada, acelerar o contato com clientes e dar mais previsibilidade
              para a agenda com um visual moderno e sofisticado.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Serviços com preço",
                "Calendário disponível",
                "Confirmação rápida",
                "Gestão centralizada",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/72"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>

          <div className="grid gap-5">
            {aboutHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                >
                  <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-5 text-xl font-semibold text-white">{item.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
