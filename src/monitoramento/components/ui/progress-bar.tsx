import { cn } from "@/monitoramento/lib/utils/cn";

type ProgressBarProps = {
  className?: string;
  label?: string;
  value: number;
};

export function ProgressBar({ className, label, value }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(normalized)}%</span>
        </div>
      ) : null}
      <div
        className="h-2 overflow-hidden rounded-full bg-blue-50 shadow-inner"
        role="progressbar"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(normalized)}
      >
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,#167be7,#12b76a)] shadow-[0_0_14px_rgba(22,123,231,0.28)] transition-[width] duration-300 ease-out"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}
