import type { ReactNode } from "react";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description: ReactNode;
  icon?: AppIconName;
  tone?: "info" | "neutral" | "success" | "warning";
  title: ReactNode;
};

const toneClasses = {
  info: {
    card: "border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f6faff_100%)]",
    icon: "text-blue-800",
  },
  neutral: {
    card: "border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)]",
    icon: "text-slate-700",
  },
  success: {
    card: "border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#ecfdf5_100%)]",
    icon: "text-emerald-700",
  },
  warning: {
    card: "border-amber-100 bg-[linear-gradient(135deg,#ffffff_0%,#fffbeb_100%)]",
    icon: "text-amber-700",
  },
} as const;

export function EmptyState({
  action,
  className,
  description,
  icon = "info",
  tone = "info",
  title,
}: EmptyStateProps) {
  const toneStyle = toneClasses[tone];

  return (
    <div
      className={cn(
        "surface-card flex min-h-44 flex-col items-center justify-center rounded-[var(--radius-xl)] border px-5 py-8 text-center shadow-[var(--shadow-card)]",
        toneStyle.card,
        className,
      )}
    >
      <span
        className={cn(
          "icon-surface relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-[14px]",
          toneStyle.icon,
        )}
      >
        <AppIcon name={icon} size="lg" />
      </span>
      <h2 className="relative z-10 mt-4 text-base font-semibold text-blue-950">
        {title}
      </h2>
      <p className="relative z-10 mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="relative z-10 mt-4">{action}</div> : null}
    </div>
  );
}
