import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortalShell } from "@/components/PortalShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks, services } from "@/data/landingContent";
import { bookingAvailability } from "@/data/portalContent";
import { buildApiUrl } from "@/lib/api";

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"] as const;
const whatsappBaseNumber = "5581992388506";
const NETWORK_ERROR_MESSAGE =
  "Nao foi possivel conectar ao servidor agora. Voce ainda pode navegar no painel e tentar novamente em instantes.";

const serviceSummaries: Record<string, string> = {
  "Barba premium": "Acabamento preciso com apresentacao limpa e atencao aos detalhes.",
  "Limpeza de pele": "Cuidado essencial para renovar a pele com toque profissional.",
  "Estetica facial": "Sessao focada em equilibrio visual, definicao e acabamento refinado.",
  "Revitalizacao facial": "Tratamento pensado para devolver vitalidade, textura e aparencia saudavel.",
  "Sobrancelha e contorno": "Desenho tecnico para destacar o rosto com naturalidade.",
  "Hidratacao glow": "Finalizacao leve para manter a pele uniforme, luminosa e bem cuidada.",
};

type BookingDay = {
  isoDate: string;
  label: string;
  weekday: string;
  dayNumber: number;
  slots: string[];
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
}) {
  const message = [
    "Ola, quero confirmar um agendamento pela area do cliente BeautyFlow.",
    `Codigo: #${input.booking.id}`,
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
  const navigate = useNavigate();
  const { logout, token, user } = useClientAuth();
  const [selectedService, setSelectedService] = useState<string>(services[0]?.title ?? "");
  const [selectedDate, setSelectedDate] = useState<string>(
    bookingAvailability[0]?.isoDate ?? "",
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedBooking, setSavedBooking] = useState<SavedBooking | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const activeService =
    services.find((service) => service.title === selectedService) ?? services[0];
  const customerName = user?.name?.trim() || "Cliente BeautyFlow";
  const customerEmail = user?.email?.trim() || "";

  useEffect(() => {
    let isCancelled = false;

    async function loadOccupiedSlots() {
      setIsLoadingAvailability(true);
      setAvailabilityError("");

      try {
        const response = await fetch(buildApiUrl("/api/bookings/occupied"));
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
  }, []);

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
      const dateSlots = occupiedByDate.get(item.scheduledDate) ?? new Set<string>();
      dateSlots.add(item.scheduledTime);
      occupiedByDate.set(item.scheduledDate, dateSlots);
    });

    return bookingAvailability
      .map((day) => {
        const unavailableSlots = occupiedByDate.get(day.isoDate);
        const slots = day.slots.filter((slot) => !unavailableSlots?.has(slot));

        return {
          ...day,
          slots: [...slots],
        };
      })
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

    if (!activeDate) {
      setSelectedTime("");
      return;
    }

    if (!activeDate.slots.includes(selectedTime)) {
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
      const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(
        dayNumber,
      ).padStart(2, "0")}`;

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
    Boolean(activeDate) &&
    Boolean(selectedTime) &&
    contactPhone.trim().length > 7 &&
    !isLoadingAvailability;

  const handleLogout = () => {
    logout();
    navigate(contactLinks.clientPortal, { replace: true });
  };

  const handleConfirmBooking = async () => {
    if (!canProceed || !activeDate) {
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
          phone: contactPhone,
          serviceName: activeService.title,
          servicePrice: activeService.price,
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

      const booking = data.booking;

      setSavedBooking(booking);
      setOccupiedSlots((current) => {
        const alreadyExists = current.some(
          (item) =>
            item.scheduledDate === booking.scheduledDate &&
            item.scheduledTime === booking.scheduledTime,
        );

        return alreadyExists
          ? current
          : [
              ...current,
              {
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
              },
            ];
      });

      const whatsappLink = buildWhatsappLink({
        booking,
        customerName,
        customerEmail,
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

  const scheduleLabel = activeDate ? `${activeDate.weekday}, ${activeDate.label}` : "Sem agenda aberta";
  const serviceSummary = serviceSummaries[activeService.title] ?? activeService.description;

  return (
    <PortalShell
      badge="Cliente"
      title="Agendamento da sua conta"
      description="Escolha um servico, selecione data e horario dentro do resumo do pedido e confirme no WhatsApp somente apos o registro no banco."
      actions={
        <>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <UserRound className="h-4 w-4 text-[#00C896]" />
            {customerName}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <aside className="order-first space-y-6 xl:order-last xl:sticky xl:top-28">
          <section className="overflow-hidden rounded-[2rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <img
              src={activeService.image}
              alt={activeService.title}
              className="h-44 w-full object-cover sm:h-56"
            />

            <div className="space-y-6 p-5 sm:p-7">
              <div>
                <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                  Resumo do pedido
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                  {activeService.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/68">{serviceSummary}</p>
              </div>

              {availabilityError ? (
                <div className="flex items-start gap-3 rounded-[1.5rem] border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#fde7b0]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {availabilityError}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                    Investimento
                  </span>
                  <span className="mt-2 block text-base font-semibold text-white">
                    {activeService.price}
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

                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72 sm:col-span-2">
                  <span className="block text-xs uppercase tracking-[0.18em] text-white/40">
                    Contato
                  </span>
                  <span className="mt-2 block text-base font-semibold text-white">
                    {contactPhone || "Informe o numero abaixo"}
                  </span>
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

              <p className="text-xs leading-6 text-white/45">
                A reserva so abre o WhatsApp depois que os dados forem registrados no banco.
              </p>

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
                  <h2 className="text-2xl font-semibold text-white">
                    Agendamento registrado
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    O sistema salvou a reserva e liberou a confirmacao no WhatsApp.
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
                  <span className="text-white/45">Status:</span>{" "}
                  {getStatusLabel(savedBooking.status)}
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
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Servicos</h2>
                <p className="text-sm text-white/58">
                  Opcoes mais objetivas para uma escolha rapida e profissional.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {services.map((service) => {
                const isActive = service.title === selectedService;
                const serviceCopy = serviceSummaries[service.title] ?? service.description;

                return (
                  <button
                    key={service.title}
                    type="button"
                    onClick={() => setSelectedService(service.title)}
                    className={`rounded-[1.5rem] border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? "border-[#00C896]/35 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))] shadow-[0_14px_40px_rgba(0,200,150,0.12)]"
                        : "border-white/10 bg-black/20 hover:border-[#00C896]/25 hover:bg-black/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">{service.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/62">{serviceCopy}</p>
                      </div>
                      <span className="rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#00C896]">
                        {service.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Dados da reserva</h2>
                <p className="text-sm text-white/58">
                  Informe somente o numero para contato. Nome e e-mail da conta entram no registro automaticamente.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
              <label className="space-y-2">
                <span className="text-sm text-white/60">Numero / Telefone</span>
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="(81) 99999-9999"
                  inputMode="tel"
                />
              </label>

              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <span className="text-xs uppercase tracking-[0.18em] text-white/38">
                  Conta vinculada
                </span>
                <p className="mt-3 text-base font-semibold text-white">{customerName}</p>
                <p className="mt-1 text-sm text-white/55">{customerEmail || "Sem e-mail"}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isScheduleModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-4 py-6 sm:items-center">
          <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
              <div>
                <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                  Agenda
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  Escolha data e horario
                </h2>
                <p className="mt-2 text-sm text-white/58">
                  Clique em um dia disponivel para ver os horarios abertos daquele atendimento.
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

                {availabilityError ? (
                  <div className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#fde7b0]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {availabilityError}
                  </div>
                ) : null}

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
    </PortalShell>
  );
}
