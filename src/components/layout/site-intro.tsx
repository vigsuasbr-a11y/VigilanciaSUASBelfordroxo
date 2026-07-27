"use client";

import { useEffect, useRef, useState } from "react";
import { SkipForward, X } from "lucide-react";

const INTRO_STORAGE_KEY = "portal-vigilancia-intro-seen";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const LEAVE_ANIMATION_MS = 360;

type IntroState = "checking" | "visible" | "leaving" | "hidden";

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function SiteIntro() {
  const [introState, setIntroState] = useState<IntroState>("checking");
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const hasReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const storage = getSessionStorage();
    const shouldForceIntro = new URLSearchParams(window.location.search).get("intro") === "1";
    const hasSeenIntro = !shouldForceIntro && storage?.getItem(INTRO_STORAGE_KEY) === "true";

    if (shouldForceIntro) {
      storage?.removeItem(INTRO_STORAGE_KEY);
    }

    if (hasReducedMotion || hasSeenIntro) {
      setIntroState("hidden");
      return;
    }

    setIntroState("visible");
    const focusTimer = window.setTimeout(() => skipButtonRef.current?.focus(), 180);

    return () => window.clearTimeout(focusTimer);
  }, []);

  useEffect(() => {
    const isActive = introState === "visible" || introState === "leaving";
    document.documentElement.classList.toggle("site-intro-active", isActive);

    if (introState === "visible") {
      void videoRef.current?.play().catch(() => undefined);
    }

    return () => {
      document.documentElement.classList.remove("site-intro-active");
    };
  }, [introState]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function finishIntro() {
    if (introState === "leaving" || introState === "hidden") {
      return;
    }

    getSessionStorage()?.setItem(INTRO_STORAGE_KEY, "true");
    setIntroState("leaving");
    closeTimerRef.current = window.setTimeout(() => {
      setIntroState("hidden");
      window.dispatchEvent(new Event("portal-vigilancia:intro-finished"));
    }, LEAVE_ANIMATION_MS);
  }

  if (introState === "checking" || introState === "hidden") {
    return null;
  }

  return (
    <section
      aria-label="Intro do Portal da Vigilância Socioassistencial"
      aria-modal="true"
      className={`site-intro fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#031b45] text-white ${
        introState === "leaving" ? "site-intro-leaving" : ""
      }`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          finishIntro();
        }
      }}
      role="dialog"
    >
      <video
        ref={videoRef}
        aria-label="Vídeo de abertura do Portal da Vigilância Socioassistencial"
        autoPlay
        className="absolute inset-0 size-full object-cover"
        muted
        onCanPlay={() => setIsReady(true)}
        onEnded={finishIntro}
        onError={() => window.setTimeout(finishIntro, 800)}
        playsInline
        preload="auto"
        src="/videos/video-suas-intro.mp4"
      />

      <div className="absolute inset-0 bg-gradient-to-br from-[#031b45]/55 via-[#06285f]/20 to-[#031b45]/70" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#031b45] to-transparent" />

      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[min(620px,100vh)] w-full max-w-7xl flex-col justify-end px-5 pb-8 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <div className="site-intro-kicker inline-flex items-center rounded-full border border-cyan-200/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur">
            Portal da Vigilância Socioassistencial
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
            Informação que fortalece a gestão do SUAS
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-blue-50/88 sm:text-lg">
            {isReady ? "Preparando a experiência do portal." : "Carregando abertura institucional."}
          </p>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-3 sm:right-6 sm:top-6">
        <button
          ref={skipButtonRef}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/24 bg-white/12 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur hover:-translate-y-0.5 hover:bg-white/18"
          onClick={finishIntro}
          type="button"
        >
          <SkipForward className="size-4" aria-hidden="true" />
          Pular intro
        </button>
        <button
          aria-label="Fechar intro"
          className="inline-grid size-11 place-items-center rounded-full border border-white/24 bg-white/12 text-white shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur hover:-translate-y-0.5 hover:bg-white/18"
          onClick={finishIntro}
          type="button"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
