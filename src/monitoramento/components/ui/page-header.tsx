import type { ReactNode } from "react";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

type PageHeaderVariant = "default" | "executive" | "operational";

type PageHeaderProps = {
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  icon?: AppIconName;
  title: string;
  variant?: PageHeaderVariant;
};

const variants: Record<PageHeaderVariant, string> = {
  default:
    "border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#fbfdff_52%,#f6faff_100%)]",
  executive:
    "border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f6faff_50%,#e8f2ff_100%)]",
  operational:
    "border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_56%,#ecfdf3_100%)]",
};

export function PageHeader({
  actions,
  badge,
  className,
  description,
  eyebrow,
  icon,
  title,
  variant = "default",
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "surface-panel rounded-[var(--radius-2xl)] p-5 shadow-[var(--shadow-panel)] sm:p-6",
        variants[variant],
        className,
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {icon ? (
              <span className="icon-surface inline-flex h-11 w-11 items-center justify-center rounded-[13px] text-blue-800">
                <AppIcon name={icon} size="md" />
              </span>
            ) : null}
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {eyebrow}
              </p>
            ) : null}
            {badge}
          </div>
          <h1 className="mt-3 max-w-full text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-blue-950 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:shrink-0 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
