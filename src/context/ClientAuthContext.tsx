import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildApiUrl } from "@/lib/api";

export type AuthRole = "client" | "admin" | "super_admin";

export type AuthUser = {
  id: number;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  businessName: string | null;
  provider: "email";
  role: AuthRole;
};

type ClientAuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: { identifier: string; password: string }) => Promise<AuthUser>;
  loginWithEmail: (input: { email: string; password: string }) => Promise<AuthUser>;
  registerWithEmail: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "beautyflow.client.session";
const TOKEN_STORAGE_KEY = "beautyflow.client.token";

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

function normalizeRole(role?: string | null): AuthRole {
  if (role === "admin" || role === "super_admin") {
    return role;
  }

  return "client";
}

function normalizeClientUser(user: Partial<AuthUser> & { email: string }): AuthUser {
  return {
    id: Number(user.id ?? 0),
    name: user.name?.trim() || "Cliente BeautyFlow",
    username: user.username?.trim() || null,
    email: normalizeEmail(user.email),
    phone: user.phone?.trim() || null,
    businessName: user.businessName?.trim() || null,
    provider: "email",
    role: normalizeRole(user.role),
  };
}

function parseJwtPayload(token: string): AuthUser | null {
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
    ) as Partial<AuthUser>;

    if (!parsedPayload.email) {
      return null;
    }

    return normalizeClientUser({
      id: parsedPayload.id,
      name: parsedPayload.name,
      username: parsedPayload.username,
      email: parsedPayload.email,
      phone: parsedPayload.phone,
      businessName: parsedPayload.businessName,
      role: parsedPayload.role,
    });
  } catch {
    return null;
  }
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
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = readStorage<AuthUser | null>(AUTH_STORAGE_KEY, null);

    if (storedUser?.email) {
      return normalizeClientUser(storedUser);
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

  function persistSession(authToken: string, authUser: AuthUser) {
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

  async function authenticate(
    endpoint: "login" | "register",
    payload: Record<string, string>,
  ) {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(buildApiUrl(`/api/auth/${endpoint}`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json().catch(() => ({}))) as {
          token?: string;
          user?: AuthUser;
          message?: string;
        };

        if (!response.ok || !data.token || !data.user) {
          throw new Error(data.message || "Nao foi possivel autenticar a conta.");
        }

        const authenticatedUser = normalizeClientUser(data.user);
        persistSession(data.token, authenticatedUser);
        return authenticatedUser;
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
      }
    }

    throw lastError ?? new Error("Nao foi possivel autenticar a conta.");
  }

  const value = useMemo<ClientAuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user || token),
      login: ({ identifier, password }) =>
        authenticate("login", {
          identifier: identifier.trim(),
          password,
        }),
      loginWithEmail: ({ email, password }) =>
        authenticate("login", {
          identifier: normalizeEmail(email),
          password,
        }),
      registerWithEmail: ({ name, email, phone, password }) =>
        authenticate("register", {
          name: name.trim(),
          email: normalizeEmail(email),
          phone: phone.trim(),
          password,
        }),
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
