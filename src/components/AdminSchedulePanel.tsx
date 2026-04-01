import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Scissors,
  Trash2,
  UserPlus,
} from "lucide-react";
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

type AvailabilityBooking = {
  id: number;
  clientName: string;
  phone: string;
  serviceName: string;
  status: string;
};

type AvailabilitySlot = {
  id: number;
  scheduledDate: string;
  scheduledTime: string;
  isBooked: boolean;
  booking: AvailabilityBooking | null;
};

type AdminSchedulePanelProps = {
  adminId: number;
  token: string;
  businessName: string;
  services: ServiceItem[];
  isLoadingServices: boolean;
  servicesError: string;
  onBookingCreated: (booking: DashboardBooking) => void;
};

type CalendarCell = {
  isoDate: string;
  dayNumber: number;
  isPast: boolean;
  freeSlots: number;
  bookedSlots: number;
};

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"] as const;

function getTodayIsoDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
}

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const shiftedDate = new Date(year, month - 1 + delta, 1);

  return `${shiftedDate.getFullYear()}-${String(shiftedDate.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthStartDate(monthKey: string, todayIsoDate: string) {
  return monthKey === todayIsoDate.slice(0, 7) ? todayIsoDate : `${monthKey}-01`;
}

function formatMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T12:00:00`));
}

