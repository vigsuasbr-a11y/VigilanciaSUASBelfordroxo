"use client";

import Link from "next/link";
import { ArrowRight, Lightbulb, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { projectContent } from "@/content/project";
import { cn } from "@/lib/utils/cn";

const showDelayMs = 1100;
const exitDelayMs = 260;

export function ProjectIntroductionNotice() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

  const markAsSeen = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(projectContent.storageKey, "true");
    } catch {
      // localStorage can be unavailable in restricted browsing modes.
    }
  }, []);

  const closeNotice = useCallback(() => {
    markAsSeen();
    setIsVisible(false);

    if (typeof window !== "undefined") {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }

      exitTimerRef.current = window.setTimeout(() => {
        setShouldRender(false);
      }, exitDelayMs);
    }
  }, [markAsSeen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let hasSeenNotice = false;

    try {
      hasSeenNotice =
        window.localStorage.getItem(projectContent.storageKey) === "true";
    } catch {
      hasSeenNotice = false;
    }

    if (hasSeenNotice) {
      return;
    }

    const showTimer = window.setTimeout(() => {
      setShouldRender(true);
      window.requestAnimationFrame(() => setIsVisible(true));
    }, showDelayMs);

    return () => {
      window.clearTimeout(showTimer);

      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldRender || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeNotice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeNotice, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="project-introduction-title"
      aria-describedby="project-introduction-description"
      className={cn(
        "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-[430px] rounded-2xl border border-[#bcd5f4] bg-white p-4 text-[#10213a] shadow-[0_24px_60px_rgba(6,40,95,0.20)] transition-all duration-300 ease-out sm:left-auto sm:right-6 sm:mx-0 sm:w-[410px]",
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-3 scale-[0.98] opacity-0",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#074fb8]">
          <Lightbulb className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="project-introduction-title"
              className="text-base font-semibold leading-6 text-[#06285f]"
            >
              {projectContent.noticeTitle}
            </h2>
            <button
              type="button"
              onClick={closeNotice}
              className="grid size-8 shrink-0 place-items-center rounded-full border border-[#dbe5f1] bg-[#f5f8fc] text-[#06285f] hover:bg-blue-50"
              aria-label="Fechar aviso sobre o portal"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div
            id="project-introduction-description"
            className="mt-3 space-y-2 text-sm leading-6 text-[#38506f]"
          >
            <p>{projectContent.noticeText}</p>
            <p className="text-xs leading-5 text-[#60708a]">
              {projectContent.noticeComplement}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link
          href="/sobre-o-projeto"
          onClick={markAsSeen}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#074fb8] px-4 text-sm font-semibold text-white hover:bg-[#0a84ff]"
        >
          {projectContent.noticePrimaryAction}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={closeNotice}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cfe0f4] bg-white px-4 text-sm font-semibold text-[#06285f] hover:bg-blue-50"
        >
          {projectContent.noticeSecondaryAction}
        </button>
      </div>
    </aside>
  );
}
