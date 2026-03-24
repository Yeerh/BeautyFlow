import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  BadgeCheck,
  CircleDollarSign,
  LayoutPanelTop,
  LoaderCircle,
  LogOut,
  MapPin,
  PencilLine,
  Power,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";
import { NavLink, Navigate, useLocation } from "react-router-dom";
import { PortalShell } from "@/components/PortalShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { buildApiUrl } from "@/lib/api";

type DashboardBooking = {
  id: number;
  adminId: number | null;
  clientName: string;
  phone: string;
  serviceName: string;
  servicePrice: string;
  servicePriceCents: number;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  createdAt: string;
  locationName: string | null;
};

type AdminAccount = {
  id: number;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  businessName: string | null;
  businessPhotoUrl: string | null;
  businessAddress: string | null;
  isActive: boolean;
  role: string;
  createdAt: string;
};

type ServiceItem = {
  id: number;
  adminId: number;
  name: string;
  description: string;
  priceCents: number;
  priceLabel: string;
  isActive: boolean;
  createdAt: string;
};

type AdminNavItem = {
  to: string;
  label: string;
};

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

const DASHBOARD_ERROR_MESSAGE =
  "Não foi possível carregar os dados do painel agora. Tente novamente em alguns instantes.";

const metricIcons = [CircleDollarSign, BadgeCheck, LayoutPanelTop, UserRound] as const;

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin/painel", label: "Painel" },
  { to: "/admin/perfil", label: "Perfil" },
  { to: "/admin/servicos", label: "Serviços" },
];

const SUPER_ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin/painel", label: "Painel" },
  { to: "/admin/administradores", label: "Administradores" },
  { to: "/admin/agendamentos", label: "Agendamentos" },
];

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

function formatCreatedDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
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

function formatRevenue(valueInCents: number) {
  return `${(valueInCents / 100).toFixed(2).replace(".", ",")}$`;
}

function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2).replace(".", ",");
}

function parsePriceInput(value: string) {
  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");

  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue * 100)
    : null;
}

function buildAccountForm(account?: Partial<AdminAccount> | null) {
  return {
    name: account?.name ?? "",
    username: account?.username ?? "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
    businessName: account?.businessName ?? "",
    businessPhotoUrl: account?.businessPhotoUrl ?? "",
    businessAddress: account?.businessAddress ?? "",
    password: "",
    isActive: Boolean(account?.isActive ?? true),
  };
}

function MetricsGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
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
  );
}

function BookingsList({
  bookings,
  isLoading,
  emptyMessage,
  loadingMessage,
  showLocation,
}: {
  bookings: DashboardBooking[];
  isLoading: boolean;
  emptyMessage: string;
  loadingMessage: string;
  showLocation?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-4 text-sm text-white/65">
        <LoaderCircle className="h-4 w-4 animate-spin text-[#F8C8DC]" />
        {loadingMessage}
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold text-white">{booking.clientName}</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                  #{booking.id}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/58">
                {showLocation && booking.locationName ? `${booking.locationName} · ` : ""}
                {booking.serviceName}
              </p>
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
                Horário
              </span>
              <span className="mt-2 block font-semibold text-white">
                {booking.scheduledTime}
              </span>
            </div>
            <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
              <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                Telefone
              </span>
              <span className="mt-2 block font-semibold text-white">{booking.phone}</span>
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
  );
}

