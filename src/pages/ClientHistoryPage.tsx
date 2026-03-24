import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSidebarShell } from "@/components/RoleSidebarShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { buildApiUrl } from "@/lib/api";
import { buildClientMenu, clientRoutes } from "@/lib/portalNavigation";

type HistoryBooking = {
  id: number;
  locationId: number | null;
  locationName: string;
  locationAddress: string | null;
  serviceName: string;
  servicePrice: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  createdAt: string;
};

const HISTORY_ERROR_MESSAGE =
  "Nao foi possivel carregar suas reservas agora. Tente novamente em alguns instantes.";

function getReadableHistoryError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

function formatScheduledDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
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

function buildBookingDateTime(booking: HistoryBooking) {
  return new Date(`${booking.scheduledDate}T${booking.scheduledTime}:00`);
}

export function ClientHistoryPage() {
  const navigate = useNavigate();
  const { logout, token, user } = useClientAuth();
  const [bookings, setBookings] = useState<HistoryBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadBookings() {
      if (!token) {
        setBookings([]);
        setIsLoadingBookings(false);
        return;
      }

      setIsLoadingBookings(true);
      setHistoryError("");

      try {
        const response = await fetch(buildApiUrl("/api/bookings/mine"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = (await response.json().catch(() => ({}))) as {
          items?: HistoryBooking[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Nao foi possivel carregar suas reservas.");
        }

        if (!isCancelled) {
          setBookings(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setHistoryError(getReadableHistoryError(error, HISTORY_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingBookings(false);
        }
      }
    }

    void loadBookings();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate(contactLinks.clientPortal, { replace: true });
  };

  const menuItems = buildClientMenu(handleLogout);

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort(
        (left, right) =>
          buildBookingDateTime(right).getTime() - buildBookingDateTime(left).getTime(),
      ),
    [bookings],
  );

  const upcomingBookings = useMemo(() => {
    const now = Date.now();

    return sortedBookings
      .filter(
        (booking) =>
          booking.status !== "CANCELLED" && buildBookingDateTime(booking).getTime() >= now,
      )
      .sort(
        (left, right) =>
          buildBookingDateTime(left).getTime() - buildBookingDateTime(right).getTime(),
      );
  }, [sortedBookings]);

  const nextBooking = upcomingBookings[0] ?? null;
  const uniqueLocations = useMemo(
    () => new Set(sortedBookings.map((booking) => booking.locationName)).size,
    [sortedBookings],
  );

  return (
    <RoleSidebarShell
      badge="Historico"
      title="Minhas reservas"
      description="Veja os locais que voce ja agendou, com data, horario e status de cada reserva."
      menuItems={menuItems}
      userName={user?.name || "BeautyFlow"}
      userSubtitle={user?.email || "Agenda pessoal"}
      userImageUrl={user?.businessPhotoUrl || null}
      actions={
        <button
          type="button"
          onClick={() => navigate(clientRoutes.bookings)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
        >
          <CalendarDays className="h-4 w-4" />
          Novo agendamento
        </button>
      }
    >
      {historyError ? (
        <div className="mb-6 flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {historyError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Proxima reserva</h2>
              <p className="mt-1 text-sm text-white/58">
                O proximo horario confirmado ou pendente aparece em destaque aqui.
              </p>
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-4 text-sm text-white/65">
              <LoaderCircle className="h-4 w-4 animate-spin text-[#00C896]" />
              Carregando suas reservas...
            </div>
          ) : nextBooking ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-white">{nextBooking.locationName}</p>
                    <p className="mt-2 text-sm text-white/58">{nextBooking.serviceName}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClassName(
                      nextBooking.status,
                    )}`}
                  >
                    {getStatusLabel(nextBooking.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                    <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                      Data
                    </span>
                    <span className="mt-2 block font-semibold text-white">
                      {formatScheduledDate(nextBooking.scheduledDate)}
                    </span>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                    <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                      Horario
                    </span>
                    <span className="mt-2 block font-semibold text-white">
                      {nextBooking.scheduledTime}
                    </span>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                    <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                      Valor
                    </span>
                    <span className="mt-2 block font-semibold text-white">
                      {nextBooking.servicePrice}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                  {nextBooking.locationAddress || "Endereco nao informado"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Reservas",
                    value: String(sortedBookings.length),
                  },
                  {
                    label: "Proximas",
                    value: String(upcomingBookings.length),
                  },
                  {
                    label: "Locais",
                    value: String(uniqueLocations),
                  },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                      {item.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
              Nenhuma reserva futura encontrada. Escolha um local para agendar o proximo horario.
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Locais agendados</h2>
              <p className="mt-1 text-sm text-white/58">
                Seu historico completo com local, horario e data de cada reserva.
              </p>
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-4 text-sm text-white/65">
              <LoaderCircle className="h-4 w-4 animate-spin text-[#00C896]" />
              Carregando historico...
            </div>
          ) : !sortedBookings.length ? (
            <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
              Ainda nao existe nenhuma reserva registrada na sua conta.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {sortedBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-white">{booking.locationName}</p>
                      <p className="mt-2 text-sm text-white/58">{booking.serviceName}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClassName(
                        booking.status,
                      )}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Data
                      </span>
                      <span className="mt-2 block font-semibold text-white">
                        {formatScheduledDate(booking.scheduledDate)}
                      </span>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
                        <Clock3 className="h-3.5 w-3.5" />
                        Horario
                      </span>
                      <span className="mt-2 block font-semibold text-white">
                        {booking.scheduledTime}
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

                  <div className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                    {booking.locationAddress || "Endereco nao informado"}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleSidebarShell>
  );
}
