import type { ReactNode } from "react";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

type SectionCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  icon?: AppIconName;
  title?: ReactNode;
};

export function SectionCard({
  actions,
  children,
  className,
  description,
  icon,
  title,
}: SectionCardProps) {
  const hasHeader = title || description || actions || icon;

  return (
    <section
      className={cn(
        "surface-card interactive-card rounded-[var(--radius-xl)]",
        className,
      )}
    >
      {hasHeader ? (
        <div className="relative z-10 flex flex-col justify-between gap-3 border-b border-blue-100/80 bg-blue-50/28 px-4 py-3.5 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <span className="icon-surface inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-blue-800">
                <AppIcon name={icon} size="sm" />
              </span>
            ) : null}
            <div className="min-w-0">
              {title ? (
                <h2 className="text-base font-semibold leading-snug text-blue-950">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="relative z-10 p-4">{children}</div>
    </section>
  );
}
