import { FeatureSteps } from "@/components/blocks/feature-section";
import { SectionHeading } from "./SectionHeading";

const features = [
  {
    step: "Agenda online",
    title: "Horarios sempre acessiveis",
    content:
      "O cliente encontra dias e horarios disponiveis com rapidez, escolhe o servico e finaliza a reserva sem depender de mensagens soltas no WhatsApp.",
    image: "/platform-agenda.svg",
  },
  {
    step: "Atendimento organizado",
    title: "Rotina mais clara para a equipe",
    content:
      "Servicos, horarios e dados do cliente ficam centralizados em um fluxo visual mais profissional para barbearias, saloes e clinicas de estetica.",
    image: "/platform-organized.svg",
  },
  {
    step: "Fluxo confiavel",
    title: "Da reserva ate a confirmacao",
    content:
      "Cada etapa foi pensada para reduzir atrito no agendamento, transmitir confianca e manter a experiencia do cliente simples do inicio ao fim.",
    image: "/platform-flow.svg",
  },
] as const;

export function AboutApp() {
  return (
    <section id="sobre" className="scroll-mt-28 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Sobre a Plataforma"
          title="Uma experiencia de agendamento feita para organizar o atendimento"
          description="A BeautyFlow combina apresentacao premium com um fluxo objetivo para negocios de beleza que precisam vender, agendar e atender com mais clareza."
        />

        <div className="mt-12 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_28px_100px_rgba(0,0,0,0.24)]">
          <FeatureSteps
            features={features}
            title="Agenda online, atendimento organizado e um fluxo confiavel em um so lugar"
            autoPlayInterval={4200}
            imageHeight="h-[320px] sm:h-[400px] lg:h-[520px]"
          />
        </div>
      </div>
    </section>
  );
}