export function AdminDashboardPage() {
  const location = useLocation();
  const { logout, token, user } = useClientAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const todayIsoDate = useMemo(() => getTodayIsoDate(), []);

  const [profile, setProfile] = useState<AdminAccount | null>(null);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminAccount[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [adminUsersError, setAdminUsersError] = useState("");
  const [servicesError, setServicesError] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    businessName: "",
    businessPhotoUrl: "",
    businessAddress: "",
  });
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [adminForm, setAdminForm] = useState(buildAccountForm());
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [adminActionError, setAdminActionError] = useState("");
  const [adminActionSuccess, setAdminActionSuccess] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [isSubmittingService, setIsSubmittingService] = useState(false);
  const [serviceActionError, setServiceActionError] = useState("");
  const [serviceActionSuccess, setServiceActionSuccess] = useState("");
  const [profileZipCode, setProfileZipCode] = useState("");
  const [zipLookupError, setZipLookupError] = useState("");
  const [zipLookupSuccess, setZipLookupSuccess] = useState("");
  const [isLookingUpZipCode, setIsLookingUpZipCode] = useState(false);
  const [profileUploadError, setProfileUploadError] = useState("");

  const navItems = isSuperAdmin ? SUPER_ADMIN_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const currentPath = location.pathname.replace(/\/$/, "") || "/admin";
  const defaultPath = navItems[0]?.to || "/admin/painel";

  useEffect(() => {
    if (!token) {
      return;
    }

    async function loadBookings(authToken: string) {
      setIsLoadingBookings(true);
      setBookingsError("");

      try {
        const response = await fetch(buildApiUrl("/api/bookings"), {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = (await response.json().catch(() => ({}))) as {
          items?: DashboardBooking[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Não foi possível carregar os agendamentos.");
        }

        setBookings(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        setBookingsError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
      } finally {
        setIsLoadingBookings(false);
      }
    }

    async function loadProfile(authToken: string) {
      setIsLoadingProfile(true);
      setProfileError("");

      try {
        const response = await fetch(buildApiUrl("/api/admin/profile"), {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = (await response.json().catch(() => ({}))) as {
          profile?: AdminAccount | null;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Não foi possível carregar o perfil.");
        }

        setProfile(data.profile ?? null);
      } catch (error) {
        setProfileError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
      } finally {
        setIsLoadingProfile(false);
      }
    }

    void loadBookings(token);
    void loadProfile(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    async function loadAdminUsers(authToken: string) {
      setIsLoadingAdminUsers(true);
      setAdminUsersError("");

      try {
        const response = await fetch(buildApiUrl("/api/admin/users"), {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = (await response.json().catch(() => ({}))) as {
          items?: AdminAccount[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Não foi possível carregar as contas.");
        }

        setAdminUsers(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        setAdminUsersError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
      } finally {
        setIsLoadingAdminUsers(false);
      }
    }

    async function loadServices(authToken: string) {
      setIsLoadingServices(true);
      setServicesError("");

      try {
        const response = await fetch(buildApiUrl("/api/admin/services"), {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = (await response.json().catch(() => ({}))) as {
          items?: ServiceItem[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Não foi possível carregar os serviços.");
        }

        setServices(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        setServicesError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
      } finally {
        setIsLoadingServices(false);
      }
    }

    if (isSuperAdmin) {
      void loadAdminUsers(token);
      setServices([]);
      return;
    }

    setAdminUsers([]);
    void loadServices(token);
  }, [isSuperAdmin, token]);

  useEffect(() => {
    if (!profile || isSuperAdmin) {
      return;
    }

    setProfileForm({
      name: profile.name,
      phone: profile.phone ?? "",
      businessName: profile.businessName ?? "",
      businessPhotoUrl: profile.businessPhotoUrl ?? "",
      businessAddress: profile.businessAddress ?? "",
    });
  }, [isSuperAdmin, profile]);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== "CANCELLED"),
    [bookings],
  );

  const todayBookings = useMemo(
    () => activeBookings.filter((booking) => booking.scheduledDate === todayIsoDate),
    [activeBookings, todayIsoDate],
  );

  const totalRevenueCents = useMemo(
    () =>
      activeBookings.reduce(
        (total, booking) => total + Number(booking.servicePriceCents || 0),
        0,
      ),
    [activeBookings],
  );

  const todayRevenueCents = useMemo(
    () =>
      todayBookings.reduce(
        (total, booking) => total + Number(booking.servicePriceCents || 0),
        0,
      ),
    [todayBookings],
  );

  const metrics = useMemo(() => {
    if (isSuperAdmin) {
      return [
        {
          label: "Faturamento geral",
          value: formatRevenue(totalRevenueCents),
          detail: "somatório de todos os agendamentos ativos",
        },
        {
          label: "Administradores",
          value: String(adminUsers.length),
          detail: `${adminUsers.filter((item) => item.isActive).length} contas ativas`,
        },
        {
          label: "Agendamentos",
          value: String(activeBookings.length),
          detail: `${todayBookings.length} reservados para hoje`,
        },
        {
          label: "Locais ativos",
          value: String(
            new Set(activeBookings.map((item) => item.adminId)).size ||
              adminUsers.filter((item) => item.isActive).length,
          ),
          detail: "barbearias e estúdios em operação",
        },
      ];
    }

    const uniqueClientsToday = new Set(
      todayBookings.map((booking) => `${booking.clientName}-${booking.phone}`),
    ).size;

    return [
      {
        label: "Faturamento diário",
        value: formatRevenue(todayRevenueCents),
        detail: `baseado em ${todayBookings.length} agendamento(s) de hoje`,
      },
      {
        label: "Clientes agendados",
        value: String(uniqueClientsToday),
        detail: "clientes únicos no dia",
      },
      {
        label: "Histórico",
        value: String(activeBookings.length),
        detail: "atendimentos registrados no sistema",
      },
      {
        label: "Serviços ativos",
        value: String(services.filter((service) => service.isActive).length),
        detail: `${services.length} serviços cadastrados`,
      },
    ];
  }, [activeBookings, adminUsers, isSuperAdmin, services, todayBookings, todayRevenueCents, totalRevenueCents]);

  const locationBreakdown = useMemo(() => {
    const grouped = new Map<
      string,
      { locationName: string; bookings: number; revenueCents: number }
    >();

    activeBookings.forEach((booking) => {
      const key = booking.locationName || "Local não informado";
      const current = grouped.get(key) ?? {
        locationName: key,
        bookings: 0,
        revenueCents: 0,
      };

      current.bookings += 1;
      current.revenueCents += Number(booking.servicePriceCents || 0);
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort(
      (left, right) => right.revenueCents - left.revenueCents,
    );
  }, [activeBookings]);

  const handleLogout = () => {
    logout();
    window.location.assign("/admin-acesso");
  };

  const handleBusinessPhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileUploadError("Selecione apenas arquivos de imagem.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileUploadError("Use uma imagem de até 2MB para a foto do local.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";

      if (!result) {
        setProfileUploadError("Não foi possível carregar a imagem selecionada.");
        return;
      }

      setProfileForm((current) => ({
        ...current,
        businessPhotoUrl: result,
      }));
      setProfileUploadError("");
    };

    reader.onerror = () => {
      setProfileUploadError("Não foi possível carregar a imagem selecionada.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleZipLookup = async () => {
    const normalizedZipCode = profileZipCode.replace(/\D/g, "");

    if (normalizedZipCode.length !== 8) {
      setZipLookupError("Informe um CEP válido com 8 dígitos.");
      setZipLookupSuccess("");
      return;
    }

    setIsLookingUpZipCode(true);
    setZipLookupError("");
    setZipLookupSuccess("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${normalizedZipCode}/json/`);
      const data = (await response.json().catch(() => ({}))) as ViaCepResponse;

      if (!response.ok || data.erro) {
        throw new Error("CEP não encontrado.");
      }

      const addressParts = [
        data.logradouro?.trim(),
        data.bairro?.trim(),
        [data.localidade?.trim(), data.uf?.trim()].filter(Boolean).join(" - "),
      ].filter(Boolean);

      setProfileForm((current) => ({
        ...current,
        businessAddress: addressParts.join(" - "),
      }));
      setZipLookupSuccess(
        [data.localidade?.trim(), data.uf?.trim()].filter(Boolean).join(" / ") ||
          "Endereço encontrado.",
      );
    } catch (error) {
      setZipLookupError(
        getReadableDashboardError(error, "Não foi possível consultar o CEP agora."),
      );
    } finally {
      setIsLookingUpZipCode(false);
    }
  };

  const resetAdminForm = () => {
    setEditingAdminId(null);
    setAdminForm(buildAccountForm());
    setAdminActionError("");
    setAdminActionSuccess("");
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setServiceForm({
      name: "",
      description: "",
      price: "",
    });
    setServiceActionError("");
    setServiceActionSuccess("");
  };

  const refreshAdminUsers = async () => {
    if (!token) {
      return;
    }

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
        throw new Error(data.message || "Não foi possível carregar as contas.");
      }

      setAdminUsers(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setAdminUsersError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
    } finally {
      setIsLoadingAdminUsers(false);
    }
  };

  const refreshServices = async () => {
    if (!token) {
      return;
    }

    setIsLoadingServices(true);
    setServicesError("");

    try {
      const response = await fetch(buildApiUrl("/api/admin/services"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json().catch(() => ({}))) as {
        items?: ServiceItem[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível carregar os serviços.");
      }

      setServices(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setServicesError(getReadableDashboardError(error, DASHBOARD_ERROR_MESSAGE));
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || isSuperAdmin) {
      return;
    }

    setIsSubmittingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await fetch(buildApiUrl("/api/admin/profile"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = (await response.json().catch(() => ({}))) as {
        profile?: AdminAccount;
        message?: string;
      };

      if (!response.ok || !data.profile) {
        throw new Error(data.message || "Não foi possível salvar o estabelecimento.");
      }

      setProfile(data.profile);
      setProfileSuccess("Perfil do estabelecimento atualizado.");
    } catch (error) {
      setProfileError(
        getReadableDashboardError(
          error,
          "Não foi possível atualizar o estabelecimento agora.",
        ),
      );
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleAdminSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !isSuperAdmin) {
      return;
    }

    const isEditing = Boolean(editingAdminId);

    setIsSubmittingAdmin(true);
    setAdminActionError("");
    setAdminActionSuccess("");

    try {
      const response = await fetch(buildApiUrl("/api/admin/users"), {
        method: editingAdminId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingAdminId ? { id: editingAdminId, ...adminForm } : adminForm,
        ),
      });
      const data = (await response.json().catch(() => ({}))) as {
        user?: AdminAccount;
        message?: string;
      };

      if (!response.ok || !data.user) {
        throw new Error(data.message || "Não foi possível salvar a conta administradora.");
      }

      await refreshAdminUsers();
      resetAdminForm();
      setAdminActionSuccess(
        isEditing
          ? "Conta administradora atualizada com sucesso."
          : "Conta administradora criada com sucesso.",
      );
    } catch (error) {
      setAdminActionError(
        getReadableDashboardError(
          error,
          "Não foi possível salvar a conta administradora agora.",
        ),
      );
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (account: AdminAccount) => {
    if (!token || !isSuperAdmin) {
      return;
    }

    if (!window.confirm(`Excluir a conta ${account.businessName || account.name}?`)) {
      return;
    }

    setAdminActionError("");
    setAdminActionSuccess("");

    try {
      const response = await fetch(buildApiUrl(`/api/admin/users?id=${account.id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "Não foi possível excluir a conta.");
      }

      await refreshAdminUsers();

      if (editingAdminId === account.id) {
        resetAdminForm();
      }

      setAdminActionSuccess("Conta administradora excluída.");
    } catch (error) {
      setAdminActionError(
        getReadableDashboardError(
          error,
          "Não foi possível excluir a conta administradora agora.",
        ),
      );
    }
  };

  const handleServiceSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || isSuperAdmin) {
      return;
    }

    const isEditing = Boolean(editingServiceId);
    const priceCents = parsePriceInput(serviceForm.price);

    if (!priceCents) {
      setServiceActionError("Informe um preço válido para o serviço.");
      return;
    }

    setIsSubmittingService(true);
    setServiceActionError("");
    setServiceActionSuccess("");

    try {
      const response = await fetch(buildApiUrl("/api/admin/services"), {
        method: editingServiceId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingServiceId
            ? {
                id: editingServiceId,
                name: serviceForm.name,
                description: serviceForm.description,
                priceCents,
              }
            : {
                name: serviceForm.name,
                description: serviceForm.description,
                priceCents,
              },
        ),
      });
      const data = (await response.json().catch(() => ({}))) as {
        service?: ServiceItem;
        message?: string;
      };

      if (!response.ok || !data.service) {
        throw new Error(data.message || "Não foi possível salvar o serviço.");
      }

      await refreshServices();
      resetServiceForm();
      setServiceActionSuccess(
        isEditing ? "Serviço atualizado com sucesso." : "Serviço criado com sucesso.",
      );
    } catch (error) {
      setServiceActionError(
        getReadableDashboardError(error, "Não foi possível salvar o serviço agora."),
      );
    } finally {
      setIsSubmittingService(false);
    }
  };

  const handleToggleService = async (service: ServiceItem) => {
    if (!token || isSuperAdmin) {
      return;
    }

    setServiceActionError("");
    setServiceActionSuccess("");

    try {
      const response = await fetch(buildApiUrl("/api/admin/services"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: service.id,
          isActive: !service.isActive,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        service?: ServiceItem;
        message?: string;
      };

      if (!response.ok || !data.service) {
        throw new Error(data.message || "Não foi possível atualizar o status do serviço.");
      }

      await refreshServices();
      setServiceActionSuccess(
        data.service.isActive
          ? "Serviço ativado com sucesso."
          : "Serviço desativado com sucesso.",
      );
    } catch (error) {
      setServiceActionError(
        getReadableDashboardError(
          error,
          "Não foi possível atualizar o status do serviço agora.",
        ),
      );
    }
  };

  const navigation = (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "border-[#00C896]/35 bg-[#00C896]/12 text-[#00C896]"
                  : "border-white/10 bg-white/5 text-white/72 hover:-translate-y-0.5 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );

  if (currentPath === "/admin") {
    return <Navigate to={defaultPath} replace />;
  }

  if (!navItems.some((item) => item.to === currentPath)) {
    return <Navigate to={defaultPath} replace />;
  }

  const renderSuperAdminOverview = (
    <>
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
            <LayoutPanelTop className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Painel global</h2>
            <p className="text-sm text-white/58">
              Visão geral dos estabelecimentos e do faturamento do sistema.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {locationBreakdown.length ? (
            locationBreakdown.map((item) => (
              <article
                key={item.locationName}
                className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.locationName}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {item.bookings} agendamento(s)
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-[#00C896]">
                    {formatRevenue(item.revenueCents)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
              O dashboard global aparece assim que houver reservas registradas.
            </div>
          )}
        </div>
      </section>
    </>
  );

  const renderAdminOverview = (
    <>
      <section className="rounded-[2rem] border border-[#F8C8DC]/15 bg-[linear-gradient(180deg,rgba(248,200,220,0.12),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Painel do estabelecimento</h2>
            <p className="text-sm text-white/58">
              Faturamento diário, clientes agendados e histórico do local.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {todayBookings.length ? (
            todayBookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{booking.clientName}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {booking.scheduledTime} · {booking.serviceName}
                    </p>
                  </div>
                  <span className="text-base font-semibold text-[#F8C8DC]">
                    {booking.servicePrice}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/58">Telefone: {booking.phone}</p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
              Nenhum cliente agendado para hoje.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
        <h2 className="text-2xl font-semibold text-white">Histórico de atendimentos</h2>
        <p className="mt-2 text-sm text-white/58">
          Todas as reservas registradas para este estabelecimento.
        </p>
        <BookingsList
          bookings={bookings}
          isLoading={isLoadingBookings}
          emptyMessage="Nenhum atendimento registrado até agora."
          loadingMessage="Carregando histórico..."
        />
      </section>
    </>
  );

  const renderProfilePage = (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Perfil</h2>
          <p className="text-sm text-white/58">
            Atualize nome do estabelecimento, foto do local e endereço com CEP.
          </p>
        </div>
      </div>

      {(profileError || profileSuccess || zipLookupError || zipLookupSuccess || profileUploadError) ? (
        <div className="mt-6 space-y-3">
          {profileError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {profileError}
            </div>
          ) : null}
          {profileSuccess ? (
            <div className="rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
              {profileSuccess}
            </div>
          ) : null}
          {zipLookupError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {zipLookupError}
            </div>
          ) : null}
          {zipLookupSuccess ? (
            <div className="rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
              CEP localizado: {zipLookupSuccess}
            </div>
          ) : null}
          {profileUploadError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {profileUploadError}
            </div>
          ) : null}
        </div>
      ) : null}

      {isLoadingProfile ? (
        <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-4 text-sm text-white/65">
          <LoaderCircle className="h-4 w-4 animate-spin text-[#00C896]" />
          Carregando perfil do estabelecimento...
        </div>
      ) : (
        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
            <span className="text-sm text-white/60">Foto do local</span>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
                {profileForm.businessPhotoUrl ? (
                  <img
                    src={profileForm.businessPhotoUrl}
                    alt={profileForm.businessName || "Foto do local"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-white/45">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/78 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]">
                  Upload da foto
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleBusinessPhotoUpload}
                  />
                </label>

                {profileForm.businessPhotoUrl ? (
                  <button
                    type="button"
                    onClick={() =>
                      setProfileForm((current) => ({
                        ...current,
                        businessPhotoUrl: "",
                      }))
                    }
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:border-[#ef4444]/35 hover:text-[#fecaca]"
                  >
                    Remover foto
                  </button>
                ) : null}

                <p className="text-xs leading-6 text-white/42">
                  Imagem em JPG, PNG ou WebP com até 2MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.68fr_0.32fr]">
            <label className="space-y-2">
              <span className="text-sm text-white/60">Buscar CEP</span>
              <input
                value={profileZipCode}
                onChange={(event) => setProfileZipCode(event.target.value)}
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                placeholder="00000-000"
                inputMode="numeric"
              />
            </label>

            <button
              type="button"
              onClick={() => void handleZipLookup()}
              disabled={isLookingUpZipCode}
              className="mt-7 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/78 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
            >
              {isLookingUpZipCode ? "Buscando CEP..." : "Buscar CEP"}
            </button>
          </div>

          {[
            { key: "businessName", label: "Nome do estabelecimento", type: "text" },
            { key: "name", label: "Nome do proprietário", type: "text" },
            { key: "phone", label: "Telefone", type: "tel" },
            { key: "businessAddress", label: "Endereço / local", type: "text" },
          ].map((field) => (
            <label key={field.key} className="space-y-2">
              <span className="text-sm text-white/60">{field.label}</span>
              <input
                value={profileForm[field.key as keyof typeof profileForm]}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                type={field.type}
                required
              />
            </label>
          ))}

          <button
            type="submit"
            disabled={isSubmittingProfile}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
          >
            {isSubmittingProfile ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Store className="h-4 w-4" />
            )}
            Salvar perfil
          </button>
        </form>
      )}
    </section>
  );

  const renderServicesPage = (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Serviços</h2>
            <p className="text-sm text-white/58">
              Cadastre serviços, edite valores e ative ou desative itens.
            </p>
          </div>
        </div>

        {(servicesError || serviceActionError || serviceActionSuccess) ? (
          <div className="mt-6 space-y-3">
            {servicesError ? (
              <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                {servicesError}
              </div>
            ) : null}
            {serviceActionError ? (
              <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                {serviceActionError}
              </div>
            ) : null}
            {serviceActionSuccess ? (
              <div className="rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
                {serviceActionSuccess}
              </div>
            ) : null}
          </div>
        ) : null}

        <form
          onSubmit={handleServiceSubmit}
          className="mt-6 rounded-[1.75rem] border border-white/8 bg-black/20 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingServiceId ? "Editar serviço" : "Novo serviço"}
              </h3>
              <p className="mt-2 text-sm text-white/58">
                Defina nome, descrição e preço do atendimento.
              </p>
            </div>
            {editingServiceId ? (
              <button
                type="button"
                onClick={resetServiceForm}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/65 transition-colors duration-300 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
              >
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            <label className="space-y-2">
              <span className="text-sm text-white/60">Nome do serviço</span>
              <input
                value={serviceForm.name}
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/60">Descrição</span>
              <textarea
                value={serviceForm.description}
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-white/60">Preço</span>
              <input
                value={serviceForm.price}
                onChange={(event) =>
                  setServiceForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                placeholder="60,00"
                inputMode="decimal"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmittingService}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
          >
            {isSubmittingService ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            {editingServiceId ? "Salvar serviço" : "Criar serviço"}
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Serviços cadastrados</h2>
            <p className="mt-2 text-sm text-white/58">
              Controle de disponibilidade e valores do estabelecimento.
            </p>
          </div>
          {isLoadingServices ? (
            <LoaderCircle className="h-4 w-4 animate-spin text-[#F8C8DC]" />
          ) : null}
        </div>

        {!isLoadingServices && !services.length ? (
          <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-6 text-sm text-white/58">
            Nenhum serviço cadastrado ainda.
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {services.map((service) => (
            <article
              key={service.id}
              className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-white">{service.name}</p>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        service.isActive
                          ? "border-[#00C896]/20 bg-[#00C896]/10 text-[#00C896]"
                          : "border-[#ef4444]/20 bg-[#ef4444]/10 text-[#fecaca]"
                      }`}
                    >
                      {service.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    {service.description || "Sem descrição cadastrada."}
                  </p>
                </div>
                <span className="text-lg font-semibold text-[#F8C8DC]">
                  {service.priceLabel}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingServiceId(service.id);
                    setServiceForm({
                      name: service.name,
                      description: service.description,
                      price: formatPriceInput(service.priceCents),
                    });
                    setServiceActionError("");
                    setServiceActionSuccess("");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors duration-300 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
                >
                  <PencilLine className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void handleToggleService(service)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-2 text-sm text-[#d7fff4] transition-colors duration-300 hover:bg-[#00C896]/15"
                >
                  <Power className="h-4 w-4" />
                  {service.isActive ? "Desativar" : "Ativar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  const renderAdminAccountsPage = (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Administradores</h2>
          <p className="text-sm text-white/58">
            Crie, edite e remova as contas dos barbeiros e donos de estúdio.
          </p>
        </div>
      </div>

      {(adminUsersError || adminActionError || adminActionSuccess) ? (
        <div className="mt-6 space-y-3">
          {adminUsersError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {adminUsersError}
            </div>
          ) : null}
          {adminActionError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {adminActionError}
            </div>
          ) : null}
          {adminActionSuccess ? (
            <div className="rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
              {adminActionSuccess}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={handleAdminSubmit}
          className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingAdminId ? "Editar administrador" : "Novo administrador"}
              </h3>
              <p className="mt-2 text-sm text-white/58">
                Configure o acesso do estabelecimento e seus dados principais.
              </p>
            </div>
            {editingAdminId ? (
              <button
                type="button"
                onClick={resetAdminForm}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/65 transition-colors duration-300 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
              >
                Cancelar
              </button>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            {[
              { key: "name", label: "Proprietário", type: "text", required: true },
              { key: "username", label: "Usuário", type: "text", required: true },
              { key: "email", label: "E-mail", type: "email", required: true },
              { key: "phone", label: "Telefone", type: "tel", required: true },
              { key: "businessName", label: "Estabelecimento", type: "text", required: true },
              { key: "businessPhotoUrl", label: "Foto do local", type: "url", required: false },
              { key: "businessAddress", label: "Endereço", type: "text", required: false },
              {
                key: "password",
                label: editingAdminId ? "Nova senha" : "Senha",
                type: "password",
                required: !editingAdminId,
              },
            ].map((field) => (
              <label key={field.key} className="space-y-2">
                <span className="text-sm text-white/60">{field.label}</span>
                <input
                  value={adminForm[field.key as keyof typeof adminForm].toString()}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  type={field.type}
                  required={field.required}
                />
              </label>
            ))}

            <label className="space-y-2">
              <span className="text-sm text-white/60">Status da conta</span>
              <select
                value={adminForm.isActive ? "active" : "inactive"}
                onChange={(event) =>
                  setAdminForm((current) => ({
                    ...current,
                    isActive: event.target.value === "active",
                  }))
                }
                className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-[#00C896]/35"
              >
                <option value="active" className="bg-[#101010] text-white">
                  Ativa
                </option>
                <option value="inactive" className="bg-[#101010] text-white">
                  Inativa
                </option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmittingAdmin}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
          >
            {isSubmittingAdmin ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {editingAdminId ? "Salvar alterações" : "Criar conta administradora"}
          </button>
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
            {adminUsers.map((account) => (
              <article
                key={account.id}
                className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {account.businessName || account.name}
                    </p>
                    <p className="mt-1 text-sm text-white/58">
                      Proprietário: {account.name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      account.isActive
                        ? "border-[#00C896]/20 bg-[#00C896]/10 text-[#00C896]"
                        : "border-[#ef4444]/20 bg-[#ef4444]/10 text-[#fecaca]"
                    }`}
                  >
                    {account.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                      Usuário
                    </span>
                    <span className="mt-2 block font-semibold text-white">
                      {account.username || "-"}
                    </span>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                      Telefone
                    </span>
                    <span className="mt-2 block font-semibold text-white">
                      {account.phone || "Sem telefone"}
                    </span>
                  </div>
                </div>

                <p className="mt-4 flex items-center gap-2 text-sm text-white/55">
                  <MapPin className="h-4 w-4 text-[#F8C8DC]" />
                  {account.businessAddress || "Endereço não informado"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">
                  Criado em {formatCreatedDate(account.createdAt)}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAdminId(account.id);
                      setAdminForm(buildAccountForm(account));
                      setAdminActionError("");
                      setAdminActionSuccess("");
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70 transition-colors duration-300 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
                  >
                    <PencilLine className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDeleteAdmin(account)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-2 text-sm text-[#fecaca] transition-colors duration-300 hover:bg-[#ef4444]/15"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderCurrentPage = () => {
    if (isSuperAdmin) {
      if (currentPath === "/admin/administradores") {
        return renderAdminAccountsPage;
      }

      if (currentPath === "/admin/agendamentos") {
        return (
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
            <h2 className="text-2xl font-semibold text-white">Agendamentos do sistema</h2>
            <p className="mt-2 text-sm text-white/58">
              Visão completa das reservas criadas por local.
            </p>
            <BookingsList
              bookings={bookings}
              isLoading={isLoadingBookings}
              emptyMessage="Nenhum agendamento registrado até agora."
              loadingMessage="Carregando agendamentos..."
              showLocation
            />
          </section>
        );
      }

      return renderSuperAdminOverview;
    }

    if (currentPath === "/admin/perfil") {
      return renderProfilePage;
    }

    if (currentPath === "/admin/servicos") {
      return renderServicesPage;
    }

    return renderAdminOverview;
  };

  return (
    <PortalShell
      badge={isSuperAdmin ? "Super Admin" : "Administrador"}
      title={isSuperAdmin ? "Painel administrativo" : "Área administrativa"}
      description={
        isSuperAdmin
          ? "Controle as contas administradoras, acompanhe os agendamentos do sistema e leia o faturamento consolidado."
          : "Gerencie o perfil do local, os serviços e o desempenho diário da agenda."
      }
      actions={
        <>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <ShieldCheck className="h-4 w-4 text-[#F8C8DC]" />
            {profile?.username || user?.username || user?.email}
          </div>
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
      navigation={navigation}
    >
      {currentPath === "/admin/painel" ? <MetricsGrid metrics={metrics} /> : null}

      {bookingsError &&
      (currentPath === "/admin/painel" || currentPath === "/admin/agendamentos") ? (
        <div className="mt-6 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
          {bookingsError}
        </div>
      ) : null}

      <div className="mt-8 space-y-6">{renderCurrentPage()}</div>
    </PortalShell>
  );
}
