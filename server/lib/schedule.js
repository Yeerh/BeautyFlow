function padNumber(value) {
  return String(value).padStart(2, "0");
}

export function parseInteger(value) {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsedValue) ? Math.round(parsedValue) : null;
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function formatPrice(priceCents) {
  return `R$ ${(priceCents / 100).toFixed(2).replace(".", ",")}`;
}

export function isValidScheduledDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidScheduledTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function buildScheduledAt(scheduledDate, scheduledTime) {
  if (!isValidScheduledDate(scheduledDate) || !isValidScheduledTime(scheduledTime)) {
    return null;
  }

  const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

export function getTodayIsoDate(referenceDate = new Date()) {
  return [
    referenceDate.getFullYear(),
    padNumber(referenceDate.getMonth() + 1),
    padNumber(referenceDate.getDate()),
  ].join("-");
}

export function getCurrentTimeLabel(referenceDate = new Date()) {
  return `${padNumber(referenceDate.getHours())}:${padNumber(referenceDate.getMinutes())}`;
}

export function isFutureSlot(scheduledDate, scheduledTime, referenceDate = new Date()) {
  const todayIsoDate = getTodayIsoDate(referenceDate);

  if (scheduledDate > todayIsoDate) {
    return true;
  }

  if (scheduledDate < todayIsoDate) {
    return false;
  }

  return scheduledTime >= getCurrentTimeLabel(referenceDate);
}

export function buildFutureScheduleFilter(referenceDate = new Date()) {
  const todayIsoDate = getTodayIsoDate(referenceDate);
  const currentTime = getCurrentTimeLabel(referenceDate);

  return {
    OR: [
      {
        scheduledDate: {
          gt: todayIsoDate,
        },
      },
      {
        scheduledDate: todayIsoDate,
        scheduledTime: {
          gte: currentTime,
        },
      },
    ],
  };
}

export function buildSyntheticClientEmail(phone, adminId) {
  const digits = phone.replace(/\D/g, "") || "cliente";
  return `cliente-${digits}-${adminId}-${Date.now()}@beautyflow.local`;
}
