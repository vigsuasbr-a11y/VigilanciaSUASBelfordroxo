import { ChartNoAxesCombined, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PortalSystem } from "@/types/domain";

const icons = {
  users: UsersRound,
  chart: ChartNoAxesCombined,
};

type SystemIconProps = {
  system: Pick<PortalSystem, "iconName" | "color">;
  className?: string;
};

export function SystemIcon({ system, className }: SystemIconProps) {
  const Icon = icons[system.iconName];
  const colorClass =
    system.color === "green"
      ? "bg-[#00a67e] text-white shadow-emerald-200"
      : "bg-[#074fb8] text-white shadow-blue-200";

  return (
    <span className={cn("grid size-16 shrink-0 place-items-center rounded-lg shadow-lg", colorClass, className)}>
      <Icon className="size-8" aria-hidden="true" />
    </span>
  );
}
