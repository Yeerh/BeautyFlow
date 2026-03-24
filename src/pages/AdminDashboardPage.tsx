import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CircleDollarSign,
  LayoutPanelTop,
  LoaderCircle,
  LogOut,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { PortalShell } from "@/components/PortalShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
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

type AdminAccount = {
  id: number;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  businessName: string | null;
  role: string;
  createdAt: string;
};

const metricIcons = [CircleDollarSign, BadgeCheck, LayoutPanelTop, UserRound] as const;
const DASHBOARD_ERROR_MESSAGE =
  "Nao foi possivel carregar os dados do painel agora. Tente novamente em alguns instantes.";

function getReadableDashboardError(error: unknown, fallbackMessage: string) {
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
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${isoDate}T12:00:00`));
}

function formatCreatedDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(isoDate));
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
  const { logout, token, user } = useClientAuth();
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminAccount[]>([]);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");
  const [isCreatingAdminUser, setIsCreatingAdminUser] = useState(false);
  const [createAdminError, setCreateAdminError] = useState("");
  const [createAdminSuccess, setCreateAdminSuccess] = useState("");
  const [adminForm, setAdminForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    businessName: "",
    password: "",
  });

  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCancelled = false;

    async function loadBookings() {
      setIsLoadingBookings(true);
      setBookingsError("");

      try {
        const response = await fetch(buildApiUrl("/api/bookings"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
  }, [token]);

  useEffect(() => {
    if (!token || !isSuperAdmin) {
      setAdminUsers([]);
      setAdminUsersError("");
      return;
    }

    let isCancelled = false;

    async function loadAdminUsers() {
      setIsLoadingAdminUsers(true);
      setAdminUsersError("");

      try {
        const response = await fetch(buildApiUrl("/api/admin/users"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = (await response.json().catch(() => ({}))) as {
          items?: AdminAccount[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Nao foi possivel carregar as contas administradoras.");
        }

        if (!isCancelled) {
          setAdminUsers(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setAdminUsersError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAdminUsers(false);
        }
      }
    }

    loadAdminUsers();

    return () => {
      isCancelled = true;
    };
  }, [isSuperAdmin, token]);

  const metrics = useMemo(() => {
    const activeBookings = bookings.filter((booking) => booking.status !== "CANCELLED");
    const confirmedBookings = activeBookings.filter(
      (booking) => booking.status === "CONFIRMED",
    );
    const estimatedRevenue = activeBookings.reduce(
      (total, booking) => total + parsePriceValue(booking.servicePrice),
      0,
    );
    const averageTicket = activeBookings.length
      ? estimatedRevenue / activeBookings.length
      : 0;
    const uniqueClients = new Set(
      activeBookings.map((booking) => `${booking.clientName}-${booking.phone}`),
    ).size;

    return [
      {
        label: "Receita estimada",
        value: formatRevenue(estimatedRevenue),
        detail: "soma dos servicos agendados",
      },
      {
        label: "Confirmados",
        value: String(confirmedBookings.length),
        detail: `${Math.max(activeBookings.length - confirmedBookings.length, 0)} pendentes no fluxo`,
      },
      {
        label: "Agendamentos",
        value: String(activeBookings.length),
        detail: "reservas ativas no sistema",
      },
      {
        label: "Clientes",
        value: String(uniqueClients),
        detail: `ticket medio ${formatRevenue(averageTicket)}`,
      },
    ];
  }, [bookings]);

  const serviceBreakdown = useMemo(() => {
    const aggregatedServices = new Map<
      string,
      { serviceName: string; bookings: number; revenue: number }
    >();

    bookings
      .filter((booking) => booking.status !== "CANCELLED")
      .forEach((booking) => {
        const currentService = aggregatedServices.get(booking.serviceName) ?? {
          serviceName: booking.serviceName,
          bookings: 0,
          revenue: 0,
        };

        currentService.bookings += 1;
        currentService.revenue += parsePriceValue(booking.servicePrice);
        aggregatedServices.set(booking.serviceName, currentService);
      });

    return Array.from(aggregatedServices.values()).sort((left, right) => right.revenue - left.revenue);
  }, [bookings]);

  const handleLogout = () => {
    logout();
    window.location.assign("/admin-acesso");
  };

  const handleCreateAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    setCreateAdminError("");
    setCreateAdminSuccess("");
    setIsCreatingAdminUser(true);

    try {
      const response = await fetch(buildApiUrl("/api/admin/users"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminForm),
      });

      const data = (await response.json().catch(() => ({}))) as {
        user?: AdminAccount;
        message?: string;
      };

      if (!response.ok || !data.user) {
        throw new Error(data.message || "Nao foi possivel criar a conta administradora.");
      }

      setAdminUsers((current) => [data.user as AdminAccount, ...current]);
      setAdminForm({
        name: "",
        username: "",
        email: "",
        phone: "",
        businessName: "",
        password: "",
      });
      setCreateAdminSuccess("Conta administradora criada com sucesso.");
    } catch (error) {
      setCreateAdminError(
        getReadableDashboardError(
          error,
          "Nao foi possivel criar a conta administradora agora.",
        ),
      );
    } finally {
      setIsCreatingAdminUser(false);
    }
  };

  return (
    <PortalShell
      badge={isSuperAdmin ? "Super Admin" : "Administrador"}
      title={isSuperAdmin ? "Painel super admin" : "Painel administrativo"}
      description={
        isSuperAdmin
          ? "Centralize faturamento, agendamentos e crie contas administradoras para barbeiros e donos de estudio."
          : "Acompanhe agendamentos, faturamento e a operacao do negocio em um painel protegido."
      }
      actions={
        <>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <ShieldCheck className="h-4 w-4 text-[#F8C8DC]" />
            {user?.username || user?.email}
          </div>
          <ButtonLink href={contactLinks.whatsapp} external variant="secondary">
            Abrir atendimento
          </ButtonLink>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
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

      {bookingsError ? (
        <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {bookingsError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
              <LayoutPanelTop className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Agendamentos</h2>
              <p className="text-sm text-white/58">
                Reservas registradas no sistema com status e contato do cliente.
              </p>
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="mt-8 flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-4 text-sm text-white/65">
              <LoaderCircle className="h-4 w-4 animate-spin text-[#F8C8DC]" />
              Carregando agendamentos do sistema...
            </div>
          ) : null}

          {!isLoadingBookings && !bookings.length ? (
            <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
              Nenhum agendamento registrado ate agora.
            </div>
          ) : null}

          {!isLoadingBookings && bookings.length ? (
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

        <section className="rounded-[2rem] border border-[#F8C8DC]/15 bg-[linear-gradient(180deg,rgba(248,200,220,0.12),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Faturamento</h2>
              <p className="text-sm text-white/58">
                Visao consolidada de receita por servico para orientar a operacao.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {serviceBreakdown.length ? (
              serviceBreakdown.map((service) => (
                <div
                  key={service.serviceName}
                  className="rounded-[1.5rem] border border-white/8 bg-black/15 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{service.serviceName}</p>
                      <p className="mt-1 text-sm text-white/55">
                        {service.bookings} agendamento(s)
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-[#F8C8DC]">
                      {formatRevenue(service.revenue)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/8 bg-black/15 px-5 py-6 text-sm text-white/58">
                O dashboard de faturamento aparece assim que houver reservas registradas.
              </div>
            )}
          </div>
        </section>
      </div>

      {isSuperAdmin ? (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Contas administradoras</h2>
              <p className="text-sm text-white/58">
                Area exclusiva do super admin para criar contas de barbeiros e donos de estudio.
              </p>
            </div>
          </div>

          {adminUsersError ? (
            <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {adminUsersError}
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <form
              onSubmit={handleCreateAdmin}
              className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5"
            >
              <h3 className="text-xl font-semibold text-white">Nova conta admin</h3>
              <p className="mt-2 text-sm text-white/58">
                Crie o acesso do barbeiro ou dono do estudio com usuario e senha.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { key: "name", label: "Nome", type: "text", placeholder: "Nome do responsavel" },
                  { key: "username", label: "Usuario", type: "text", placeholder: "barbeiro01" },
                  { key: "email", label: "E-mail", type: "email", placeholder: "admin@negocio.com" },
                  { key: "phone", label: "Telefone", type: "tel", placeholder: "(81) 99999-9999" },
                  {
                    key: "businessName",
                    label: "Negocio",
                    type: "text",
                    placeholder: "Studio Prime",
                  },
                  { key: "password", label: "Senha", type: "password", placeholder: "Crie uma senha" },
                ].map((field) => (
                  <label key={field.key} className="space-y-2">
                    <span className="text-sm text-white/60">{field.label}</span>
                    <input
                      value={adminForm[field.key as keyof typeof adminForm]}
                      onChange={(event) =>
                        setAdminForm((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                      placeholder={field.placeholder}
                      type={field.type}
                      required
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={isCreatingAdminUser}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
              >
                {isCreatingAdminUser ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
                {isCreatingAdminUser ? "Criando conta..." : "Criar conta administradora"}
              </button>

              {createAdminError ? (
                <div className="mt-4 rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                  {createAdminError}
                </div>
              ) : null}

              {createAdminSuccess ? (
                <div className="mt-4 rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
                  {createAdminSuccess}
                </div>
              ) : null}
            </form>

            <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-white">Administradores criados</h3>
                {isLoadingAdminUsers ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#F8C8DC]" />
                ) : null}
              </div>

              {!isLoadingAdminUsers && !adminUsers.length ? (
                <div className="mt-6 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/58">
                  Nenhuma conta administradora criada ainda.
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                {adminUsers.map((adminAccount) => (
                  <article
                    key={adminAccount.id}
                    className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{adminAccount.name}</p>
                        <p className="mt-1 text-sm text-white/58">
                          {adminAccount.businessName || "Negocio nao informado"}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#F8C8DC]">
                        {adminAccount.username || "sem usuario"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/72">
                        <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                          E-mail
                        </span>
                        <span className="mt-2 block font-semibold text-white">
                          {adminAccount.email}
                        </span>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/72">
                        <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                          Telefone
                        </span>
                        <span className="mt-2 block font-semibold text-white">
                          {adminAccount.phone || "Sem telefone"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/40">
                      Criado em {formatCreatedDate(adminAccount.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </PortalShell>
  );
}
