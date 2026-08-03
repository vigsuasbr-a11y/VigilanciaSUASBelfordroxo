import type { ReactNode } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
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

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition duration-200",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
