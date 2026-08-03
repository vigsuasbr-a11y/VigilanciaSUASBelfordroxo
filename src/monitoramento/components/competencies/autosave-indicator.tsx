import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

import { cn } from "@/monitoramento/lib/utils/cn";
import type { SaveState } from "@/monitoramento/features/competencies/wizard/types";

const stateConfig: Record<
  SaveState,
  { label: string; className: string; icon: typeof Save }
> = {
  idle: {
    label: "Sem alterações",
    className: "text-muted-foreground",
    icon: Save,
  },
  dirty: { label: "Editado", className: "text-amber-700", icon: Save },
  saving: { label: "Salvando", className: "text-blue-800", icon: Loader2 },
  saved: { label: "Salvo", className: "text-emerald-700", icon: CheckCircle2 },
  error: {
    label: "Erro ao salvar",
    className: "text-red-700",
    icon: AlertCircle,
  },
};

export function AutosaveIndicator({
  state,
  savedAt,
}: {
  state: SaveState;
  savedAt?: string | null;
}) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        config.className,
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", state === "saving" && "animate-spin")}
        aria-hidden="true"
      />
      {config.label}
      {state === "saved" && savedAt ? (
        <span className="font-normal text-muted-foreground">às {savedAt}</span>
      ) : null}
    </span>
  );
}
