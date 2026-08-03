import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleDot,
  Info,
} from "lucide-react";

import { cn } from "@/monitoramento/lib/utils/cn";
import type { GroupStepState } from "@/monitoramento/features/competencies/wizard/utils";

const stateConfig: Record<
  GroupStepState,
  { label: string; className: string; icon: typeof Circle }
> = {
  empty: {
    label: "Não informado",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: Circle,
  },
  in_progress: {
    label: "Em andamento",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    icon: CircleDot,
  },
  complete: {
    label: "Completo",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  blocked: {
    label: "Erro",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: AlertTriangle,
  },
  warning: {
    label: "Alerta",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Info,
  },
};

export function CompletionBadge({ state }: { state: GroupStepState }) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold",
        config.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
