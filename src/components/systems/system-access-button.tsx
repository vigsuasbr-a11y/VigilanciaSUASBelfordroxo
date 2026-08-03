"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SystemColor, SystemStatus } from "@/types/domain";

type SystemAccessButtonProps = {
  systemSlug: string;
  status: SystemStatus;
  url: string | null;
  color: SystemColor;
  className?: string;
};

const blockedStatusMessage: Partial<Record<SystemStatus, string>> = {
  manutencao: "Sistema em manutenção no momento.",
  indisponivel: "Sistema indisponível no momento.",
  em_desenvolvimento: "Sistema em desenvolvimento.",
};

export function SystemAccessButton({
  systemSlug,
  status,
  url,
  color,
  className,
}: SystemAccessButtonProps) {
  const router = useRouter();
  const [isLogging, setIsLogging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isOperational = status === "operacional";
  const disabled = !url || !isOperational;
  const disabledMessage = !url
    ? "Endereço do sistema ainda não configurado."
    : blockedStatusMessage[status];

  async function handleAccess() {
    if (disabled || !url) {
      setMessage(disabledMessage ?? "Acesso não disponível.");
      return;
    }

    setIsLogging(true);
    setMessage("Registrando tentativa de acesso...");

    const logRequest = fetch("/api/access-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemSlug,
        status,
        success: true,
        metadata: {
          targetConfigured: Boolean(url),
          targetType: url.startsWith("/") ? "internal" : "external",
        },
      }),
      keepalive: true,
    }).catch(() => null);

    if (url.startsWith("/")) {
      router.push(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    await logRequest;
    setIsLogging(false);
    setMessage("Acesso registrado. O sistema pode depender da rede interna.");
  }

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={handleAccess}
        disabled={disabled || isLogging}
        className={cn(
          "inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-center text-sm font-semibold leading-5 text-white shadow-sm transition duration-200 hover:-translate-y-0.5 disabled:hover:translate-y-0",
          "disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none",
          color === "green"
            ? "bg-[#00a67e] shadow-emerald-900/10 hover:bg-[#008b6c] hover:shadow-lg"
            : "bg-[#074fb8] shadow-blue-950/10 hover:bg-[#063f93] hover:shadow-lg",
        )}
      >
        {disabled ? <Lock className="size-4 shrink-0" aria-hidden="true" /> : null}
        {isLogging ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
        ) : null}
        <span className="min-w-0">Acessar sistema</span>
        {!disabled && !isLogging ? (
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        ) : null}
      </button>
      {message || disabledMessage ? (
        <p className="max-w-sm text-xs leading-5 text-[#60708a]">
          {message ?? disabledMessage}
        </p>
      ) : null}
    </div>
  );
}
