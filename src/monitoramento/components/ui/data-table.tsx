import type { ReactNode } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

type DataTableProps = {
  children: ReactNode;
  className?: string;
  empty?: ReactNode;
  minWidth?: string;
};

export function DataTable({
  children,
  className,
  empty,
  minWidth = "min-w-[760px]",
}: DataTableProps) {
  return (
    <div
      className={cn(
        "surface-card min-w-0 rounded-[var(--radius-xl)]",
        className,
      )}
    >
      <div className="monitoramento-table-scroll relative z-10">
        <table className={cn("w-full text-left text-sm", minWidth)}>
          {children}
        </table>
      </div>
      {empty}
    </div>
  );
}

export const dataTableHeaderClass =
  "sticky top-0 z-10 border-b border-blue-100/80 bg-slate-50/95 text-xs font-medium uppercase text-slate-500 backdrop-blur";

export const dataTableRowClass =
  "border-b border-blue-50 transition duration-200 odd:bg-white/55 even:bg-slate-50/30 hover:bg-blue-50/55 last:border-b-0";

export const dataTableCellClass = "px-4 py-3.5 align-middle leading-6";
