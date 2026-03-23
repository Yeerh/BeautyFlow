import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getApiBaseUrl } from "@/lib/api";

type AuthProviderType = "email" | "google";

type ClientUser = {
  name: string;
  email: string;
  provider: AuthProviderType;
};

type ClientAuthContextValue = {
  user: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginWithEmail: (input: { email: string; password: string }) => Promise<void>;
  registerWithEmail: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  completeTokenLogin: (token: string) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "beautyflow.client.session";
const TOKEN_STORAGE_KEY = "beautyflow.client.token";
const apiUrl = getApiBaseUrl();
const AUTH_REQUEST_TIMEOUT_MS = 15000;

const ClientAuthContext = createContext<ClientAuthContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseJwtPayload(token: string): ClientUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );
    const decodedPayload = window.atob(paddedPayload);
    const decodedBytes = Uint8Array.from(decodedPayload, (char) => char.charCodeAt(0));
    const parsedPayload = JSON.parse(
      new TextDecoder().decode(decodedBytes),
    ) as Partial<ClientUser>;

    if (!parsedPayload.email) {
      return null;
    }

    return {
      name: parsedPayload.name?.trim() || "Cliente BeautyFlow",
      email: normalizeEmail(parsedPayload.email),
      provider: parsedPayload.provider === "google" ? "google" : "email",
    };
  } catch {
    return null;
  }
}

function normalizeClientUser(user: ClientUser): ClientUser {
  return {
    name: user.name?.trim() || "Cliente BeautyFlow",
    email: normalizeEmail(user.email),
    provider: user.provider === "google" ? "google" : "email",
  };
}

function getReadableFetchError(error: unknown, fallbackMessage: string) {
  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.message === "Failed to fetch")
  ) {
    return fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    readStorage<string | null>(TOKEN_STORAGE_KEY, null),
  );
  const [user, setUser] = useState<ClientUser | null>(() => {
    const storedUser = readStorage<ClientUser | null>(AUTH_STORAGE_KEY, null);

    if (storedUser) {
      return storedUser;
    }

    const storedToken = readStorage<string | null>(TOKEN_STORAGE_KEY, null);
    return storedToken ? parseJwtPayload(storedToken) : null;
  });

  useEffect(() => {
    writeStorage(AUTH_STORAGE_KEY, user);
  }, [user]);

  useEffect(() => {
    writeStorage(TOKEN_STORAGE_KEY, token);
  }, [token]);

  useEffect(() => {
    if (!user && token) {
      const tokenUser = parseJwtPayload(token);

      if (tokenUser) {
        setUser(tokenUser);
      } else {
        setToken(null);
      }
    }
  }, [token, user]);

  function persistSession(authToken: string, authUser: ClientUser) {
    const normalizedUser = normalizeClientUser(authUser);

    writeStorage(TOKEN_STORAGE_KEY, authToken);
    writeStorage(AUTH_STORAGE_KEY, normalizedUser);
    setToken(authToken);
    setUser(normalizedUser);
  }

  function clearSession() {
    writeStorage(TOKEN_STORAGE_KEY, null);
    writeStorage(AUTH_STORAGE_KEY, null);
    setToken(null);
    setUser(null);
  }

  async function authenticateWithEmail(
    endpoint: "login" | "register",
    payload: { email: string; password: string; name?: string },
  ) {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        AUTH_REQUEST_TIMEOUT_MS,
      );

      try {
        const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => ({}))) as {
          token?: string;
          user?: ClientUser;
          message?: string;
        };

        if (!response.ok || !data.token || !data.user) {
          throw new Error(data.message || "Nao foi possivel autenticar a conta.");
        }

        persistSession(data.token, data.user);
        return;
      } catch (error) {
        const readableError = getReadableFetchError(
          error,
          "Nao foi possivel conectar ao servidor. Tente novamente em alguns segundos.",
        );

        const isRetryableNetworkError =
          readableError ===
          "Nao foi possivel conectar ao servidor. Tente novamente em alguns segundos.";

        lastError = new Error(readableError);

        if (!isRetryableNetworkError || attempt === 1) {
          throw lastError;
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    throw lastError ?? new Error("Nao foi possivel autenticar a conta.");
  }

  const value = useMemo<ClientAuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user || token),
      loginWithEmail: ({ email, password }) =>
        authenticateWithEmail("login", {
          email: normalizeEmail(email),
          password,
        }),
      registerWithEmail: ({ name, email, password }) =>
        authenticateWithEmail("register", {
          name: name.trim(),
          email: normalizeEmail(email),
          password,
        }),
      completeTokenLogin: (authToken) => {
        const parsedUser = parseJwtPayload(authToken);

        if (!parsedUser) {
          throw new Error("Token de autenticacao invalido.");
        }

        persistSession(authToken, parsedUser);
      },
      logout: () => {
        clearSession();
      },
    }),
    [token, user],
  );

  return (
    <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);

  if (!context) {
    throw new Error("useClientAuth must be used within ClientAuthProvider.");
  }

  return context;
}
