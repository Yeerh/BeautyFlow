import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
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

type AuthMode = "login" | "register";

const previewImage = "/woman-getting-treatment-hairdresser-shop.jpg";

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

export function FullScreenSignup() {
  const location = useLocation();
  const { isAuthenticated, loginWithEmail, registerWithEmail, user } = useClientAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser = await loginWithEmail(loginForm);
      window.location.assign(resolvePostAuthRedirect(authenticatedUser.role, redirectTo));
    } catch (currentError) {
      setError(
        currentError instanceof Error ? currentError.message : "Não foi possível entrar na conta.",
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
        currentError instanceof Error ? currentError.message : "Não foi possível criar a conta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-[#00C896]/16 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src={previewImage}
            alt="Painel de acesso BeautyFlow"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,11,11,0.18),rgba(11,11,11,0.72),rgba(11,11,11,0.94))]" />

          <div className="absolute left-10 top-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/80 backdrop-blur-xl transition-colors duration-300 hover:text-[#00C896]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao site
            </Link>
          </div>

          <div className="absolute bottom-10 left-10 right-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/12 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
              <Sparkles className="h-4 w-4" />
              Área do cliente
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white">
              Entre ou crie sua conta para acessar o calendário de agendamentos.
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/68">
              Crie sua conta com nome, e-mail, telefone e senha. Seus dados são enviados
              para o backend e registrados no banco via Prisma.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition-colors duration-300 hover:text-[#00C896]"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>

              <span className="rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                BeautyFlow
              </span>
            </div>

            <div className="mt-6 lg:mt-0">
              <span className="inline-flex items-center rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                Cliente
              </span>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                {mode === "login"
                  ? "Entre com e-mail e senha para seguir ao calendário."
                  : "Cadastre nome, e-mail, telefone e senha para liberar o acesso à área de agendamento."}
              </p>
            </div>

            <div className="mt-8 flex rounded-full border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  mode === "login"
                    ? "bg-[#00C896] text-[#0B0B0B]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  mode === "register"
                    ? "bg-[#00C896] text-[#0B0B0B]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Criar conta
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <label className="space-y-2">
                  <span className="text-sm text-white/60">E-mail</span>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                    <Mail className="h-4 w-4 text-[#00C896]" />
                    <input
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                      placeholder="voce@email.com"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/60">Senha</span>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                    <LockKeyhole className="h-4 w-4 text-[#00C896]" />
                    <input
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                      placeholder="Digite sua senha"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
                >
                  <CalendarDays className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
                  {isSubmitting ? "Entrando..." : "Efetuar login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                <label className="space-y-2">
                  <span className="text-sm text-white/60">Nome</span>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                    <UserRound className="h-4 w-4 text-[#00C896]" />
                    <input
                      value={registerForm.name}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      required
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/60">E-mail</span>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                    <Mail className="h-4 w-4 text-[#00C896]" />
                    <input
                      value={registerForm.email}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                      placeholder="voce@email.com"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-white/60">Telefone</span>
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                    <Phone className="h-4 w-4 text-[#00C896]" />
                    <input
                      value={registerForm.phone}
                      onChange={(event) =>
                        setRegisterForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                      placeholder="(81) 99999-9999"
                      type="tel"
                      autoComplete="tel"
                      required
                    />
                  </div>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-white/60">Senha</span>
                    <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                      <LockKeyhole className="h-4 w-4 text-[#00C896]" />
                      <input
                        value={registerForm.password}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                        placeholder="Crie uma senha"
                        type="password"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-white/60">Confirmar senha</span>
                    <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                      <LockKeyhole className="h-4 w-4 text-[#00C896]" />
                      <input
                        value={registerForm.confirmPassword}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                        placeholder="Repita a senha"
                        type="password"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00C896] px-6 py-3.5 text-sm font-semibold text-[#0B0B0B] shadow-[0_16px_40px_rgba(0,200,150,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2ed5a8]"
                >
                  <Sparkles className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
                  {isSubmitting ? "Criando conta..." : "Criar conta"}
                </button>
              </form>
            )}

            {error ? (
              <div className="mt-4 rounded-[1.25rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
