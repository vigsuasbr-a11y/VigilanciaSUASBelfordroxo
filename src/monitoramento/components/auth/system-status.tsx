"use client";

import { CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

type SystemStatusState =
  "checking" | "operational" | "unavailable" | "unstable";

const labels: Record<SystemStatusState, string> = {
  checking: "Verificando sistema...",
  operational: "Sistema operacional",
  unavailable: "Sistema temporariamente indisponível",
  unstable: "Conexão instável",
};

const styles: Record<SystemStatusState, string> = {
  checking: "border-blue-100 bg-blue-50 text-blue-800",
  operational: "border-emerald-200 bg-emerald-50 text-emerald-800",
  unavailable: "border-red-100 bg-red-50 text-red-800",
  unstable: "border-amber-100 bg-amber-50 text-amber-800",
};

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatusState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
        });

        if (!cancelled) {
          setStatus(response.ok ? "operational" : "unavailable");
        }
      } catch {
        if (!cancelled) {
          setStatus(navigator.onLine ? "unstable" : "unavailable");
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  const Icon =
    status === "checking"
      ? Loader2
      : status === "operational"
        ? CheckCircle2
        : WifiOff;

  return (
    <div
      className={cn(
        "mx-auto mt-4 inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold [@media(max-height:820px)]:mt-2 [@media(max-height:820px)]:min-h-7",
        styles[status],
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn("h-4 w-4", status === "checking" ? "animate-spin" : "")}
        aria-hidden="true"
      />
      {labels[status]}
    </div>
  );
}
