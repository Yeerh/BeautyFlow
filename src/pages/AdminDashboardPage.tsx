import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  LayoutPanelTop,
  LoaderCircle,
  MessageSquareMore,
  Phone,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonLink } from "@/components/ButtonLink";
import { PortalShell } from "@/components/PortalShell";
import { contactLinks } from "@/data/landingContent";
import { adminIntegrations, adminLeads } from "@/data/portalContent";
import { buildApiUrl } from "@/lib/api";

type DashboardBooking = {
  id: number;
  clientName: string;
  phone: string;
  serviceName: string;
  servicePrice: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  createdAt: string;
};

const metricIcons = [CalendarClock, BadgeCheck, UserRound, CircleDollarSign] as const;
const DASHBOARD_ERROR_MESSAGE =
  "Nao foi possivel carregar os agendamentos do sistema agora. Tente novamente em alguns instantes.";

function getReadableDashboardError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

function getTodayIsoDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

function formatScheduledDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${isoDate}T12:00:00`));
}

function getStatusLabel(status: string) {
  if (status === "CONFIRMED") {
    return "Confirmado";
  }

  if (status === "CANCELLED") {
    return "Cancelado";
  }

  return "Pendente";
}

function getStatusClassName(status: string) {
  if (status === "CONFIRMED") {
    return "border-[#00C896]/20 bg-[#00C896]/10 text-[#00C896]";
  }

  if (status === "CANCELLED") {
    return "border-[#ef4444]/20 bg-[#ef4444]/10 text-[#fecaca]";
  }

  return "border-[#F8C8DC]/20 bg-[#F8C8DC]/10 text-[#F8C8DC]";
}

function parsePriceValue(price: string) {
  const normalizedPrice = price.replace(",", ".");
  const matchedPrice = normalizedPrice.match(/(\d+(\.\d+)?)/);

  return matchedPrice ? Number(matchedPrice[1]) : 0;
}

function formatRevenue(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}$`;
}

export function AdminDashboardPage() {
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadBookings() {
      setIsLoadingBookings(true);
      setBookingsError("");

      try {
        const response = await fetch(buildApiUrl("/api/bookings"));
        const data = (await response.json().catch(() => ({}))) as {
          items?: DashboardBooking[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Nao foi possivel carregar os agendamentos.");
        }

        if (!isCancelled) {
          setBookings(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setBookingsError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingBookings(false);
        }
      }
    }

    loadBookings();

    return () => {
      isCancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const todayIsoDate = getTodayIsoDate();
    const activeBookings = bookings.filter((booking) => booking.status !== "CANCELLED");
    const todayBookings = activeBookings.filter(
      (booking) => booking.scheduledDate === todayIsoDate,
    );
    const confirmedBookings = activeBookings.filter(
      (booking) => booking.status === "CONFIRMED",
    );
    const uniqueClients = new Set(
      activeBookings.map((booking) => `${booking.clientName}-${booking.phone}`),
    ).size;
    const estimatedRevenue = activeBookings.reduce(
      (total, booking) => total + parsePriceValue(booking.servicePrice),
      0,
    );

    return [
      {
        label: "Agendamentos",
        value: String(activeBookings.length),
        detail: todayBookings.length
          ? `${todayBookings.length} marcados para hoje`
          : "Sem reservas para hoje",
      },
      {
        label: "Confirmados",
        value: String(confirmedBookings.length),
        detail: `${Math.max(activeBookings.length - confirmedBookings.length, 0)} pendentes no fluxo`,
      },
      {
        label: "Clientes",
        value: String(uniqueClients),
        detail: "contatos com reserva no sistema",
      },
      {
        label: "Receita estimada",
        value: formatRevenue(estimatedRevenue),
        detail: "soma dos servicos agendados",
      },
    ];
  }, [bookings]);

  return (
    <PortalShell
      badge="Administrador"
      title="Painel de agendamentos"
      description="Area central para acompanhar o que foi agendado no sistema, acompanhar contatos e manter a operacao organizada."
      actions={
        <>
          <ButtonLink href={contactLinks.whatsapp} external variant="secondary">
            Abrir atendimento
          </ButtonLink>
          <Link
            to={contactLinks.clientPortal}
            className="inline-flex items-center justify-center rounded-full bg-[#F8C8DC] px-6 py-3 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(248,200,220,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffd8e8]"
          >
            Ver area do cliente
          </Link>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-4">
        {metrics.map((metric, index) => {
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
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Agendamentos</h2>
              <p className="text-sm text-white/58">
                Lista real das reservas que foram registradas no banco.
              </p>
            </div>
          </div>

          {bookingsError ? (
            <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {bookingsError}
            </div>
          ) : null}

          {isLoadingBookings ? (
            <div className="mt-8 flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-4 text-sm text-white/65">
              <LoaderCircle className="h-4 w-4 animate-spin text-[#F8C8DC]" />
              Carregando agendamentos do sistema...
            </div>
          ) : null}

          {!isLoadingBookings && !bookingsError && !bookings.length ? (
            <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
              Nenhum agendamento registrado ate agora.
            </div>
          ) : null}

          {!isLoadingBookings && !bookingsError && bookings.length ? (
            <div className="mt-8 space-y-4">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-white">
                          {booking.clientName}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                          #{booking.id}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/58">{booking.serviceName}</p>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClassName(
                        booking.status,
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                      <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                        Data
                      </span>
                      <span className="mt-2 block font-semibold text-white">
                        {formatScheduledDate(booking.scheduledDate)}
                      </span>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                      <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                        Horario
                      </span>
                      <span className="mt-2 block font-semibold text-white">
                        {booking.scheduledTime}
                      </span>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                      <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                        Telefone
                      </span>
                      <span className="mt-2 flex items-center gap-2 font-semibold text-white">
                        <Phone className="h-4 w-4 text-[#F8C8DC]" />
                        {booking.phone}
                      </span>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                      <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                        Valor
                      </span>
                      <span className="mt-2 block font-semibold text-white">
                        {booking.servicePrice}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Leads recentes</h2>
                <p className="text-sm text-white/58">
                  Contatos que ainda podem virar novos agendamentos.
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

          <section className="rounded-[2rem] border border-[#F8C8DC]/15 bg-[linear-gradient(180deg,rgba(248,200,220,0.12),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
            <h2 className="text-2xl font-semibold text-white">Proximas integracoes</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Estrutura sugerida para a proxima etapa de automacao do sistema.
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
