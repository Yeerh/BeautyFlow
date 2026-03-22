import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import { Typewriter } from "@/components/ui/typewriter-text";
import { contactLinks, heroHighlights } from "@/data/landingContent";

const heroImage =
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80";

const heroStats = [
  { value: "+500", label: "agendamentos concluídos" },
  { value: "98%", label: "confirmação automática" },
  { value: "-32%", label: "redução de faltas" },
] as const;

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

          <div className="relative grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#F8C8DC]">
                <Sparkles className="h-3.5 w-3.5" />
                BeautyFlow
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
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

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70 shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <CheckCircle2 className="mb-3 h-5 w-5 text-[#F8C8DC]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F8C8DC]/12 bg-[radial-gradient(circle,rgba(248,200,220,0.16),rgba(248,200,220,0.02)_52%,transparent_72%)]" />
              <div className="absolute bottom-10 left-1/2 h-px w-[120%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#F8C8DC]/50 to-transparent" />

              <div className="relative mx-auto max-w-md">
                <div className="absolute -left-10 top-16 z-20 rounded-[1.75rem] border border-white/10 bg-black/45 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#F8C8DC]">
                    Confirmação
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">98%</p>
                  <p className="mt-1 text-sm text-white/60">menos faltas na agenda</p>
                </div>

                <div className="absolute -right-10 bottom-[4.5rem] z-20 rounded-[1.75rem] border border-white/10 bg-black/45 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#F8C8DC]">
                    Atendimento
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-white">
                    <CalendarClock className="h-4 w-4 text-[#F8C8DC]" />
                    <span className="text-sm font-medium">confirmações automáticas</span>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 p-3 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
                  <img
                    src={heroImage}
                    alt="Rosto feminino com pele uniforme e aparência sofisticada"
                    className="h-[500px] w-full rounded-[1.5rem] object-cover object-center"
                  />
                  <div className="absolute inset-x-3 bottom-3 h-40 rounded-b-[1.5rem] bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute inset-x-7 bottom-8 rounded-[1.75rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/65">BeautyFlow pipeline</p>
                        <p className="mt-2 text-3xl font-semibold text-white">Agenda premium</p>
                      </div>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F8C8DC]/30 bg-[#F8C8DC]/15 text-[#F8C8DC]">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-[#F8C8DC] to-[#F5E6E8]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="relative mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="text-3xl font-semibold tracking-tight text-[#F8C8DC]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/65">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </HeroSection>
  );
}
