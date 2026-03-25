import { ArrowRight, CalendarDays, CheckCircle2, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { contactLinks } from "@/data/landingContent";

const pillars = [
  {
    icon: CalendarDays,
    title: "Agenda visual em tempo real",
    description:
      "Cada horario fica visivel de forma direta. O cliente entende as opcoes rapidamente e escolhe sem troca excessiva de mensagens.",
  },
  {
    icon: Layers3,
    title: "Operacao mais organizada",
    description:
      "Servicos, locais e reservas ficam centralizados. A equipe trabalha com menos ruido e mais previsibilidade no dia a dia.",
  },
  {
    icon: ShieldCheck,
    title: "Fluxo de reserva confiavel",
    description:
      "A jornada foi desenhada para reduzir friccao: visualizacao publica dos servicos, autenticacao no momento certo e confirmacao clara.",
  },
] as const;

const timeline = [
  {
    step: "01",
    title: "Cliente encontra o local",
    description:
      "Na pagina de barbearias ele visualiza locais registrados e abre os servicos disponiveis sem precisar entrar na conta.",
  },
  {
    step: "02",
    title: "Escolhe o servico ideal",
    description:
      "Com preco e descricao na tela, a decisao fica rapida. O cliente entende o que vai contratar antes de iniciar o agendamento.",
  },
  {
    step: "03",
    title: "Autentica para concluir",
    description:
      "Ao clicar em agendar, o sistema redireciona para login ou cadastro e depois retorna para concluir a reserva no local escolhido.",
  },
  {
    step: "04",
    title: "Agenda confirmada com clareza",
    description:
      "Com data, horario e servico definidos, a reserva segue em um fluxo limpo, com historico e dados protegidos.",
  },
] as const;

export function AboutPlatformPage() {
  return (
    <div className="min-h-screen bg-[#070B10] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-16 top-20 h-80 w-80 rounded-full bg-[#14B8A6]/18 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#FB923C]/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-white/6 blur-3xl" />
      </div>

      <header className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/76 transition-colors duration-300 hover:border-[#14B8A6]/35 hover:text-[#14B8A6]"
          >
            Voltar para home
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={contactLinks.publicBarbershops}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/78 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/35 hover:text-[#14B8A6]"
            >
              Ver barbearias
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={contactLinks.clientPortal}
              className="inline-flex items-center gap-2 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/10 px-4 py-2.5 text-sm font-semibold text-[#99F6E4] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#14B8A6]/18"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mx-auto grid w-full max-w-7xl gap-8 rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(251,146,60,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#14B8A6]/35 bg-[#14B8A6]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#99F6E4]">
              <Sparkles className="h-3.5 w-3.5" />
              Sobre a plataforma
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Uma plataforma pensada para fluxo real de barbearia
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              A BeautyFlow conecta descoberta de servicos, autenticacao e confirmacao de agenda
              em uma jornada simples para o cliente e eficiente para o estabelecimento.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={contactLinks.publicBarbershops}
                className="inline-flex items-center gap-2 rounded-full bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-[#05211D] shadow-[0_16px_40px_rgba(20,184,166,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2dd4bf]"
              >
                Explorar locais
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={contactLinks.clientPortal}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/35 hover:text-[#99F6E4]"
              >
                Criar conta
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Foco principal</p>
              <p className="mt-3 text-lg font-semibold text-white">Converter interesse em reserva</p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                Menos friccao no caminho de agendamento e mais clareza no que o cliente vai contratar.
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Base do produto</p>
              <p className="mt-3 text-lg font-semibold text-white">Design + operacao</p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                Interface premium com regras de negocio objetivas para manter a agenda funcional.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#99F6E4]">
              Pilares
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              O que torna a BeautyFlow diferente
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  key={pillar.title}
                  className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                >
                  <div className="inline-flex rounded-2xl border border-[#14B8A6]/20 bg-[#14B8A6]/10 p-3 text-[#99F6E4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{pillar.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#99F6E4]">
              Fluxo da plataforma
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Da descoberta ate a confirmacao
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {timeline.map((item) => (
              <article
                key={item.step}
                className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5"
              >
                <span className="inline-flex rounded-full border border-[#FB923C]/25 bg-[#FB923C]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#FDBA74]">
                  Etapa {item.step}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl rounded-[2rem] border border-[#14B8A6]/25 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(6,182,212,0.08),rgba(255,255,255,0.02))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Pronto para ver os locais ativos?
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/74">
                Acesse as barbearias cadastradas, confira os servicos e siga para o agendamento.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={contactLinks.publicBarbershops}
                className="inline-flex items-center gap-2 rounded-full bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-[#05211D] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2dd4bf]"
              >
                Ver barbearias
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={contactLinks.clientPortal}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/35 hover:text-[#99F6E4]"
              >
                Entrar na conta
                <CheckCircle2 className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
