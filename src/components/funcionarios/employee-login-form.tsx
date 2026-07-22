"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type EmployeeLoginFormProps = {
  redirectTo: string;
  isSupabaseReady: boolean;
};

const rememberedLoginKey = "funcionarios-login-remembered-identifier";

export function EmployeeLoginForm({
  redirectTo,
  isSupabaseReady,
}: EmployeeLoginFormProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberAccess, setRememberAccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(
    isSupabaseReady ? null : "A conexão de acesso ainda não está configurada.",
  );

  useEffect(() => {
    let frameId: number | null = null;

    try {
      const rememberedIdentifier = window.localStorage.getItem(rememberedLoginKey);

      if (rememberedIdentifier) {
        frameId = window.requestAnimationFrame(() => {
          setIdentifier(rememberedIdentifier);
          setRememberAccess(true);
        });
      }
    } catch {
      // Local storage may be blocked; login remains fully functional.
    }

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseReady) {
      setMessage("Configure a conexão de acesso antes de entrar no módulo.");
      return;
    }

    const email = identifier.trim();
    if (!email.includes("@")) {
      setMessage("Informe o e-mail autorizado para acessar o sistema.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (rememberAccess) {
        window.localStorage.setItem(rememberedLoginKey, email);
      } else {
        window.localStorage.removeItem(rememberedLoginKey);
      }
    } catch {
      // Remembering the identifier is optional and never stores passwords.
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setIsSubmitting(false);
      setMessage("Usuário ou senha inválidos.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile?.is_active) {
      await supabase.auth.signOut();
      setIsSubmitting(false);
      setMessage("Usuário sem perfil ativo. Procure um administrador.");
      return;
    }

    setIsSubmitting(false);
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form id="loginForm" className="form-grid login-form" onSubmit={handleSubmit}>
      <label className="login-field">
        <span className="login-field-label">Usuário</span>
        <span className="login-input user-input">
          <UserRound className="login-input-icon" aria-hidden="true" />
          <input
            id="loginUser"
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Digite seu usuário"
            autoComplete="username"
            required
            disabled={!isSupabaseReady || isSubmitting}
          />
        </span>
      </label>
      <label className="login-field">
        <span className="login-field-label">Senha</span>
        <span className="login-input password-input">
          <LockKeyhole className="login-input-icon" aria-hidden="true" />
          <input
            id="loginPassword"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
            disabled={!isSupabaseReady || isSubmitting}
          />
          <button
            id="togglePassword"
            className="password-toggle"
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
            disabled={!isSupabaseReady || isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </span>
      </label>
      <label className="login-remember">
        <input
          type="checkbox"
          checked={rememberAccess}
          onChange={(event) => setRememberAccess(event.target.checked)}
          disabled={!isSupabaseReady || isSubmitting}
        />
        <span aria-hidden="true">
          <Check className="size-3.5" />
        </span>
        Lembrar meu acesso
      </label>
      <button
        className="primary-action login-submit"
        type="submit"
        disabled={!isSupabaseReady || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="login-spinner size-5" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          <>
            Entrar
            <ArrowRight className="login-submit-arrow size-5" aria-hidden="true" />
          </>
        )}
      </button>
      <p className="login-hint">
        {message ?? "Acesso exclusivo para usuários autorizados da SEMASC."}
      </p>
    </form>
  );
}
