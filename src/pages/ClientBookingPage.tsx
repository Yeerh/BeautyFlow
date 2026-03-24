import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { RoleSidebarShell } from "@/components/RoleSidebarShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { bookingAvailability } from "@/data/portalContent";
import { buildApiUrl } from "@/lib/api";
import { buildClientMenu, clientRoutes } from "@/lib/portalNavigation";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"] as const;
const whatsappBaseNumber = "5581992388506";
const NETWORK_ERROR_MESSAGE =
  "Nao foi possivel conectar ao servidor agora. Tente novamente em alguns instantes.";

type BookingDay = {
  isoDate: string;
  label: string;
  weekday: string;
  dayNumber: number;
  slots: string[];
};

type LocationDetails = {
  id: number;
  businessName: string;
  businessPhotoUrl: string | null;
  businessAddress: string | null;
  ownerName: string;
};

type ServiceItem = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  priceLabel: string;
};

type OccupiedSlot = {
  scheduledDate: string;
  scheduledTime: string;
};

type SavedBooking = {
  id: number;
  phone: string;
  serviceName: string;
  servicePrice: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
};

type CalendarCell = BookingDay | { isoDate: string; dayNumber: number; disabled: true } | null;

function getReadableBookingError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

function formatIsoDateLabel(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
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

function buildWhatsappLink(input: {
  booking: SavedBooking;
  customerName: string;
  customerEmail: string;
  locationName: string;
}) {
  const message = [
    "Ola, quero confirmar um agendamento pela area do cliente BeautyFlow.",
    `Codigo: #${input.booking.id}`,
    `Local: ${input.locationName}`,
    `Servico: ${input.booking.serviceName}`,
    `Preco: ${input.booking.servicePrice}`,
    `Data: ${formatIsoDateLabel(input.booking.scheduledDate)}`,
    `Horario: ${input.booking.scheduledTime}`,
    `Cliente: ${input.customerName || "Cliente BeautyFlow"}`,
    `Telefone: ${input.booking.phone}`,
    `E-mail: ${input.customerEmail || "-"}`,
  ].join("\n");

  return `https://wa.me/${whatsappBaseNumber}?text=${encodeURIComponent(message)}`;
}

export function ClientBookingPage() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { logout, token, user } = useClientAuth();
  const [location, setLocation] = useState<LocationDetails | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(bookingAvailability[0]?.isoDate ?? "");
  const [selectedTime, setSelectedTime] = useState("");
  const [fallbackPhone, setFallbackPhone] = useState("");
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedBooking, setSavedBooking] = useState<SavedBooking | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const customerName = user?.name?.trim() || "Cliente BeautyFlow";
  const customerEmail = user?.email?.trim() || "";
  const resolvedPhone = user?.phone?.trim() || fallbackPhone.trim();
  const needsPhoneCompletion = !(user?.phone?.trim() || "");

  const activeService =
    services.find((service) => service.id === selectedServiceId) ?? services[0] ?? null;

  useEffect(() => {
    if (!services.length) {
      setSelectedServiceId(null);
      return;
    }

    if (!services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(services[0]?.id ?? null);
    }
  }, [selectedServiceId, services]);

  useEffect(() => {
    let isCancelled = false;

    async function loadLocationDetails() {
      if (!locationId) {
        setPageError("Escolha um local antes de continuar com o agendamento.");
        setIsLoadingPage(false);
        return;
      }

      setIsLoadingPage(true);
      setPageError("");

      try {
        const response = await fetch(buildApiUrl(`/api/locations?adminId=${locationId}`));
        const data = (await response.json().catch(() => ({}))) as {
          location?: LocationDetails;
          services?: ServiceItem[];
          message?: string;
        };

        if (!response.ok || !data.location) {
          throw new Error(data.message || "Nao foi possivel carregar o local.");
        }

        const loadedServices = Array.isArray(data.services) ? data.services : [];

        if (!isCancelled) {
          setLocation(data.location);
          setServices(loadedServices);
          setSelectedServiceId((current) => current ?? loadedServices[0]?.id ?? null);
        }
      } catch (error) {
        if (!isCancelled) {
          setPageError(getReadableBookingError(error, NETWORK_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPage(false);
        }
      }
    }

    loadLocationDetails();

    return () => {
      isCancelled = true;
    };
  }, [locationId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadOccupiedSlots() {
      if (!locationId) {
        setOccupiedSlots([]);
        setIsLoadingAvailability(false);
        return;
      }

      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const response = await fetch(buildApiUrl(`/api/bookings/occupied?adminId=${locationId}`));
        const data = (await response.json().catch(() => ({}))) as {
          items?: OccupiedSlot[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(data.message || "Nao foi possivel carregar a agenda.");
        }

        if (!isCancelled) {
          setOccupiedSlots(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setAvailabilityError(getReadableBookingError(error, NETWORK_ERROR_MESSAGE));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAvailability(false);
        }
      }
    }

    loadOccupiedSlots();

    return () => {
      isCancelled = true;
    };
  }, [locationId]);

  useEffect(() => {
    if (!isScheduleModalOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isScheduleModalOpen]);

  const availableSchedule = useMemo(() => {
    const occupiedByDate = new Map<string, Set<string>>();

    occupiedSlots.forEach((item) => {
      const slots = occupiedByDate.get(item.scheduledDate) ?? new Set<string>();
      slots.add(item.scheduledTime);
      occupiedByDate.set(item.scheduledDate, slots);
    });

    return bookingAvailability
      .map((day) => ({
        ...day,
        slots: day.slots.filter((slot) => !occupiedByDate.get(day.isoDate)?.has(slot)),
      }))
      .filter((day) => day.slots.length > 0) as BookingDay[];
  }, [occupiedSlots]);

  const activeDate =
    availableSchedule.find((date) => date.isoDate === selectedDate) ??
    availableSchedule[0] ??
    null;

  useEffect(() => {
    if (!activeDate && availableSchedule[0]) {
      setSelectedDate(availableSchedule[0].isoDate);
      setSelectedTime("");
      return;
    }

    if (!activeDate || !activeDate.slots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [activeDate, availableSchedule, selectedTime]);

  const calendarCells = useMemo(() => {
    const referenceDate = activeDate ?? availableSchedule[0];

    if (!referenceDate) {
      return [] as CalendarCell[];
    }

    const [year, month] = referenceDate.isoDate.split("-").map(Number);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const totalDays = new Date(year, month, 0).getDate();
    const mondayOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const availableByDate = new Map<string, BookingDay>(
      availableSchedule.map((date) => [date.isoDate, date]),
    );

    return Array.from({ length: mondayOffset + totalDays }, (_, index) => {
      if (index < mondayOffset) {
        return null;
      }

      const dayNumber = index - mondayOffset + 1;
      const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(dayNumber).padStart(
        2,
        "0",
      )}`;

      return availableByDate.get(isoDate) ?? { isoDate, dayNumber, disabled: true };
    }) as CalendarCell[];
  }, [activeDate, availableSchedule]);

  const monthLabel = useMemo(() => {
    const referenceDate = activeDate ?? availableSchedule[0];

    if (!referenceDate) {
      return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(new Date(`${referenceDate.isoDate}T12:00:00`));
  }, [activeDate, availableSchedule]);

  const canProceed =
    Boolean(location) &&
    Boolean(activeService) &&
    Boolean(activeDate) &&
    Boolean(selectedTime) &&
    resolvedPhone.length > 7 &&
    !isLoadingAvailability;

  const scheduleLabel = activeDate ? `${activeDate.weekday}, ${activeDate.label}` : "Sem agenda aberta";

  const handleLogout = () => {
    logout();
    navigate(contactLinks.clientPortal, { replace: true });
  };

  const handleConfirmBooking = async () => {
    if (!canProceed || !activeDate || !activeService || !location) {
      return;
    }

    setSubmitError("");
    setSavedBooking(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("/api/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          adminId: location.id,
          serviceId: activeService.id,
          ...(needsPhoneCompletion ? { phone: resolvedPhone } : {}),
          scheduledDate: activeDate.isoDate,
          scheduledTime: selectedTime,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        booking?: SavedBooking;
        message?: string;
      };

      if (!response.ok || !data.booking) {
        throw new Error(data.message || "Nao foi possivel registrar o agendamento.");
      }

      setSavedBooking(data.booking);
      setOccupiedSlots((current) => {
        const alreadyExists = current.some(
          (item) =>
            item.scheduledDate === data.booking?.scheduledDate &&
            item.scheduledTime === data.booking?.scheduledTime,
        );

        if (alreadyExists) {
          return current;
        }

        return [
          ...current,
          {
            scheduledDate: data.booking?.scheduledDate ?? "",
            scheduledTime: data.booking?.scheduledTime ?? "",
          },
        ];
      });

      const whatsappLink = buildWhatsappLink({
        booking: data.booking,
        customerName,
        customerEmail,
        locationName: location.businessName,
      });

      window.open(whatsappLink, "_blank", "noopener,noreferrer");
    } catch (error) {
      setSubmitError(
        getReadableBookingError(
          error,
          "Nao foi possivel registrar o agendamento agora. Tente novamente em alguns instantes.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = buildClientMenu(handleLogout);

  return (
    <RoleSidebarShell
      badge="Cliente"
      title="Confirmar agendamento"
      description="Escolha o serviço do local selecionado, defina data e horário no resumo do pedido e confirme no WhatsApp só depois do registro no banco."
      menuItems={menuItems}
      userName={customerName}
      userSubtitle={customerEmail || "Área do cliente"}
      actions={
        <>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <UserRound className="h-4 w-4 text-[#00C896]" />
            {customerName}
          </div>
          <button
            type="button"
            onClick={() => navigate(clientRoutes.bookings)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
          >
            <Store className="h-4 w-4" />
            Trocar local
          </button>
        </>
      }
    >
      {pageError ? (
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {pageError}
        </div>
      ) : null}

      {isLoadingPage ? (
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-10 text-sm text-white/62 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          Carregando estabelecimento e servicos...
        </div>
      ) : null}

      {!isLoadingPage && location ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <aside className="order-first space-y-6 xl:order-last xl:sticky xl:top-28">
            <section className="overflow-hidden rounded-[2rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <div className="relative h-48 sm:h-60">
                {location.businessPhotoUrl ? (
                  <img
                    src={location.businessPhotoUrl}
                    alt={location.businessName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#111827,#14532d)]">
                    <Store className="h-10 w-10 text-white/65" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.05),rgba(11,11,11,0.82))]" />
              </div>

              <div className="space-y-6 p-5 sm:p-7">
                <div>
                  <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                    Resumo do pedido
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                    {location.businessName}
                  </h2>
                  <p className="mt-2 text-sm text-white/58">
                    Proprietario: {location.ownerName}
                  </p>
                  <div className="mt-4 flex items-start gap-2 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                    {location.businessAddress || "Endereco nao informado"}
                  </div>
                </div>

                {availabilityError ? (
                  <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#fde7b0]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {availabilityError}
                  </div>
                ) : null}

                <div className="space-y-3">
                  <label className="block rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                      Servico
                    </span>
                    <select
                      value={selectedServiceId ?? ""}
                      onChange={(event) => setSelectedServiceId(Number(event.target.value))}
                      className="mt-2 w-full bg-transparent text-base font-semibold text-white outline-none"
                      disabled={!services.length}
                    >
                      {!services.length ? (
                        <option value="" className="bg-[#101010] text-white">
                          Nenhum servico ativo
                        </option>
                      ) : null}
                      {services.map((service) => (
                        <option
                          key={service.id}
                          value={service.id}
                          className="bg-[#101010] text-white"
                        >
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                      Descricao
                    </span>
                    <span className="mt-2 block leading-6 text-white/72">
                      {activeService?.description || "Atendimento profissional neste local."}
                    </span>
                  </div>

                  {!services.length ? (
                    <div className="rounded-[1.25rem] border border-[#f59e0b]/20 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#fde7b0]">
                      Este local ainda nao possui servicos ativos para agendamento.
                    </div>
                  ) : null}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                      <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                        Valor
                      </span>
                      <span className="mt-2 block text-base font-semibold text-white">
                        {activeService?.priceLabel || "--"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/72 transition-all duration-300 hover:border-[#00C896]/30 hover:bg-black/30"
                    >
                      <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                        Data e horario
                      </span>
                      <span className="mt-2 block text-base font-semibold text-white">
                        {activeDate ? activeDate.label : "Selecionar"}
                      </span>
                      <span className="mt-1 block text-sm text-[#00C896]">
                        {selectedTime || "Escolha um horario"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
                >
                  <CalendarDays className="h-4 w-4" />
                  Escolher data e horario
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={!canProceed || isSubmitting}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
                    canProceed && !isSubmitting
                      ? "bg-[#00C896] text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
                      : "cursor-not-allowed border border-white/10 bg-white/5 text-white/38"
                  }`}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Salvando agendamento..." : "Salvar e abrir WhatsApp"}
                </button>

                {submitError ? (
                  <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                    {submitError}
                  </div>
                ) : null}
              </div>
            </section>

            {savedBooking ? (
              <section className="rounded-[2rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Agendamento registrado</h2>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      A reserva foi salva no banco e o WhatsApp foi liberado em seguida.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="text-white/45">Numero:</span> #{savedBooking.id}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="text-white/45">Telefone:</span> {savedBooking.phone}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="text-white/45">Servico:</span> {savedBooking.serviceName}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                    <span className="text-white/45">Status:</span> {getStatusLabel(savedBooking.status)}
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72 sm:col-span-2">
                    <span className="text-white/45">Atendimento:</span>{" "}
                    {formatIsoDateLabel(savedBooking.scheduledDate)} as {savedBooking.scheduledTime}
                  </div>
                </div>
              </section>
            ) : null}
          </aside>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Dados da reserva</h2>
                  <p className="text-sm text-white/58">
                    O cadastro do cliente abastece a reserva automaticamente.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/38">Nome</span>
                  <p className="mt-3 text-base font-semibold text-white">{customerName}</p>
                </div>

                <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/38">E-mail</span>
                  <p className="mt-3 break-all text-base font-semibold text-white">
                    {customerEmail || "Sem e-mail"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/38">
                    Telefone cadastrado
                  </span>
                  <p className="mt-3 text-base font-semibold text-white">
                    {user?.phone?.trim() || "Nao encontrado no cadastro"}
                  </p>
                </div>
              </div>

              {needsPhoneCompletion ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
                  <label className="space-y-2">
                    <span className="text-sm text-white/60">Telefone para concluir</span>
                    <input
                      value={fallbackPhone}
                      onChange={(event) => setFallbackPhone(event.target.value)}
                      className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                      placeholder="(81) 99999-9999"
                      inputMode="tel"
                    />
                  </label>

                  <div className="rounded-[1.5rem] border border-[#f59e0b]/20 bg-[#f59e0b]/10 p-4 text-sm leading-7 text-[#fde7b0]">
                    Seu cadastro antigo nao tem telefone salvo. Informe o numero uma vez
                    para concluir esta reserva.
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}

      {isScheduleModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-4 py-6 sm:items-center">
          <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
              <div>
                <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                  Agenda
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-white">Escolha data e horario</h2>
                <p className="mt-2 text-sm text-white/58">
                  Clique em um dia disponivel para abrir os horarios livres daquele local.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors duration-300 hover:border-[#00C896]/35 hover:text-[#00C896]"
                aria-label="Fechar agenda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.08fr_0.92fr]">
              <section className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold capitalize text-white">
                      {monthLabel || "Sem disponibilidade"}
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      {isLoadingAvailability
                        ? "carregando agenda"
                        : `${availableSchedule.length} dias com horario`}
                    </p>
                  </div>
                  <CalendarDays className="h-5 w-5 text-[#00C896]" />
                </div>

                <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-white/35">
                  {weekDays.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-7 gap-2">
                  {calendarCells.length ? (
                    calendarCells.map((item, index) => {
                      if (!item) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }

                      const isSelectable = !("disabled" in item);
                      const isSelected = item.isoDate === selectedDate;

                      return (
                        <button
                          key={item.isoDate}
                          type="button"
                          onClick={() => {
                            if (isSelectable) {
                              setSelectedDate(item.isoDate);
                              setSelectedTime("");
                            }
                          }}
                          disabled={!isSelectable}
                          className={`aspect-square rounded-2xl border text-sm font-semibold transition-all duration-300 ${
                            isSelected
                              ? "border-[#00C896]/35 bg-[#00C896]/15 text-[#00C896]"
                              : isSelectable
                                ? "border-white/10 bg-white/5 text-white hover:border-[#00C896]/25"
                                : "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/18"
                          }`}
                        >
                          {item.dayNumber}
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-7 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-5 text-center text-sm text-white/55">
                      Nenhum horario disponivel no momento.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                    {isLoadingAvailability ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <Clock3 className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Horarios do dia</h3>
                    <p className="text-sm text-white/58">{scheduleLabel}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {activeDate?.slots.length ? (
                    activeDate.slots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time);
                          setIsScheduleModalOpen(false);
                        }}
                        className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
                          selectedTime === time
                            ? "border-[#00C896]/35 bg-[#00C896]/12 text-[#00C896]"
                            : "border-white/10 bg-white/5 text-white/65 hover:border-[#00C896]/20 hover:text-white"
                        }`}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/55">
                      Sem horarios livres nesta data.
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/38">
                    Selecao atual
                  </p>
                  <p className="mt-3 text-base font-semibold text-white">
                    {activeService?.name || "Sem servico"}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    {activeDate ? activeDate.label : "Sem data"}
                  </p>
                  <p className="mt-1 text-sm text-[#00C896]">
                    {selectedTime || "Escolha um horario para concluir"}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </RoleSidebarShell>
  );
}
