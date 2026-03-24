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

type AuthContent = {
  image: {
    src: string;
    alt: string;
  };
  quote: {
    text: string;
    author: string;
  };
};

const signInContent: AuthContent = {
  image: {
    src: "/woman-getting-treatment-hairdresser-shop.jpg",
    alt: "Acesso BeautyFlow",
  },
  quote: {
    text: "Entre e continue sua agenda com um fluxo simples e direto.",
    author: "BeautyFlow",
  },
};

const signUpContent: AuthContent = {
  image: {
    src: "/female-model-demonstrating-silber-bracelet.jpg",
    alt: "Cadastro BeautyFlow",
  },
  quote: {
    text: "Crie sua conta e deixe seus proximos agendamentos mais organizados.",
    author: "BeautyFlow",
  },
};

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white shadow-sm shadow-black/5 outline-none transition-all duration-300 placeholder:text-white/32",
        "focus:border-[#00C896]/35 focus:bg-white/[0.07]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2.5">
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}

function PasswordField({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  showPassword,
  onToggle,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  showPassword: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="pl-11 pr-12"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors duration-300 hover:text-white"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );
}

type TypewriterProps = {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
};

function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            window.setTimeout(() => setIsDeleting(true), delay);
          }
        } else if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex(0);
          setTextArrayIndex((prev) => (prev + 1) % textArray.length);
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => window.clearTimeout(timeout);
  }, [
    currentIndex,
    currentText,
    delay,
    deleteSpeed,
    displayText,
    isDeleting,
    loop,
    speed,
    textArray.length,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
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

function SignInForm({
  isSubmitting,
  error,
  loginForm,
  showPassword,
  onPasswordToggle,
  onSubmit,
  onIdentifierChange,
  onPasswordChange,
}: {
  isSubmitting: boolean;
  error: string;
  loginForm: { identifier: string; password: string };
  showPassword: boolean;
  onPasswordToggle: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Entrar na conta</h1>
        <p className="max-w-sm text-sm leading-6 text-white/58">
          Use e-mail ou usuario para fazer login.
        </p>
      </div>

      <div className="grid gap-5">
        <Field label="E-mail ou usuario" htmlFor="identifier">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="identifier"
              name="identifier"
              value={loginForm.identifier}
              onChange={(event) => onIdentifierChange(event.target.value)}
              placeholder="voce@email.com ou usuario"
              autoComplete="username"
              className="pl-11"
              required
            />
          </div>
        </Field>

        <PasswordField
          id="login-password"
          label="Senha"
          value={loginForm.password}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          showPassword={showPassword}
          onToggle={onPasswordToggle}
          onChange={onPasswordChange}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/60 border-t-transparent" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>

        {error ? (
          <div className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}
      </div>
    </form>
  );
}

function SignUpForm({
  isSubmitting,
  error,
  registerForm,
  showPassword,
  onPasswordToggle,
  onSubmit,
  onChange,
}: {
  isSubmitting: boolean;
  error: string;
  registerForm: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  showPassword: boolean;
  onPasswordToggle: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof typeof registerForm, value: string) => void;
}) {
  return (
    <form onSubmit={onSubmit} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Criar conta</h1>
        <p className="max-w-sm text-sm leading-6 text-white/58">
          Preencha seus dados para liberar o acesso.
        </p>
      </div>

      <div className="grid gap-5">
        <Field label="Nome completo" htmlFor="name">
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="name"
              name="name"
              value={registerForm.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
              className="pl-11"
              required
            />
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="register-email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="register-email"
                name="email"
                type="email"
                value={registerForm.email}
                onChange={(event) => onChange("email", event.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                className="pl-11"
                required
              />
            </div>
          </Field>

          <Field label="Telefone" htmlFor="phone">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={registerForm.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="(81) 99999-9999"
                autoComplete="tel"
                className="pl-11"
                required
              />
            </div>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            id="register-password"
            label="Senha"
            value={registerForm.password}
            placeholder="Crie uma senha"
            autoComplete="new-password"
            showPassword={showPassword}
            onToggle={onPasswordToggle}
            onChange={(value) => onChange("password", value)}
          />

          <PasswordField
            id="register-confirm-password"
            label="Confirmar senha"
            value={registerForm.confirmPassword}
            placeholder="Repita a senha"
            autoComplete="new-password"
            showPassword={showPassword}
            onToggle={onPasswordToggle}
            onChange={(value) => onChange("confirmPassword", value)}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/60 border-t-transparent" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </button>

        {error ? (
          <div className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fecaca]">
            {error}
          </div>
        ) : null}
      </div>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  children,
}: {
  isSignIn: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[460px] gap-5">
      <div className="rounded-[2rem] border border-white/10 bg-black/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
        {children}
      </div>

      <div className="text-center text-sm text-white/60">
        {isSignIn ? "Ainda nao tem conta?" : "Ja tem uma conta?"}{" "}
        <button
          type="button"
          onClick={onToggle}
          className="font-semibold text-white transition-colors duration-300 hover:text-[#00C896]"
        >
          {isSignIn ? "Criar conta" : "Entrar"}
        </button>
      </div>
    </div>
  );
}

export function Component() {
  const location = useLocation();
  const { isAuthenticated, login, registerWithEmail, user } = useClientAuth();
  const [isSignIn, setIsSignIn] = useState(true);
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

  const currentContent = isSignIn ? signInContent : signUpContent;

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

  const handleToggle = () => {
    setIsSignIn((prev) => !prev);
    setError("");
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
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

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
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
    <div className="w-full min-h-screen bg-[#05070B] text-white md:grid md:grid-cols-[minmax(0,520px)_1fr]">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-8 md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,200,150,0.15),transparent_42%),linear-gradient(180deg,#080b10,#05070B)]" />
        <div className="absolute left-[-5rem] top-[15%] h-72 w-72 rounded-full bg-[#00C896]/10 blur-[110px]" />
        <div className="absolute bottom-[-5rem] right-[-3rem] h-80 w-80 rounded-full bg-white/6 blur-[120px]" />

        <div className="relative z-10 w-full">
          <div className="mx-auto mb-8 flex w-full max-w-[460px] items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition-colors duration-300 hover:border-[#00C896]/35 hover:text-[#00C896]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-[#00C896]" />
              BeautyFlow
            </span>
          </div>

          <AuthFormContainer isSignIn={isSignIn} onToggle={handleToggle}>
            <AnimatePresence mode="wait">
              {isSignIn ? (
                <motion.div
                  key="sign-in"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignInForm
                    isSubmitting={isSubmitting}
                    error={error}
                    loginForm={loginForm}
                    showPassword={showLoginPassword}
                    onPasswordToggle={() => setShowLoginPassword((prev) => !prev)}
                    onSubmit={handleSignIn}
                    onIdentifierChange={(value) =>
                      setLoginForm((current) => ({
                        ...current,
                        identifier: value,
                      }))
                    }
                    onPasswordChange={(value) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: value,
                      }))
                    }
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="sign-up"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignUpForm
                    isSubmitting={isSubmitting}
                    error={error}
                    registerForm={registerForm}
                    showPassword={showRegisterPassword}
                    onPasswordToggle={() => setShowRegisterPassword((prev) => !prev)}
                    onSubmit={handleSignUp}
                    onChange={(field, value) =>
                      setRegisterForm((current) => ({
                        ...current,
                        [field]: value,
                      }))
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </AuthFormContainer>
        </div>
      </div>

      <div
        className="relative hidden min-h-screen overflow-hidden bg-cover bg-center md:block"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,11,0.12),rgba(5,7,11,0.32),rgba(5,7,11,0.94))]" />
        <div className="absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-t from-[#05070B] to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 lg:p-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72 backdrop-blur-xl">
            Portal BeautyFlow
          </div>

          <blockquote className="max-w-xl space-y-4 text-white">
            <p className="text-3xl font-semibold leading-tight lg:text-4xl">
              “
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={45}
                className="inline"
              />
              ”
            </p>
            <cite className="block text-sm font-medium not-italic text-white/68">
              {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
