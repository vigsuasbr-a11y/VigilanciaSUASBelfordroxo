"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LockKeyhole, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  redirectTo: string;
  isSupabaseReady: boolean;
};

export function LoginForm({ redirectTo, isSupabaseReady }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(
    isSupabaseReady ? null : "Configure o Supabase para habilitar o login.",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseReady) {
      setMessage("Supabase ainda não configurado.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsSubmitting(false);
      setMessage("Não foi possível entrar. Confira e-mail e senha.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,is_active")
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm font-bold text-[#10213a]">E-mail</span>
        <span className="mt-2 flex min-h-12 items-center gap-2 rounded-lg border border-[#dbe5f1] bg-white px-3">
          <Mail className="size-5 text-[#074fb8]" aria-hidden="true" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none"
            placeholder="seu.email@belfordroxo.rj.gov.br"
            required
            disabled={!isSupabaseReady || isSubmitting}
          />
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-bold text-[#10213a]">Senha</span>
        <span className="mt-2 flex min-h-12 items-center gap-2 rounded-lg border border-[#dbe5f1] bg-white px-3">
          <LockKeyhole className="size-5 text-[#074fb8]" aria-hidden="true" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border-0 bg-transparent text-sm outline-none"
            placeholder="Digite sua senha"
            required
            disabled={!isSupabaseReady || isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="grid size-9 place-items-center rounded-lg text-[#60708a] hover:bg-blue-50 hover:text-[#074fb8]"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            disabled={!isSupabaseReady || isSubmitting}
          >
            <Eye className="size-5" aria-hidden="true" />
          </button>
        </span>
      </label>

      {message ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!isSupabaseReady || isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#074fb8] px-5 py-3 text-sm font-bold text-white hover:bg-[#063f93] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {isSubmitting ? "Entrando..." : "Entrar na área restrita"}
      </button>
    </form>
  );
}
