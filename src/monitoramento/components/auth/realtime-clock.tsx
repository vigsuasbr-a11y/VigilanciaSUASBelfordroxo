"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

type RealtimeClockProps = {
  className?: string;
  compact?: boolean;
};

const TIME_ZONE = "America/Sao_Paulo";

export function RealtimeClock({
  className,
  compact = false,
}: RealtimeClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => setNow(new Date());
    const start = () => {
      tick();
      timer = setInterval(tick, 1000);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }

      if (!timer) {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const formatted = useMemo(() => {
    if (!now) {
      return {
        date: "Carregando data",
        time: "--:--:--",
      };
    }

    return {
      date: capitalizeFirst(
        new Intl.DateTimeFormat("pt-BR", {
          dateStyle: compact ? "medium" : "full",
          timeZone: TIME_ZONE,
        }).format(now),
      ),
      time: new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: TIME_ZONE,
      }).format(now),
    };
  }, [compact, now]);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 text-sm text-white/82",
        className,
      )}
      aria-live="polite"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <CalendarDays
          className="h-4 w-4 shrink-0 text-cyan-200"
          aria-hidden="true"
        />
        <span className="truncate">{formatted.date}</span>
      </span>
      <span className="inline-flex items-center gap-2 font-semibold text-white">
        <Clock3 className="h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" />
        {formatted.time}
      </span>
    </div>
  );
}

function capitalizeFirst(value: string) {
  return value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1);
}
