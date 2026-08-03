import type { ReactNode } from "react";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

type MetricTone = "neutral" | "info" | "success" | "warning" | "danger";

type MetricCardProps = {
  className?: string;
  description?: ReactNode;
  icon?: AppIconName;
  label: ReactNode;
  tone?: MetricTone;
  value: ReactNode;
};

const tones: Record<MetricTone, string> = {
  danger:
    "border-red-100 bg-[linear-gradient(145deg,#ffffff_0%,#fff7f7_100%)] text-red-800",
  info: "border-blue-100 bg-[linear-gradient(145deg,#ffffff_0%,#f5f9ff_100%)] text-blue-800",
  neutral:
    "border-slate-200 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] text-blue-950",
  success:
    "border-emerald-100 bg-[linear-gradient(145deg,#ffffff_0%,#ecfdf3_100%)] text-emerald-800",
  warning:
    "border-amber-100 bg-[linear-gradient(145deg,#ffffff_0%,#fffaeb_100%)] text-amber-800",
};

export function MetricCard({
  className,
  description,
  icon,
  label,
  tone = "neutral",
  value,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "interactive-card relative overflow-hidden rounded-[var(--radius-xl)] border p-4 shadow-[var(--shadow-card)]",
        tones[tone],
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-slate-600">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold leading-none text-blue-950">
            {value}
          </p>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {icon ? (
          <span className="icon-surface inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]">
            <AppIcon name={icon} size="md" />
          </span>
        ) : null}
      </div>
      <span
        className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-white/52 blur-[1px]"
        aria-hidden="true"
      />
    </article>
  );
}
