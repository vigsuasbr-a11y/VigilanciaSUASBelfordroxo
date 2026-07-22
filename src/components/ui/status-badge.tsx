import { cn } from "@/lib/utils/cn";
import type { SystemStatus } from "@/types/domain";

const statusLabels: Record<SystemStatus, string> = {
  operacional: "Operacional",
  manutencao: "Em manutenção",
  indisponivel: "Indisponível",
  em_desenvolvimento: "Em desenvolvimento",
};

const statusClasses: Record<SystemStatus, string> = {
  operacional: "border-emerald-200 bg-emerald-50 text-emerald-700",
  manutencao: "border-amber-200 bg-amber-50 text-amber-700",
  indisponivel: "border-red-200 bg-red-50 text-red-700",
  em_desenvolvimento: "border-blue-200 bg-blue-50 text-blue-700",
};

export function StatusBadge({ status }: { status: SystemStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold",
        statusClasses[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
