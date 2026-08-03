"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PasswordField } from "@/monitoramento/components/auth/password-field";
import { SystemStatus } from "@/monitoramento/components/auth/system-status";
import { Button } from "@/monitoramento/components/ui/button";
import { LoadingSpinner } from "@/monitoramento/components/ui/loading-spinner";
import { signInAction, type LoginErrorCode } from "@/monitoramento/features/auth/actions";
import { cn } from "@/monitoramento/lib/utils/cn";

type LoginUrlErrorCode =
  | "ambiente-nao-configurado"
  | "credenciais-invalidas"
  | "sessao-expirada"
  | "sem-permissao";

type LoginStatusCode = "logout";

type LoginFormProps = {
  appName: string;
  initialErrorCode: LoginUrlErrorCode | null;
  initialStatusCode: LoginStatusCode | null;
  redirectTo: string;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

const loginErrorToToast: Record<
  LoginErrorCode,
  { title: string; description: string; kind: "error" | "warning" }
> = {
  ACCOUNT_DISABLED: {
    title: "Conta inativa",
    description:
      "Este usuário está desativado. Entre em contato com a administração do sistema.",
    kind: "warning",
  },
  INVALID_CREDENTIALS: {
    title: "Login não realizado",
    description:
      "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.",
    kind: "error",
  },
  SERVER_UNAVAILABLE: {
    title: "Sistema temporariamente indisponível",
    description:
      "Não foi possível conectar ao servidor. Tente novamente em alguns instantes.",
    kind: "error",
  },
  UNAUTHORIZED: {
    title: "Acesso não autorizado",
    description: "Seu usuário não possui permissão para acessar este sistema.",
    kind: "error",
  },
  UNKNOWN_ERROR: {
    title: "Não foi possível entrar",
    description:
      "Ocorreu uma falha inesperada. Tente novamente em alguns instantes.",
    kind: "error",
  },
  VALIDATION_ERROR: {
    title: "Preencha os campos obrigatórios",
    description: "Informe seu e-mail e sua senha para continuar.",
    kind: "warning",
  },
};

const urlErrorToToast: Record<
  LoginUrlErrorCode,
  { title: string; description: string; kind: "error" | "warning" }
> = {
  "ambiente-nao-configurado": {
    title: "Sistema temporariamente indisponível",
    description:
      "O ambiente de acesso ainda está em configuração. Tente novamente em alguns instantes.",
    kind: "warning",
  },
  "credenciais-invalidas": loginErrorToToast.INVALID_CREDENTIALS,
  "sem-permissao": loginErrorToToast.UNAUTHORIZED,
  "sessao-expirada": {
    title: "Sessão expirada",
    description: "Por segurança, entre novamente para continuar.",
    kind: "warning",
  },
};

const statusToToast: Record<
  LoginStatusCode,
  { title: string; description: string }
> = {
  logout: {
    title: "Sessão encerrada",
    description: "Você saiu do sistema com segurança.",
  },
};

export function LoginForm({
  appName,
  initialErrorCode,
  initialStatusCode,
  redirectTo,
}: LoginFormProps) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState("");
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (initialErrorCode) {
      showToast(urlErrorToToast[initialErrorCode]);
      cleanLoginUrl(router);

      if (initialErrorCode === "credenciais-invalidas") {
        triggerShake(setShake);
      }
    }

    if (initialStatusCode) {
      toast.success(statusToToast[initialStatusCode].title, {
        description: statusToToast[initialStatusCode].description,
        icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
      });
      cleanLoginUrl(router);
    }
  }, [initialErrorCode, initialStatusCode, router]);

  useEffect(() => {
    if (initialErrorCode) {
      return;
    }

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    if (isDesktop) {
      emailRef.current?.focus({ preventScroll: true });
    }
  }, [initialErrorCode]);

  function updateEmail(value: string) {
    setEmail(value);

    if (submittedOnce || errors.email) {
      setErrors((current) => ({ ...current, email: validateEmail(value) }));
    }
  }

  function updatePassword(value: string) {
    setPassword(value);

    if (submittedOnce || errors.password) {
      setErrors((current) => ({
        ...current,
        password: validatePassword(value),
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || success) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setEmail(normalizedEmail);
    setSubmittedOnce(true);
    setFormMessage("");

    const nextErrors = {
      email: validateEmail(normalizedEmail),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      toast.warning("Preencha os campos obrigatórios", {
        description: "Informe seu e-mail e sua senha para continuar.",
        icon: <AlertCircle className="h-4 w-4" aria-hidden="true" />,
      });
      focusFirstInvalid(nextErrors, emailRef.current, passwordRef.current);
      triggerShake(setShake);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.set("email", normalizedEmail);
    formData.set("password", password);
    formData.set("remember", remember ? "on" : "");
    formData.set("redirectTo", sanitizeRedirectPath(redirectTo));

    const result = await signInAction(formData);

    if (result.success) {
      setSuccess(true);
      toast.success("Acesso autorizado", {
        description: `Bem-vindo ao ${appName}.`,
        icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
      });

      window.setTimeout(() => {
        router.replace(result.redirectTo as Route, { scroll: false });
        router.refresh();
      }, 850);
      return;
    }

    setSubmitting(false);
    setPassword("");
    setErrors((current) => ({
      ...current,
      password:
        result.code === "VALIDATION_ERROR"
          ? validatePassword("")
          : "E-mail ou senha incorretos.",
    }));
    setFormMessage(localMessageForError(result.code));
    showToast(loginErrorToToast[result.code]);
    triggerShake(setShake);
    passwordRef.current?.focus({ preventScroll: true });
  }

  const disabled = submitting || success;
  const emailLooksValid = email.length > 0 && !validateEmail(email);

  return (
    <div className={cn("transition", shake ? "login-shake" : "")}>
      <div className="mt-5 text-center [@media(max-height:820px)]:mt-2">
        <p className="text-sm font-semibold uppercase tracking-[0.03em] text-blue-700">
          Acesso restrito
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-blue-950 sm:text-[2.45rem] [@media(max-height:820px)]:text-[1.85rem]">
          <Greeting />
        </h2>
        <p className="mx-auto mt-3 max-w-[420px] text-base font-medium leading-7 text-slate-600 [@media(max-height:820px)]:mt-1 [@media(max-height:820px)]:text-sm [@media(max-height:820px)]:leading-6">
          Bem-vindo de volta. Informe suas credenciais para continuar.
        </p>
        <SystemStatus />
      </div>

      <p
        className="mt-4 min-h-5 text-center text-sm font-bold text-red-600 [@media(max-height:820px)]:mt-2"
        aria-live="polite"
      >
        {formMessage}
      </p>

      <form
        className="mt-2 space-y-3.5 [@media(max-height:820px)]:space-y-1.5"
        onSubmit={handleSubmit}
        noValidate
      >
        <input
          name="redirectTo"
          type="hidden"
          value={sanitizeRedirectPath(redirectTo)}
        />

        <label className="block text-sm font-semibold text-blue-950">
          E-mail
          <span
            className={cn(
              "mt-2 flex h-14 items-center gap-3 rounded-[14px] border bg-white px-4 text-slate-400 shadow-[0_7px_20px_rgba(29,66,112,0.04)] transition duration-200 focus-within:border-blue-500 focus-within:bg-blue-50/20 focus-within:text-blue-600 focus-within:ring-4 focus-within:ring-blue-100 sm:h-[58px] [@media(max-height:820px)]:h-11",
              errors.email
                ? "border-red-300 text-red-500 focus-within:border-red-500 focus-within:ring-red-100"
                : "border-[#d8e2ef]",
              disabled ? "bg-slate-50 opacity-80" : "",
            )}
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
            <input
              aria-describedby="email-error"
              aria-invalid={Boolean(errors.email)}
              autoCapitalize="none"
              autoComplete="email"
              className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 focus-visible:outline-none disabled:cursor-not-allowed"
              disabled={disabled}
              inputMode="email"
              maxLength={254}
              name="email"
              onBlur={() => setEmail((current) => current.trim().toLowerCase())}
              onChange={(event) => updateEmail(event.target.value)}
              placeholder="Digite seu e-mail"
              ref={emailRef}
              required
              type="email"
              value={email}
            />
            {emailLooksValid ? (
              <CheckCircle2
                className="h-5 w-5 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
            ) : null}
          </span>
          <span
            className="mt-1 block min-h-5 text-xs font-bold text-red-600"
            id="email-error"
          >
            {errors.email ?? ""}
          </span>
        </label>

        <PasswordField
          disabled={disabled}
          error={errors.password}
          inputRef={passwordRef}
          onChange={updatePassword}
          value={password}
        />

        <div className="min-h-[3rem] [@media(max-height:820px)]:min-h-8">
          <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-600">
            <input
              checked={remember}
              className="h-5 w-5 rounded-[5px] border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              disabled={disabled}
              name="remember"
              onChange={(event) => setRemember(event.target.checked)}
              type="checkbox"
            />
            Lembrar meu acesso
          </label>
          <p
            className={cn(
              "mt-1 text-xs font-medium text-blue-700 transition-opacity [@media(max-height:820px)]:hidden",
              remember ? "opacity-100" : "opacity-0",
            )}
          >
            Seu acesso permanecerá conectado neste dispositivo.
          </p>
        </div>

        <Button
          className="group min-h-14 w-full rounded-[14px] bg-[linear-gradient(90deg,#2585ff_0%,#075fdc_100%)] text-base shadow-[0_14px_28px_rgba(0,91,219,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_18px_34px_rgba(0,91,219,0.3)] active:scale-[0.99] sm:min-h-[58px] [@media(max-height:820px)]:min-h-11"
          disabled={disabled}
          type="submit"
        >
          {submitting || success ? (
            <>
              {success ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              ) : (
                <LoadingSpinner className="h-5 w-5" label="Entrando" />
              )}
              {success ? "Acesso autorizado" : "Entrando..."}
            </>
          ) : (
            <>
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              Entrar no sistema
              <ArrowRight
                className="h-5 w-5 transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </Button>
      </form>

      <LoginSecurityNote />
    </div>
  );
}

function Greeting() {
  const [greeting, setGreeting] = useState("Bem-vindo de volta!");

  useEffect(() => {
    const hour = getBrasiliaHour();

    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia!");
      return;
    }

    if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde!");
      return;
    }

    setGreeting("Boa noite!");
  }, []);

  return greeting;
}

function LoginSecurityNote() {
  return (
    <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-semibold leading-5 text-slate-500 [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:text-[11px]">
      <ShieldCheck
        className="h-4 w-4 shrink-0 text-blue-600"
        aria-hidden="true"
      />
      <span>
        Seus dados estão protegidos com criptografia e controle seguro de
        acesso.
      </span>
    </div>
  );
}

function getBrasiliaHour() {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return Number.parseInt(formatted.replace(/\D/g, ""), 10) % 24;
}

function validateEmail(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "Informe seu e-mail.";
  }

  if (
    normalized.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    return "Digite um endereço de e-mail válido.";
  }

  return undefined;
}

function validatePassword(value: string) {
  if (!value) {
    return "Informe sua senha.";
  }

  if (value.length > 256) {
    return "A senha informada não atende aos requisitos de acesso.";
  }

  return undefined;
}

function focusFirstInvalid(
  errors: FieldErrors,
  emailInput: HTMLInputElement | null,
  passwordInput: HTMLInputElement | null,
) {
  if (errors.email) {
    emailInput?.focus({ preventScroll: true });
    return;
  }

  if (errors.password) {
    passwordInput?.focus({ preventScroll: true });
  }
}

function localMessageForError(code: LoginErrorCode) {
  if (code === "INVALID_CREDENTIALS") {
    return "E-mail ou senha incorretos.";
  }

  if (code === "ACCOUNT_DISABLED") {
    return "Conta inativa. Procure a administração do sistema.";
  }

  if (code === "UNAUTHORIZED") {
    return "Acesso não autorizado para este sistema.";
  }

  if (code === "SERVER_UNAVAILABLE" || code === "UNKNOWN_ERROR") {
    return "Não foi possível concluir o login agora.";
  }

  return "";
}

function showToast(message: {
  title: string;
  description: string;
  kind: "error" | "warning";
}) {
  const options = {
    description: message.description,
    icon: <AlertCircle className="h-4 w-4" aria-hidden="true" />,
  };

  if (message.kind === "warning") {
    toast.warning(message.title, options);
    return;
  }

  toast.error(message.title, options);
}

function triggerShake(setShake: (value: boolean) => void) {
  setShake(true);
  window.setTimeout(() => setShake(false), 460);
}

function sanitizeRedirectPath(value: string) {
  if (
    !value.startsWith("/") ||
    !value.startsWith("/monitoramento") ||
    value.startsWith("//")
  ) {
    return "/monitoramento/inicio";
  }

  return value;
}

function cleanLoginUrl(router: ReturnType<typeof useRouter>) {
  const url = new URL(window.location.href);
  url.searchParams.delete("erro");
  url.searchParams.delete("status");
  const next = `${url.pathname}${url.search}${url.hash}`;
  router.replace((next || "/monitoramento/login") as Route, { scroll: false });
}
