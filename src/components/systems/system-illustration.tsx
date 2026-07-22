import { cn } from "@/lib/utils/cn";
import type { SystemColor } from "@/types/domain";

export function SystemIllustration({ color }: { color: SystemColor }) {
  const isGreen = color === "green";

  return (
    <div className="hidden min-h-36 flex-1 items-center justify-end md:flex" aria-hidden="true">
      <div className="relative h-32 w-48">
        <div
          className={cn(
            "absolute inset-x-4 top-2 h-24 rounded-lg border-4 bg-white shadow-lg",
            isGreen ? "border-[#007d67]" : "border-[#063e91]",
          )}
        >
          <div className={cn("h-full rounded-sm p-3", isGreen ? "bg-emerald-50" : "bg-blue-50")}>
            <div className="mb-3 h-2 w-24 rounded bg-slate-200" />
            <div className="grid grid-cols-[1fr_0.7fr] gap-3">
              <div className="space-y-2">
                <div className={cn("h-2 rounded", isGreen ? "bg-[#00a67e]" : "bg-[#0a84ff]")} />
                <div className="h-2 w-4/5 rounded bg-slate-200" />
                <div className="h-2 w-3/5 rounded bg-slate-200" />
                <div className={cn("mt-3 h-8 rounded", isGreen ? "bg-emerald-100" : "bg-blue-100")} />
              </div>
              <div className="grid place-items-center">
                <div
                  className={cn(
                    "size-14 rounded-full border-[12px]",
                    isGreen
                      ? "border-[#00a67e] border-l-[#074fb8]"
                      : "border-[#0a84ff] border-l-[#06285f]",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 h-5 w-12 -translate-x-1/2 bg-slate-300" />
        <div className="absolute bottom-0 left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}
