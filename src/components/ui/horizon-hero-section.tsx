import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import { Typewriter } from "@/components/ui/typewriter-text";
import { contactLinks } from "@/data/landingContent";

const heroImage = "/woman-getting-treatment-hairdresser-shop.jpg";

export function Component() {
  return (
    <HeroSection
      id="inicio"
      distortion={1.18}
      speed={0.75}
      colors={["#0B0B0B", "#1A1A1A", "#00C896", "#FFFFFF", "#F8C8DC"]}
      className="scroll-mt-28 px-6 pb-12 pt-28 sm:pt-32 lg:px-8"
      contentClassName="mx-auto max-w-7xl"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-6 py-8 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10 lg:px-14 lg:py-14">
        <div className="relative grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
              Plataforma de agendamento
            </span>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
              <Typewriter
                text={["Agende seu atendimento em segundos"]}
                speed={42}
                loop={false}
                className="block min-h-[2.8em] max-w-4xl"
                cursorClassName="bg-[#00C896]"
              />
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              Um aplicativo para agendamento de serviços em barbearias e salões de beleza.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={contactLinks.schedule} className="px-7 py-3.5">
                Agendar atendimento
              </ButtonLink>
              <ButtonLink
                href={contactLinks.whatsapp}
                variant="secondary"
                external
                icon={<MessageCircle className="h-4 w-4" />}
                className="px-7 py-3.5"
              >
                Falar no WhatsApp
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute left-8 top-8 h-44 w-44 rounded-full bg-[#00C896]/12 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]/85 p-3 shadow-[0_28px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <img
                src={heroImage}
                alt="Atendimento em salão de beleza"
                className="h-[560px] w-full rounded-[1.55rem] object-cover object-center"
              />
              <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(11,11,11,0.02),rgba(11,11,11,0.14))]" />
            </div>
          </div>
        </div>
      </div>
    </HeroSection>
  );
}
