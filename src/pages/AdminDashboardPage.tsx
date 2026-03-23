import {
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  LayoutPanelTop,
  MessageSquareMore,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonLink } from "@/components/ButtonLink";
import { PortalShell } from "@/components/PortalShell";
import { contactLinks } from "@/data/landingContent";
import {
  adminAppointments,
  adminIntegrations,
  adminLeads,
  adminMetrics,
} from "@/data/portalContent";

const metricIcons = [CalendarClock, BadgeCheck, UserRound, CircleDollarSign] as const;

export function AdminDashboardPage() {
  return (
    <PortalShell
      badge="Administrador"
      title="Painel inicial da operação de agendamentos"
      description="Esta é a base da área administrativa da BeautyFlow. O objetivo aqui é centralizar agenda, confirmações, captação e visão de receita em uma interface clara."
      actions={
        <>
          <ButtonLink href={contactLinks.whatsapp} external variant="secondary">
            Abrir atendimento
          </ButtonLink>
          <Link
            to={contactLinks.clientPortal}
            className="inline-flex items-center justify-center rounded-full bg-[#F8C8DC] px-6 py-3 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(248,200,220,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffd8e8]"
          >
            Ver área do cliente
          </Link>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-4">
        {adminMetrics.map((metric, index) => {
          const Icon = metricIcons[index];

          return (
            <article
              key={metric.label}
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            >
              <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm text-white/60">{metric.label}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                {metric.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/55">{metric.detail}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Agenda de hoje</h2>
              <p className="text-sm text-white/58">
                Visualização inicial dos horários e status de atendimento.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {adminAppointments.map((appointment) => (
              <article
                key={`${appointment.time}-${appointment.client}`}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-white/8 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#F8C8DC]">
                    {appointment.time}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{appointment.client}</p>
                    <p className="mt-1 text-sm text-white/58">{appointment.service}</p>
                  </div>
                </div>

                <span className="inline-flex items-center rounded-full border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F8C8DC]">
                  {appointment.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Leads recentes</h2>
                <p className="text-sm text-white/58">
                  Contatos que entraram e precisam de acompanhamento.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {adminLeads.map((lead) => (
                <article
                  key={lead.name}
                  className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-white">{lead.name}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-[#F8C8DC]">
                      {lead.source}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/62">{lead.intent}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#F8C8DC]/15 bg-[linear-gradient(180deg,rgba(248,200,220,0.12),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-semibold text-white">Próximas integrações</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Estrutura sugerida para a próxima etapa de backend e automações.
            </p>

            <div className="mt-6 space-y-3">
              {adminIntegrations.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/8 bg-black/15 px-4 py-3 text-sm text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PortalShell>
  );
}
