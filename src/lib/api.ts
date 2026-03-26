import axios from 'axios';

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

export const fetchBarberServices = async (linkId) => {
  try {
    const response = await axios.get(`/api/services/${linkId}`);
    return response.data.barber;
  } catch (error) {
    console.error('Error fetching barber services:', error);
    throw error;
  }
};
