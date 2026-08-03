import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

export type StatusBadgeTone =
  "neutral" | "info" | "success" | "warning" | "danger";

type StatusBadgeProps = {
  className?: string;
  icon?: AppIconName;
  tone?: StatusBadgeTone;
  children: string;
};

const tones: Record<StatusBadgeTone, string> = {
  danger:
    "border-red-200 bg-[linear-gradient(135deg,#fff7f7,#fef3f2)] text-red-700",
  info: "border-blue-200 bg-[linear-gradient(135deg,#f5f9ff,#eff8ff)] text-blue-800",
  neutral:
    "border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc)] text-slate-700",
  success:
    "border-emerald-200 bg-[linear-gradient(135deg,#f7fffb,#ecfdf3)] text-emerald-700",
  warning:
    "border-amber-200 bg-[linear-gradient(135deg,#fffdf7,#fffaeb)] text-amber-800",
};

export function StatusBadge({
  children,
  className,
  icon,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition duration-200",
        tones[tone],
        className,
      )}
    >
      {icon ? <AppIcon name={icon} size="xs" /> : null}
      {children}
    </span>
  );
}
