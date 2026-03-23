export function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && !import.meta.env.DEV) {
    return window.location.origin;
  }

  return "http://localhost:3000";
}
