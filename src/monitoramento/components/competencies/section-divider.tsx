import { BarChart3 } from "lucide-react";

export function SectionDivider({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="surface-card flex flex-col gap-3 rounded-[16px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="icon-surface flex h-9 w-9 items-center justify-center rounded-[12px] text-blue-700">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-normal text-blue-900">
          {title}
        </h3>
      </div>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
