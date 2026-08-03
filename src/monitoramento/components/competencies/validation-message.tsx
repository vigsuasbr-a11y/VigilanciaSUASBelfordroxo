import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import { cn } from "@/monitoramento/lib/utils/cn";
import type { FieldMessage } from "@/monitoramento/features/competencies/wizard/types";

const severityConfig = {
  error: {
    className: "border-red-200 bg-red-50 text-red-800",
    icon: AlertCircle,
  },
  warning: {
    className: "border-amber-200 bg-amber-50 text-amber-900",
    icon: AlertTriangle,
  },
  information: {
    className: "border-blue-200 bg-blue-50 text-blue-900",
    icon: Info,
  },
} satisfies Record<
  FieldMessage["severity"],
  { className: string; icon: typeof Info }
>;

export function ValidationMessage({ message }: { message: FieldMessage }) {
  const config = severityConfig[message.severity];
  const Icon = config.icon;

  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
        config.className,
      )}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message.message}</span>
    </p>
  );
}
