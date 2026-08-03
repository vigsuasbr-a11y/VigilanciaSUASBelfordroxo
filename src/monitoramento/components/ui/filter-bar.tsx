import type { ReactNode } from "react";

import { AppIcon } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

type FilterBarProps = {
  actions?: ReactNode;
  children: ReactNode;
  chips?: ReactNode;
  className?: string;
  title?: string;
};

export function FilterBar({
  actions,
  children,
  chips,
  className,
  title = "Filtros",
}: FilterBarProps) {
  return (
    <section
      className={cn("surface-card rounded-[var(--radius-xl)] p-4", className)}
    >
      <div className="relative z-10 mb-4 flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-blue-950">
          <span className="icon-surface inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-blue-800">
            <AppIcon name="filter" size="sm" />
          </span>
          {title}
        </div>
        {actions ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div className="relative z-10 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-6 [&>*]:min-w-0">
        {children}
      </div>
      {chips ? (
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2 border-t border-blue-100 pt-3">
          {chips}
        </div>
      ) : null}
    </section>
  );
}
