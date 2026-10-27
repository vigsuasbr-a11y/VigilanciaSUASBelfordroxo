"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const storageKey = "funcionarios:welcome-shown";
const visibleDuration = 5000;

/** Reinicia apenas a apresentação quando a página de login é exibida. */
export function WelcomeSessionReset() {
  useEffect(() => {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // O acesso ao sistema independe do armazenamento da mensagem.
    }
  }, []);
  return null;
}

export function WelcomeToast({
  nome,
  perfil,
}: {
  nome: string;
  perfil: string;
}) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "leaving">(
    "hidden",
  );
  const [greeting, setGreeting] = useState("");
  const expiry = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exit = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = useRef(0);
  const remaining = useRef(visibleDuration);
  const hovered = useRef(false);
  const focused = useRef(false);

  const dismiss = useCallback(() => {
    if (expiry.current) clearTimeout(expiry.current);
    expiry.current = null;
    if (exit.current) clearTimeout(exit.current);
    setPhase("leaving");
    exit.current = setTimeout(() => setPhase("hidden"), 250);
  }, []);

  const resume = useCallback(() => {
    if (hovered.current || focused.current) return;
    if (expiry.current) clearTimeout(expiry.current);
    deadline.current = Date.now() + remaining.current;
    expiry.current = setTimeout(dismiss, remaining.current);
  }, [dismiss]);

  const pause = useCallback(() => {
    if (!expiry.current) return;
    clearTimeout(expiry.current);
    expiry.current = null;
    remaining.current = Math.max(0, deadline.current - Date.now());
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch {
      return;
    }

    const entry = setTimeout(() => {
      try {
        if (window.sessionStorage.getItem(storageKey)) return;
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        return;
      }
      const hour = Number(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour: "2-digit",
          hourCycle: "h23",
        }).format(new Date()),
      );
      setGreeting(
        hour >= 5 && hour < 12
          ? "Bom dia"
          : hour >= 12 && hour < 18
            ? "Boa tarde"
            : "Boa noite",
      );
      setPhase("visible");
      remaining.current = visibleDuration;
      resume();
    }, 600);

    return () => {
      clearTimeout(entry);
      if (expiry.current) clearTimeout(expiry.current);
      if (exit.current) clearTimeout(exit.current);
    };
  }, [resume]);

  if (phase === "hidden") return null;
  const firstName = nome.trim().split(/\s+/)[0] || "Bem-vindo";

  return (
    <div
      className={`welcome-toast welcome-toast--${phase}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => {
        hovered.current = true;
        if (phase === "visible") pause();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        if (phase === "visible") resume();
      }}
      onFocusCapture={() => {
        focused.current = true;
        if (phase === "visible") pause();
      }}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null))
          return;
        focused.current = false;
        if (phase === "visible") resume();
      }}
    >
      <span className="welcome-toast-crest" aria-hidden="true">
        <Image
          src="/funcionarios/assets/iconebelford-web.png"
          alt=""
          width={36}
          height={36}
        />
      </span>
      <span className="welcome-toast-copy">
        <span className="welcome-toast-greeting">{greeting}</span>
        <strong title={firstName}>{firstName}</strong>
        <span
          className="welcome-toast-profile"
          title={`${perfil} · Sistema de Funcionários`}
        >
          {perfil} · Sistema de Funcionários
        </span>
      </span>
      <button
        type="button"
        className="welcome-toast-close"
        aria-label="Fechar mensagem de boas-vindas"
        onClick={dismiss}
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
