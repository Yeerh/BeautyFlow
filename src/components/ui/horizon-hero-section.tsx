import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import { Typewriter } from "@/components/ui/typewriter-text";
import { contactLinks } from "@/data/landingContent";

const heroImage = "/female-model-demonstrating-silber-bracelet.jpg";

export function Component() {
  return (
    <HeroSection
      id="inicio"
      distortion={1.2}
      speed={0.8}
      colors={["#F8C8DC", "#F5E6E8", "#FFFFFF"]}
      className="scroll-mt-28 px-6 pb-12 pt-28 sm:pt-32 lg:px-8"
      contentClassName="mx-auto max-w-7xl"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-10 sm:py-10 lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,200,220,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(245,230,232,0.08),transparent_28%)]" />

        <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-2xl">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
              <Typewriter
                text={["Sua agenda cheia todos os dias sem depender só do Instagram"]}
                speed={55}
                loop={false}
                className="block min-h-[3.4em] max-w-3xl"
                cursorClassName="bg-[#F8C8DC]"
              />
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              Automatize seus agendamentos, reduza faltas e aumente seu faturamento.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href={contactLinks.schedule} className="px-7 py-3.5">
                Agendar Avaliação
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

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F8C8DC]/12 bg-[radial-gradient(circle,rgba(248,200,220,0.16),rgba(248,200,220,0.02)_52%,transparent_72%)]" />
            <div className="absolute bottom-10 left-1/2 h-px w-[120%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#F8C8DC]/50 to-transparent" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 p-3 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
              <img
                src={heroImage}
                alt="Modelo feminina demonstrando pulseira prateada"
                className="h-[560px] w-full rounded-[1.5rem] object-cover object-center"
              />
              <div className="absolute inset-x-3 bottom-3 h-40 rounded-b-[1.5rem] bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute inset-x-7 bottom-8 rounded-[1.75rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                <p className="text-sm text-white/65">Agenda premium</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  Experiência sofisticada
                </p>
                <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
                  Uma apresentação elegante para transformar interesse em agendamento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroSection>
  );
}
