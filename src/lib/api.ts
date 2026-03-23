function normalizeBaseUrl(value?: string) {
  return value?.trim().replace(/\/$/, "") ?? "";
}

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    if (import.meta.env.DEV) {
      return normalizeBaseUrl(import.meta.env.VITE_API_URL) || "http://localhost:3000";
    }

    return "";
  }

  return "";
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
