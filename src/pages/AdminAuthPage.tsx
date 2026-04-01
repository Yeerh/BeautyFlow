import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  LayoutPanelTop,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useClientAuth } from "@/context/ClientAuthContext";
import { adminRoutes, clientRoutes } from "@/lib/portalNavigation";

export function AdminAuthPage() {
  const { isAuthenticated, isSessionReady, login, logout, user } = useClientAuth();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isSessionReady) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={
          user.role === "client"
            ? clientRoutes.bookings
            : user.role === "super_admin"
              ? adminRoutes.dashboard
              : adminRoutes.panel
        }
        replace
      />
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(form);

      if (authenticatedUser.role === "client") {
        logout();
        setError("Esta área é exclusiva para administradores.");
        return;
      }

      window.location.assign(
        authenticatedUser.role === "super_admin" ? adminRoutes.dashboard : adminRoutes.panel,
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Não foi possível acessar o painel administrativo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-[#F8C8DC]/16 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-72 w-72 rounded-full bg-[#00C896]/12 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition-colors duration-300 hover:text-[#F8C8DC]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao site
            </Link>

            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#F8C8DC]/20 bg-[#F8C8DC]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F8C8DC]">
              <ShieldCheck className="h-4 w-4" />
              Acesso administrativo
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white">
              Painel protegido para administradores e super admin.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
              Entre com usuário ou e-mail para acessar a área de operação, contas
              administradoras e dashboards de faturamento.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Login por usuário ou e-mail",
                "Painel separado por nível de acesso",
                "Visão de faturamento e operação",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 lg:p-10">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#00C896]/20 bg-[#00C896]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00C896]">
                Admin
              </span>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Entrar no painel
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/62">
                Use o usuário do super admin ou de uma conta administradora criada no sistema.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="space-y-2">
                <span className="text-sm text-white/60">Usuário ou e-mail</span>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                  <UserRound className="h-4 w-4 text-[#00C896]" />
                  <input
                    value={form.identifier}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        identifier: event.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-white outline-none placeholder:text-white/28"
                    placeholder="diegoadmin"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm text-white/60">Senha</span>
                <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                  <LockKeyhole className="h-4 w-4 text-[#00C896]" />
                  <input
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
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
                <LayoutPanelTop className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
                {isSubmitting ? "Entrando..." : "Acessar painel"}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-[1.25rem] border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
