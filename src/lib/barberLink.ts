const BARBER_LINK_BASE_PATH = "/link";

function normalizeAdminId(adminId: number | string | null | undefined) {
  if (adminId === null || adminId === undefined) {
    return "";
  }

  return String(adminId).trim();
}

export function buildBarberLinkPath(adminId: number | string | null | undefined) {
  const normalizedAdminId = normalizeAdminId(adminId);

  if (!normalizedAdminId) {
    return "";
  }

  return `${BARBER_LINK_BASE_PATH}/${encodeURIComponent(normalizedAdminId)}`;
}

export function buildBarberLinkUrl(adminId: number | string | null | undefined) {
  const path = buildBarberLinkPath(adminId);

  if (!path) {
    return "";
  }

  if (typeof window === "undefined") {
    return path;
  }

  return `${window.location.origin}${path}`;
}
