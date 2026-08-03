import { Loader2 } from "lucide-react";

import { cn } from "@/monitoramento/lib/utils/cn";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({
  className,
  label = "Carregando",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      aria-label={label}
      className={cn("h-4 w-4 animate-spin", className)}
      role="status"
    />
  );
}
