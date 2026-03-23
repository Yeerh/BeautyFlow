import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { contactLinks } from "@/data/landingContent";

const businessSegments = [
  {
    title: "Barbearia",
    image:
      "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Organize horarios, profissionais e reservas em um fluxo rapido para reduzir atendimento manual e vender mais.",
    highlights: [
      "Controle de agenda online",
      "App para profissionais",
      "Atendimento mais rapido no WhatsApp",
    ],
    cta: "Solucoes para barbearias",
  },
  {
    title: "Clinica de Estetica",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    description:
      "Centralize agendamentos, servicos, clientes e processos de confirmacao em uma experiencia mais profissional.",
    highlights: [
      "Gestao de pacotes e servicos",
      "Historico da cliente",
      "Mais previsibilidade na agenda",
    ],
    cta: "Solucoes para clinicas",
  },
  {
    title: "Salao de Beleza",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Uma operacao mais fluida para cuidar de agenda, equipe e relacionamento com clientes sem perder tempo.",
    highlights: [
      "Agendamentos por servico",
      "Controle de profissionais",
      "Confirmacoes automaticas",
    ],
    cta: "Solucoes para saloes",
  },
  {
    title: "Studios",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Perfeito para studios de lashes, nails, maquiagem, tatuagem e outros negocios que precisam de agilidade.",
    highlights: [
      "Agenda para atendimentos personalizados",
      "Melhor captacao de clientes",
      "Fluxo simples do cadastro ao horario",
    ],
    cta: "Solucoes para studios",
  },
] as const;

export function Services() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const titleWords = [
    "Sistema",
    "para",
    "salao",
    "de",
    "beleza,",
    "barbearia,",
    "clinica",
    "de",
    "estetica,",
    "studios",
    "e",
    "muito",
    "mais.",
  ];

  function scrollCarousel(direction: "left" | "right") {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const amount = Math.max(container.clientWidth * 0.86, 320);

    container.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }

  return (
    <section id="servicos" className="scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,200,150,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(248,200,220,0.14),transparent_20%),linear-gradient(180deg,#161616_0%,#0B0B0B_100%)] px-6 py-12 text-white shadow-[0_30px_120px_rgba(0,0,0,0.28)] sm:px-8 lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-4rem] top-[-4rem] h-44 w-44 rounded-full bg-[#00C896]/16 blur-3xl" />
          <div className="absolute bottom-[-3rem] right-[-2rem] h-40 w-40 rounded-full bg-[#F8C8DC]/12 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.55 }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.045,
                },
              },
            }}
          >
            {titleWords.map((word) => (
              <motion.span
                key={word}
                className={`mr-[0.28em] inline-block ${
                  word.includes("clinica") ||
                  word.includes("estetica")
                    ? "text-[#F8C8DC]"
                    : "text-white"
                }`}
                variants={{
                  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <div className="mx-auto mt-7 flex max-w-xs items-center gap-4">
            <div className="h-px flex-1 bg-white/14" />
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#F8C8DC]" />
            <div className="h-px flex-1 bg-white/14" />
          </div>

          <p className="mx-auto mt-7 max-w-3xl text-lg font-medium leading-8 text-white/74 sm:text-xl">
            A BeautyFlow atende negocios de beleza e bem-estar com um app de
            agendamento claro, profissional e facil de usar.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#00C896]/25 bg-[#00C896]/12 text-[#00C896] shadow-[0_14px_30px_rgba(0,200,150,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#00C896] hover:text-[#0B0B0B]"
              aria-label="Voltar cards"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#F8C8DC]/25 bg-[#F8C8DC]/12 text-[#F8C8DC] shadow-[0_14px_30px_rgba(248,200,220,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F8C8DC] hover:text-[#0B0B0B]"
              aria-label="Avancar cards"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {businessSegments.map((segment) => (
            <article
              key={segment.title}
              className="group min-w-[86%] snap-start sm:min-w-[32rem] lg:min-w-[28rem]"
            >
              <div className="h-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00C896]/25 hover:shadow-[0_36px_90px_rgba(0,0,0,0.3)]">
                <div className="overflow-hidden rounded-t-[2rem]">
                  <img
                    src={segment.image}
                    alt={segment.title}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6 sm:p-7">
                  <h3 className="text-[2rem] font-semibold leading-tight tracking-tight text-white">
                    {segment.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-white/68">
                    {segment.description}
                  </p>

                  <ul className="mt-6 space-y-3 text-[15px] leading-7 text-white/82">
                    {segment.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-[0.7rem] h-2 w-2 rounded-full bg-[#00C896]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={contactLinks.serviceWhatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-[#00C896] transition-transform duration-300 group-hover:translate-x-1"
                  >
                    {segment.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