function formatDateLabel(isoDate: string) {
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

export function AdminSchedulePanel({
  adminId,
  token,
  businessName,
  services,
  isLoadingServices,
  servicesError,
  onBookingCreated,
}: AdminSchedulePanelProps) {
  const todayIsoDate = useMemo(() => getTodayIsoDate(), []);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(todayIsoDate.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(todayIsoDate);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityActionError, setAvailabilityActionError] = useState("");
  const [availabilityActionSuccess, setAvailabilityActionSuccess] = useState("");
  const [isSubmittingAvailability, setIsSubmittingAvailability] = useState(false);
  const [slotForm, setSlotForm] = useState({
    scheduledDate: todayIsoDate,
    scheduledTime: "",
  });
  const [bookingForm, setBookingForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceId: "",
    scheduledDate: todayIsoDate,
    scheduledTime: "",
    notes: "",
  });
  const [bookingActionError, setBookingActionError] = useState("");
  const [bookingActionSuccess, setBookingActionSuccess] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  async function loadAvailability(authToken: string) {
    setIsLoadingAvailability(true);
    setAvailabilityError("");

    try {
      const response = await fetch(buildApiUrl("/api/admin/availability"), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = (await response.json().catch(() => ({}))) as {
        items?: AvailabilitySlot[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel carregar a agenda.");
      }

      setAvailability(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setAvailabilityError(
        error instanceof Error ? error.message : "Nao foi possivel carregar a agenda.",
      );
    } finally {
      setIsLoadingAvailability(false);
    }
  }

  useEffect(() => {
    void loadAvailability(token);
  }, [token]);

  useEffect(() => {
    const activeService = services.find((service) => service.isActive);

    if (!activeService) {
      setBookingForm((current) => ({
        ...current,
        serviceId: "",
      }));
      return;
    }

    setBookingForm((current) => {
      if (
        current.serviceId &&
        services.some(
          (service) => service.isActive && String(service.id) === current.serviceId,
        )
      ) {
        return current;
      }

      return {
        ...current,
        serviceId: String(activeService.id),
      };
    });
  }, [services]);

  const schedulableServices = useMemo(
    () => services.filter((service) => service.isActive),
    [services],
  );

  const availabilityByDate = useMemo(() => {
    const grouped = new Map<
      string,
      { freeSlots: number; bookedSlots: number; slots: AvailabilitySlot[] }
    >();

    availability.forEach((slot) => {
      const current = grouped.get(slot.scheduledDate) ?? {
        freeSlots: 0,
        bookedSlots: 0,
        slots: [],
      };

      current.slots.push(slot);

      if (slot.isBooked) {
        current.bookedSlots += 1;
      } else {
        current.freeSlots += 1;
      }

      grouped.set(slot.scheduledDate, current);
    });

    grouped.forEach((value) => {
      value.slots.sort((left, right) => left.scheduledTime.localeCompare(right.scheduledTime));
    });

    return grouped;
  }, [availability]);

  const selectedDaySlots = useMemo(
    () => availabilityByDate.get(selectedDate)?.slots ?? [],
    [availabilityByDate, selectedDate],
  );

  const freeSlotsForSelectedDay = useMemo(
    () => selectedDaySlots.filter((slot) => !slot.isBooked),
    [selectedDaySlots],
  );

  const upcomingManualEntries = useMemo(
    () => availability.filter((slot) => slot.isBooked).slice(0, 6),
    [availability],
  );

  const calendarCells = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const totalDays = new Date(year, month, 0).getDate();
    const mondayOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const items: Array<CalendarCell | null> = [];

    for (let index = 0; index < mondayOffset; index += 1) {
      items.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const isoDate = `${selectedMonth}-${String(day).padStart(2, "0")}`;
      const summary = availabilityByDate.get(isoDate);

      items.push({
        isoDate,
        dayNumber: day,
        isPast: isoDate < todayIsoDate,
        freeSlots: summary?.freeSlots ?? 0,
        bookedSlots: summary?.bookedSlots ?? 0,
      });
    }

    return items;
  }, [availabilityByDate, selectedMonth, todayIsoDate]);

  const selectedDayLabel = useMemo(() => formatDateLabel(selectedDate), [selectedDate]);
  const monthLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);
  const canNavigatePreviousMonth = selectedMonth > todayIsoDate.slice(0, 7);

  function handleSelectDate(isoDate: string) {
    setSelectedDate(isoDate);
    setSelectedMonth(isoDate.slice(0, 7));
    setSlotForm((current) => ({
      ...current,
      scheduledDate: isoDate,
    }));
    setBookingForm((current) => ({
      ...current,
      scheduledDate: isoDate,
      scheduledTime: current.scheduledDate === isoDate ? current.scheduledTime : "",
    }));
  }

  async function handleAvailabilitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAvailabilityActionError("");
    setAvailabilityActionSuccess("");
    setIsSubmittingAvailability(true);

    try {
      const response = await fetch(buildApiUrl("/api/admin/availability"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId,
          scheduledDate: slotForm.scheduledDate,
          scheduledTime: slotForm.scheduledTime,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel abrir o horario.");
      }

      setAvailabilityActionSuccess("Horario aberto na agenda com sucesso.");
      setSlotForm((current) => ({
        ...current,
        scheduledTime: "",
      }));
      await loadAvailability(token);
    } catch (error) {
      setAvailabilityActionError(
        error instanceof Error ? error.message : "Nao foi possivel abrir o horario.",
      );
    } finally {
      setIsSubmittingAvailability(false);
    }
  }

  async function handleRemoveSlot(slotId: number) {
    setAvailabilityActionError("");
    setAvailabilityActionSuccess("");
    setIsSubmittingAvailability(true);

    try {
      const response = await fetch(
        buildApiUrl(`/api/admin/availability?id=${slotId}&adminId=${adminId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel remover o horario.");
      }

      setAvailabilityActionSuccess("Horario removido da agenda.");
      await loadAvailability(token);
    } catch (error) {
      setAvailabilityActionError(
        error instanceof Error ? error.message : "Nao foi possivel remover o horario.",
      );
    } finally {
      setIsSubmittingAvailability(false);
    }
  }

  async function handleManualBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBookingActionError("");
    setBookingActionSuccess("");
    setIsSubmittingBooking(true);

    try {
      const response = await fetch(buildApiUrl("/api/bookings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId,
          serviceId: Number(bookingForm.serviceId),
          name: bookingForm.clientName,
          email: bookingForm.clientEmail,
          phone: bookingForm.clientPhone,
          scheduledDate: bookingForm.scheduledDate,
          scheduledTime: bookingForm.scheduledTime,
          notes: bookingForm.notes,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        booking?: DashboardBooking;
        message?: string;
      };

      if (!response.ok || !data.booking) {
        throw new Error(data.message || "Nao foi possivel registrar a cliente.");
      }

      onBookingCreated(data.booking);
      setBookingActionSuccess("Cliente registrado na agenda com sucesso.");
      setBookingForm((current) => ({
        ...current,
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        scheduledTime: "",
        notes: "",
      }));
      await loadAvailability(token);
    } catch (error) {
      setBookingActionError(
        error instanceof Error ? error.message : "Nao foi possivel registrar a cliente.",
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-7">
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Agenda do local</h2>
          <p className="text-sm text-white/58">
            Abra horarios, controle a disponibilidade e cadastre clientes manualmente em{" "}
            {businessName || "seu estabelecimento"}.
          </p>
        </div>
      </div>

      {(availabilityError ||
        availabilityActionError ||
        availabilityActionSuccess ||
        bookingActionError ||
        bookingActionSuccess ||
        servicesError) ? (
        <div className="mt-6 space-y-3">
          {availabilityError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {availabilityError}
            </div>
          ) : null}
          {availabilityActionError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {availabilityActionError}
            </div>
          ) : null}
          {bookingActionError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {bookingActionError}
            </div>
          ) : null}
          {servicesError ? (
            <div className="rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
              {servicesError}
            </div>
          ) : null}
          {availabilityActionSuccess ? (
            <div className="rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
              {availabilityActionSuccess}
            </div>
          ) : null}
          {bookingActionSuccess ? (
            <div className="rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
              {bookingActionSuccess}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Calendario
                </p>
                <p className="mt-3 text-2xl font-semibold capitalize text-white">{monthLabel}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canNavigatePreviousMonth}
                  onClick={() => {
                    if (!canNavigatePreviousMonth) {
                      return;
                    }

                    const nextMonth = shiftMonth(selectedMonth, -1);
                    setSelectedMonth(nextMonth);
                    handleSelectDate(buildMonthStartDate(nextMonth, todayIsoDate));
                  }}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 ${
                    canNavigatePreviousMonth
                      ? "border-white/10 bg-white/5 text-white/70 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
                      : "cursor-not-allowed border-white/5 bg-white/[0.03] text-white/20"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = shiftMonth(selectedMonth, 1);
                    setSelectedMonth(nextMonth);
                    handleSelectDate(buildMonthStartDate(nextMonth, todayIsoDate));
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors duration-300 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.18em] text-white/35">
              {WEEK_DAYS.map((weekDay) => (
                <span key={weekDay}>{weekDay}</span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2">
              {calendarCells.map((cell, index) => {
                if (!cell) {
                  return <div key={`calendar-empty-${index}`} className="aspect-square" />;
                }

                const isSelected = cell.isoDate === selectedDate;

                return (
                  <button
                    key={cell.isoDate}
                    type="button"
                    disabled={cell.isPast}
                    onClick={() => handleSelectDate(cell.isoDate)}
                    className={`aspect-square rounded-2xl border px-1 py-2 text-center transition-all duration-300 ${
                      isSelected
                        ? "border-[#F8C8DC]/35 bg-[#F8C8DC]/15 text-[#F8C8DC]"
                        : cell.isPast
                          ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/18"
                          : "border-white/10 bg-white/5 text-white hover:border-[#F8C8DC]/25"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{cell.dayNumber}</span>
                    {cell.freeSlots || cell.bookedSlots ? (
                      <span className="mt-1 block text-[10px] leading-4 text-white/55">
                        {cell.freeSlots}L {cell.bookedSlots ? `· ${cell.bookedSlots}R` : ""}
                      </span>
                    ) : (
                      <span className="mt-1 block text-[10px] leading-4 text-white/24">-</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  Dia selecionado
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">{selectedDayLabel}</h3>
              </div>

              {isLoadingAvailability ? (
                <LoaderCircle className="h-5 w-5 animate-spin text-[#F8C8DC]" />
              ) : null}
            </div>

            {!selectedDaySlots.length && !isLoadingAvailability ? (
              <div className="mt-6 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/58">
                Ainda nao existem horarios abertos neste dia.
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              {selectedDaySlots.map((slot) => (
                <article
                  key={slot.id}
                  className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-white">{slot.scheduledTime}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                            slot.isBooked
                              ? "border-[#ef4444]/20 bg-[#ef4444]/10 text-[#fecaca]"
                              : "border-[#00C896]/20 bg-[#00C896]/10 text-[#00C896]"
                          }`}
                        >
                          {slot.isBooked ? "Reservado" : "Livre"}
                        </span>
                      </div>

                      {slot.booking ? (
                        <div className="mt-3 space-y-1 text-sm text-white/65">
                          <p>{slot.booking.clientName}</p>
                          <p>{slot.booking.serviceName}</p>
                          <p>{slot.booking.phone}</p>
                          <p>Status: {getStatusLabel(slot.booking.status)}</p>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-white/58">
                          Disponivel para agendamento publico ou cadastro manual.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {!slot.isBooked ? (
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectDate(slot.scheduledDate);
                            setBookingForm((current) => ({
                              ...current,
                              scheduledDate: slot.scheduledDate,
                              scheduledTime: slot.scheduledTime,
                            }));
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70 transition-colors duration-300 hover:border-[#F8C8DC]/35 hover:text-[#F8C8DC]"
                        >
                          <UserPlus className="h-4 w-4" />
                          Usar no cadastro
                        </button>
                      ) : null}

                      {!slot.isBooked ? (
                        <button
                          type="button"
                          onClick={() => void handleRemoveSlot(slot.id)}
                          disabled={isSubmittingAvailability}
                          className="inline-flex items-center gap-2 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-2 text-sm text-[#fecaca] transition-colors duration-300 hover:bg-[#ef4444]/15"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleAvailabilitySubmit}
            className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 p-3 text-[#F8C8DC]">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Abrir horario</h3>
                <p className="mt-1 text-sm text-white/58">
                  Cadastre dias e horas disponiveis para o local.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/60">Data</span>
                <input
                  type="date"
                  value={slotForm.scheduledDate}
                  min={todayIsoDate}
                  onChange={(event) =>
                    setSlotForm((current) => ({
                      ...current,
                      scheduledDate: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-[#F8C8DC]/35"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-white/60">Horario</span>
                <input
                  type="time"
                  value={slotForm.scheduledTime}
                  onChange={(event) =>
                    setSlotForm((current) => ({
                      ...current,
                      scheduledTime: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-[#F8C8DC]/35"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAvailability}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F8C8DC] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(248,200,220,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f4d7e5]"
            >
              {isSubmittingAvailability ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Clock3 className="h-4 w-4" />
              )}
              {isSubmittingAvailability ? "Salvando..." : "Adicionar horario"}
            </button>
          </form>

          <form
            onSubmit={handleManualBookingSubmit}
            className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Cadastrar cliente</h3>
                <p className="mt-1 text-sm text-white/58">
                  Use quando a cliente nao tiver acesso ao painel de reserva.
                </p>
              </div>
            </div>

            {!schedulableServices.length && !isLoadingServices ? (
              <div className="mt-6 rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                Cadastre ao menos um servico ativo antes de registrar clientes na agenda.
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-sm text-white/60">Servico</span>
                <select
                  value={bookingForm.serviceId}
                  onChange={(event) =>
                    setBookingForm((current) => ({
                      ...current,
                      serviceId: event.target.value,
                    }))
                  }
                  disabled={!schedulableServices.length || isLoadingServices}
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-[#00C896]/35"
                  required
                >
                  {!schedulableServices.length ? (
                    <option value="" className="bg-[#101010] text-white">
                      Nenhum servico ativo
                    </option>
                  ) : null}
                  {schedulableServices.map((service) => (
                    <option key={service.id} value={service.id} className="bg-[#101010] text-white">
                      {service.name} · {service.priceLabel}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Nome da cliente</span>
                  <input
                    value={bookingForm.clientName}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        clientName: event.target.value,
                      }))
                    }
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                    placeholder="Maria Fernanda"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/60">Telefone</span>
                  <input
                    value={bookingForm.clientPhone}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        clientPhone: event.target.value,
                      }))
                    }
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                    placeholder="(81) 99999-9999"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm text-white/60">E-mail opcional</span>
                <input
                  type="email"
                  value={bookingForm.clientEmail}
                  onChange={(event) =>
                    setBookingForm((current) => ({
                      ...current,
                      clientEmail: event.target.value,
                    }))
                  }
                  className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="cliente@email.com"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Data</span>
                  <input
                    type="date"
                    min={todayIsoDate}
                    value={bookingForm.scheduledDate}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        scheduledDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-[#00C896]/35"
                    required
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/60">Horario</span>
                  <input
                    type="time"
                    value={bookingForm.scheduledTime}
                    onChange={(event) =>
                      setBookingForm((current) => ({
                        ...current,
                        scheduledTime: event.target.value,
                      }))
                    }
                    className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-[#00C896]/35"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm text-white/60">Observacoes</span>
                <textarea
                  value={bookingForm.notes}
                  onChange={(event) =>
                    setBookingForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className="min-h-28 w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/28 focus:border-[#00C896]/35"
                  placeholder="Informacoes internas do atendimento"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={!schedulableServices.length || isSubmittingBooking}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
                schedulableServices.length && !isSubmittingBooking
                  ? "bg-[#00C896] text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/38"
              }`}
            >
              {isSubmittingBooking ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSubmittingBooking ? "Registrando..." : "Adicionar cliente na agenda"}
            </button>
          </form>

          <section className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Proximos atendimentos</h3>
                <p className="mt-1 text-sm text-white/58">
                  Slots ja ocupados dentro da agenda aberta.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {upcomingManualEntries.length ? (
                upcomingManualEntries.map((slot) => (
                  <article
                    key={slot.id}
                    className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-white/45">{formatDateLabel(slot.scheduledDate)}</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {slot.scheduledTime} · {slot.booking?.clientName}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00C896]">
                        {slot.booking?.serviceName}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/58">
                  Nenhum horario reservado na agenda aberta.
                </div>
              )}
            </div>

            {freeSlotsForSelectedDay.length ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 text-sm text-white/65">
                {freeSlotsForSelectedDay.length} horario(s) livre(s) em {selectedDayLabel}.
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}
