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

  async function authenticateWithEmail(
    endpoint: "login" | "register",
    payload: { email: string; password: string; name?: string },
  ) {
    const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      token?: string;
      user?: ClientUser;
      message?: string;
    };

    if (!response.ok || !data.token || !data.user) {
      throw new Error(data.message || "Nao foi possivel autenticar a conta.");
    }

    setToken(data.token);
    setUser({
      name: data.user.name?.trim() || "Cliente BeautyFlow",
      email: normalizeEmail(data.user.email),
      provider: data.user.provider === "google" ? "google" : "email",
    });
  }

  const value = useMemo<ClientAuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
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

        setToken(authToken);
        setUser(parsedUser);
      },
      logout: () => {
        setToken(null);
        setUser(null);
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
