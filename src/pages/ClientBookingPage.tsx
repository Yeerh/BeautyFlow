import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LogOut,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortalShell } from "@/components/PortalShell";
import { useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks, services } from "@/data/landingContent";
import { bookingAvailability, bookingBenefits } from "@/data/portalContent";
import { buildApiUrl } from "@/lib/api";
const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"] as const;
const NETWORK_ERROR_MESSAGE =
  "Nao foi possivel conectar ao servidor agora. Voce ainda pode navegar no painel e tentar novamente em instantes.";

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
  clientName: string;
  clientEmail: string;
  serviceName: string;
  servicePrice: string;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  status: string;
};

function getReadableBookingError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function ClientBookingPage() {
  const navigate = useNavigate();
  const { logout, token, user } = useClientAuth();
  const [selectedService, setSelectedService] = useState<string>(services[0]?.title ?? "");
  const [selectedDate, setSelectedDate] = useState<string>(
    bookingAvailability[0]?.isoDate ?? "",
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    bookingAvailability[0]?.slots[0] ?? "",
  );
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: "",
    email: user?.email ?? "",
    notes: "",
  });
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedBooking, setSavedBooking] = useState<SavedBooking | null>(null);

  const activeService =
    services.find((service) => service.title === selectedService) ?? services[0];

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: user?.name ?? current.name,
      email: user?.email ?? current.email,
    }));
  }, [user]);

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
      setSelectedTime(availableSchedule[0].slots[0] ?? "");
      return;
    }

    if (!activeDate) {
      setSelectedTime("");
      return;
    }

    if (!activeDate.slots.includes(selectedTime)) {
      setSelectedTime(activeDate.slots[0] ?? "");
    }
  }, [activeDate, availableSchedule, selectedTime]);

  const calendarCells = useMemo(() => {
    const referenceDate = activeDate ?? availableSchedule[0];

    if (!referenceDate) {
      return [];
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
    });
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

  const whatsappLink = useMemo(() => {
    const message = [
      "Ola, quero confirmar um agendamento pela area do cliente BeautyFlow.",
      `Servico: ${activeService.title}`,
      `Preco: ${activeService.price}`,
      `Data: ${activeDate?.label ?? "-"}`,
      `Horario: ${selectedTime || "-"}`,
      `Nome: ${form.name || "-"}`,
      `Telefone: ${form.phone || "-"}`,
      `E-mail: ${form.email || "-"}`,
      `Observacoes: ${form.notes || "-"}`,
    ].join("\n");

    return `https://wa.me/5581992388506?text=${encodeURIComponent(message)}`;
  }, [activeDate, activeService.price, activeService.title, form, selectedTime]);

  const canProceed =
    Boolean(activeDate) &&
    Boolean(selectedTime) &&
    form.name.trim().length > 1 &&
    form.phone.trim().length > 7 &&
    form.email.trim().length > 4 &&
    !isLoadingAvailability;

  const savedAtLabel = useMemo(() => {
    if (!savedBooking) {
      return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(savedBooking.createdAt));
  }, [savedBooking]);

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
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
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

  return (
    <PortalShell
      badge="Cliente"
      title="Calendario de agendamento da sua conta"
      description="Agora cada reserva fica gravada no banco com usuario, servico, data escolhida, horario do atendimento e momento exato em que o agendamento foi criado."
      actions={
        <>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">
            <UserRound className="h-4 w-4 text-[#00C896]" />
            {user?.name} via {user?.provider === "google" ? "Google" : "e-mail"}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/72 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00C896]/35 hover:text-[#00C896]"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Escolha o servico</h2>
                <p className="text-sm text-white/58">
                  O servico selecionado fica salvo junto do agendamento.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {services.map((service) => {
                const isActive = service.title === selectedService;

                return (
                  <button
                    key={service.title}
                    type="button"
                    onClick={() => setSelectedService(service.title)}
                    className={`group overflow-hidden rounded-[1.75rem] border text-left transition-all duration-300 ${
                      isActive
                        ? "border-[#00C896]/35 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))]"
                        : "border-white/10 bg-black/20 hover:border-[#00C896]/25"
                    }`}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-lg font-semibold text-white">{service.title}</p>
                        <span className="rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#00C896]">
                          {service.price}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/62">
                        {service.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Calendario disponivel</h2>
                <p className="text-sm text-white/58">
                  Horarios ja reservados desaparecem da grade automaticamente.
                </p>
              </div>
            </div>

            {availabilityError ? (
              <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#fde7b0]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {availabilityError}
              </div>
            ) : null}

            <div className="mt-8 rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold capitalize text-white">
                  {monthLabel || "Sem disponibilidade"}
                </p>
                <span className="text-sm text-white/45">
                  {isLoadingAvailability
                    ? "carregando agenda"
                    : `${availableSchedule.length} dias abertos`}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-white/35">
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
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                  {isLoadingAvailability ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Clock3 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Horarios disponiveis</h3>
                  <p className="text-sm text-white/58">
                    {activeDate ? `${activeDate.weekday} - ${activeDate.label}` : "Sem agenda aberta"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {activeDate?.slots.length ? (
                  activeDate.slots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
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
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/55">
                    Sem horarios livres nesta data.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-semibold text-white">Dados da reserva</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              O agendamento grava nome, e-mail, telefone, servico, dia e horario da reserva.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/60">Nome</span>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="Seu nome completo"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-white/60">Telefone</span>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="(81) 99999-9999"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-white/60">E-mail</span>
                <input
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="voce@email.com"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm text-white/60">Observacoes</span>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  className="min-h-32 w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="Conte brevemente o que voce procura."
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <section className="overflow-hidden rounded-[2rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <img
              src={activeService.image}
              alt={activeService.title}
              className="h-56 w-full object-cover"
            />

            <div className="p-7">
              <span className="inline-flex rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                Resumo do pedido
              </span>

              <h2 className="mt-5 text-3xl font-semibold text-white">{activeService.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                {activeService.description}
              </p>

              <div className="mt-8 space-y-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Preco:</span> {activeService.price}
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Data:</span> {activeDate?.label ?? "-"}
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Horario:</span> {selectedTime || "-"}
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Cliente:</span>{" "}
                  {form.name || "Preencha os dados para continuar"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!canProceed || isSubmitting}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
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
                {isSubmitting ? "Salvando agendamento..." : "Salvar e confirmar no WhatsApp"}
              </button>

              <p className="mt-4 text-xs leading-6 text-white/45">
                A reserva so abre o WhatsApp depois que os dados forem registrados no banco.
              </p>

              {submitError ? (
                <div className="mt-4 rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                  {submitError}
                </div>
              ) : null}
            </div>
          </section>

          {savedBooking ? (
            <section className="rounded-[2rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.12),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <div className="flex items-start gap-3">
                <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Agendamento salvo</h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    A reserva foi registrada no banco com o usuario, o servico escolhido e o horario selecionado.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Codigo:</span> #{savedBooking.id}
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Servico:</span> {savedBooking.serviceName}
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Data do atendimento:</span>{" "}
                  {savedBooking.scheduledDate} as {savedBooking.scheduledTime}
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                  <span className="text-white/45">Reserva criada em:</span> {savedAtLabel}
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <h2 className="text-2xl font-semibold text-white">O que ja esta pronto</h2>
            <div className="mt-6 space-y-3">
              {bookingBenefits.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </PortalShell>
  );
}
