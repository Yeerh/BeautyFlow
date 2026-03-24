import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { type AuthRole, useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { adminRoutes } from "@/lib/portalNavigation";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-[#00C896]/35 focus:bg-white/10 focus:ring-0",
        className,
      )}
      {...props}
    />
  );
}

function getAuthErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    default:
      return "";
  }
}

function getDefaultRedirectPath(role: AuthRole) {
  if (role === "super_admin") {
    return adminRoutes.dashboard;
  }

  return role === "client" ? contactLinks.clientBooking : adminRoutes.panel;
}

function resolvePostAuthRedirect(role: AuthRole, requestedPath: string) {
  if (role === "client") {
    return requestedPath;
  }

  return role === "super_admin" ? adminRoutes.dashboard : adminRoutes.panel;
}

export function Component() {
  const location = useLocation();
  const { isAuthenticated, login, registerWithEmail, user } = useClientAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const redirectTo = useMemo(() => {
    if (
      location.state &&
      typeof location.state === "object" &&
      "from" in location.state &&
      location.state.from &&
      typeof location.state.from === "object" &&
      "pathname" in location.state.from &&
      typeof location.state.from.pathname === "string"
    ) {
      return location.state.from.pathname;
    }

    return user ? getDefaultRedirectPath(user.role) : contactLinks.clientBooking;
  }, [location.state, user]);

  useEffect(() => {
    const nextError = getAuthErrorMessage(new URLSearchParams(location.search).get("error"));
    setError(nextError);
  }, [location.search]);

  if (isAuthenticated && user) {
    return <Navigate to={resolvePostAuthRedirect(user.role, redirectTo)} replace />;
  }

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(loginForm);
      window.location.assign(resolvePostAuthRedirect(authenticatedUser.role, redirectTo));
    } catch (currentError) {
      setError(
        currentError instanceof Error ? currentError.message : "Nao foi possivel entrar na conta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authenticatedUser = await registerWithEmail({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
      });
      window.location.assign(resolvePostAuthRedirect(authenticatedUser.role, redirectTo));
    } catch (currentError) {
      setError(
        currentError instanceof Error ? currentError.message : "Nao foi possivel criar a conta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,200,150,0.22),rgba(9,14,14,0.62),rgba(0,0,0,1))]" />
      <div className="absolute left-1/2 top-0 h-[32rem] w-[70rem] -translate-x-1/2 rounded-b-[50%] bg-[#00C896]/14 blur-[110px]" />
      <div className="absolute bottom-[-10rem] right-[-4rem] h-96 w-96 rounded-full bg-[#F8C8DC]/10 blur-[120px]" />
      <div className="absolute left-[-4rem] top-1/3 h-80 w-80 rounded-full bg-white/6 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 opacity-[0.04]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition-colors duration-300 hover:border-[#00C896]/35 hover:text-[#00C896]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
                <Sparkles className="h-3.5 w-3.5 text-[#00C896]" />
                BeautyFlow
              </span>
            </div>

            <div className="mt-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base font-semibold text-white">
                BF
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white">
                {mode === "login" ? "Entrar" : "Criar conta"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {mode === "login"
                  ? "Use e-mail ou usuario e sua senha para continuar."
                  : "Cadastre nome, e-mail, telefone e senha para liberar o acesso."}
              </p>
            </div>

            <div className="mt-6 flex rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  mode === "login"
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("register")}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  mode === "register"
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Criar conta
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="mt-6 space-y-4"
                >
                  <label className="space-y-2">
                    <span className="text-sm text-white/58">E-mail ou usuario</span>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={loginForm.identifier}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            identifier: event.target.value,
                          }))
                        }
                        placeholder="voce@email.com ou usuario"
                        autoComplete="username"
                        className="pl-10"
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-white/58">Senha</span>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={loginForm.password}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        className="pl-10 pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                        aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/60 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegisterSubmit}
                  className="mt-6 space-y-4"
                >
                  <label className="space-y-2">
                    <span className="text-sm text-white/58">Nome</span>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={registerForm.name}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Seu nome completo"
                        autoComplete="name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-white/58">E-mail</span>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        type="email"
                        placeholder="voce@email.com"
                        autoComplete="email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-white/58">Telefone</span>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={registerForm.phone}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        type="tel"
                        placeholder="(81) 99999-9999"
                        autoComplete="tel"
                        className="pl-10"
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-white/58">Senha</span>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={registerForm.password}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Crie uma senha"
                        autoComplete="new-password"
                        className="pl-10 pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                        aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-white/58">Confirmar senha</span>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <Input
                        value={registerForm.confirmPassword}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        autoComplete="new-password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/60 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {error ? (
              <div className="mt-4 rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
