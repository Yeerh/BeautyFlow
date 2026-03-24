import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  LayoutPanelTop,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { type AuthRole, useClientAuth } from "@/context/ClientAuthContext";
import { contactLinks } from "@/data/landingContent";
import { adminRoutes } from "@/lib/portalNavigation";

type AuthMode = "login" | "register";

const previewImage = "/woman-getting-treatment-hairdresser-shop.jpg";

const accessRoles = [
  {
    title: "Conta pessoal",
    description: "Agenda horarios e acompanha as reservas feitas.",
  },
  {
    title: "Administrador",
    description: "Entra com o mesmo formulario e segue para o painel.",
  },
  {
    title: "Super admin",
    description: "Acessa o dashboard geral e a gestao das contas.",
  },
] as const;

const registerHighlights = [
  "Cadastro com nome, e-mail, telefone e senha",
  "Reserva salva no sistema antes de abrir o WhatsApp",
  "Acesso rapido ao historico dos seus agendamentos",
] as const;

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
  const { isAuthenticated, login, registerWithEmail, user } = useClientAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
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

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070B] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-80 w-80 rounded-full bg-[#00C896]/18 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-[#F8C8DC]/12 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/4 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
      </div>

      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src={previewImage}
            alt="Acesso BeautyFlow"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,7,11,0.24),rgba(5,7,11,0.76),rgba(5,7,11,0.96))]" />

          <div className="absolute left-10 top-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/80 backdrop-blur-xl transition-colors duration-300 hover:text-[#00C896]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao site
            </Link>
          </div>

          <div className="absolute bottom-10 left-10 right-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00C896]/20 bg-[#00C896]/12 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
              <Sparkles className="h-4 w-4" />
              Acesso unificado
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-white">
              Entre na agenda ou no painel usando o mesmo ponto de acesso.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
              O login reconhece conta pessoal, administrador e super admin e envia cada
              perfil para a area certa automaticamente.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {accessRoles.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.6rem] border border-white/10 bg-black/25 p-4 backdrop-blur-xl"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/58">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-5 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-xl overflow-hidden rounded-[2.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,200,150,0.14),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
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

              <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <span className="inline-flex items-center rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                    {mode === "login" ? "Acesso" : "Cadastro"}
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/62">
                    {mode === "login"
                      ? "Use e-mail ou usuario para entrar. Administradores e super admin tambem passam por aqui."
                      : "Cadastre sua conta pessoal para agendar, revisar seus horarios e acompanhar os locais reservados."}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/64">
                  <p className="font-semibold text-white">Redirecionamento automatico</p>
                  <p className="mt-1 leading-6">
                    O sistema identifica seu perfil e abre a area correta depois do login.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:hidden">
                {accessRoles.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex rounded-full border border-white/10 bg-black/20 p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
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
                  onClick={() => handleModeChange("register")}
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
                <>
                  <div className="mt-6 rounded-[1.6rem] border border-[#00C896]/15 bg-[linear-gradient(180deg,rgba(0,200,150,0.1),rgba(255,255,255,0.03))] p-4">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex rounded-2xl border border-[#00C896]/20 bg-[#00C896]/10 p-3 text-[#00C896]">
                        <LayoutPanelTop className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Login unico para agenda e painel
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          Clientes, administradores e super admin acessam com o mesmo
                          formulario e seguem para a area correta.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">E-mail ou usuario</span>
                      <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
                        <Mail className="h-4 w-4 text-[#00C896]" />
                        <input
                          value={loginForm.identifier}
                          onChange={(event) =>
                            setLoginForm((current) => ({
                              ...current,
                              identifier: event.target.value,
                            }))
                          }
                          className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                          placeholder="voce@email.com ou usuario"
                          autoComplete="username"
                          required
                        />
                      </div>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm text-white/60">Senha</span>
                      <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
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
                      <CalendarDays
                        className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`}
                      />
                      {isSubmitting ? "Entrando..." : "Entrar agora"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {registerHighlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/60"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                    <label className="space-y-2">
                      <span className="text-sm text-white/60">Nome</span>
                      <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
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
                      <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
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
                      <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
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
                        <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
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
                        <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
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
                </>
              )}

              {error ? (
                <div className="mt-4 rounded-[1.35rem] border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-3 text-sm text-[#d7fff4]">
                  {error}
                </div>
              ) : null}

              {mode === "login" ? (
                <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/55">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#00C896]" />
                  <p className="leading-6">
                    Se preferir uma tela dedicada do painel, o acesso administrativo continua
                    disponivel em{" "}
                    <Link
                      to={contactLinks.admin}
                      className="text-[#00C896] transition-colors hover:text-white"
                    >
                      {contactLinks.admin}
                    </Link>
                    .
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
