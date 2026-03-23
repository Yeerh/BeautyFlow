import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthProviderType = "email" | "google";

type ClientUser = {
  name: string;
  email: string;
  provider: AuthProviderType;
};

type StoredClientAccount = ClientUser & {
  password: string;
};

type ClientAuthContextValue = {
  user: ClientUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginWithEmail: (input: { email: string; password: string }) => void;
  registerWithEmail: (input: {
    name: string;
    email: string;
    password: string;
  }) => void;
  completeTokenLogin: (token: string) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "beautyflow.client.session";
const ACCOUNT_STORAGE_KEY = "beautyflow.client.accounts";
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
  const [accounts, setAccounts] = useState<StoredClientAccount[]>(() =>
    readStorage<StoredClientAccount[]>(ACCOUNT_STORAGE_KEY, []),
  );

  useEffect(() => {
    writeStorage(AUTH_STORAGE_KEY, user);
  }, [user]);

  useEffect(() => {
    writeStorage(TOKEN_STORAGE_KEY, token);
  }, [token]);

  useEffect(() => {
    writeStorage(ACCOUNT_STORAGE_KEY, accounts);
  }, [accounts]);

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

  const value = useMemo<ClientAuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      loginWithEmail: ({ email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const account = accounts.find(
          (item) =>
            normalizeEmail(item.email) === normalizedEmail && item.password === password,
        );

        if (!account) {
          throw new Error("E-mail ou senha invalidos.");
        }

        setToken(null);
        setUser({
          name: account.name,
          email: account.email,
          provider: account.provider,
        });
      },
      registerWithEmail: ({ name, email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        const accountExists = accounts.some(
          (item) => normalizeEmail(item.email) === normalizedEmail,
        );

        if (accountExists) {
          throw new Error("Ja existe uma conta cadastrada com este e-mail.");
        }

        const newAccount: StoredClientAccount = {
          name: name.trim(),
          email: normalizedEmail,
          password,
          provider: "email",
        };

        setAccounts((current) => [...current, newAccount]);
        setToken(null);
        setUser({
          name: newAccount.name,
          email: newAccount.email,
          provider: newAccount.provider,
        });
      },
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
    [accounts, token, user],
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
