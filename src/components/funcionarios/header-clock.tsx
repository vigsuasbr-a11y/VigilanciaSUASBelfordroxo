"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, CloudSun, Moon, Sun } from "lucide-react";

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const compactDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const compactTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function HeaderClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const clock = useMemo(() => {
    if (!now) return null;
    return buildClockViewModel(now);
  }, [now]);

  if (!clock) {
    return (
      <div className="header-clock is-loading" aria-label="Carregando data e hora local">
        <span className="header-clock-icon" aria-hidden="true">
          <CalendarDays size={18} />
        </span>
        <span className="header-clock-copy">
          <small>Horário local</small>
          <strong>Carregando</strong>
          <span className="header-clock-time">--:--</span>
        </span>
      </div>
    );
  }

  const GreetingIcon = clock.icon;

  return (
    <div className="header-clock" aria-label="Data e hora local">
      <span className="header-clock-icon" aria-hidden="true">
        <GreetingIcon size={17} />
      </span>
      <time
        className="header-clock-copy"
        dateTime={clock.dateTime}
        aria-label={clock.accessibleLabel}
      >
        <small>{clock.greeting}</small>
        <strong>
          <CalendarDays className="header-clock-date-icon" size={13} aria-hidden="true" />
          <span className="header-clock-weekday">{clock.weekday}</span>
          <span className="header-clock-date">, {clock.date}</span>
          <span className="header-clock-compact-date">{clock.compactDate}</span>
        </strong>
        <span className="header-clock-time">
          <Clock3 size={13} aria-hidden="true" />
          <span className="header-clock-full-time">{clock.time}</span>
          <span className="header-clock-compact-time">{clock.compactTime}</span>
        </span>
      </time>
    </div>
  );
}

export function getGreetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

function buildClockViewModel(date: Date) {
  const greeting = getGreetingForHour(date.getHours());
  const weekday = capitalizeFirst(weekdayFormatter.format(date));
  const fullDate = dateFormatter.format(date);
  const time = timeFormatter.format(date);
  const compactDate = compactDateFormatter.format(date);
  const compactTime = compactTimeFormatter.format(date);

  return {
    accessibleLabel: `${greeting}. ${weekday}, ${fullDate}, ${time}`,
    compactDate,
    compactTime,
    date: fullDate,
    dateTime: toLocalIsoString(date),
    greeting,
    icon: getGreetingIcon(date.getHours()),
    time,
    weekday,
  };
}

function getGreetingIcon(hour: number) {
  if (hour >= 5 && hour < 12) return Sun;
  if (hour >= 12 && hour < 18) return CloudSun;
  return Moon;
}

function capitalizeFirst(value: string) {
  return value ? value.charAt(0).toLocaleUpperCase("pt-BR") + value.slice(1) : value;
}

function toLocalIsoString(date: Date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const offsetRemainder = String(absOffset % 60).padStart(2, "0");
  const localDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const localTime = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join(":");

  return `${localDate}T${localTime}${sign}${offsetHours}:${offsetRemainder}`;
}
