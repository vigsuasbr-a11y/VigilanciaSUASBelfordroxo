import { cn } from "@/monitoramento/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-[var(--radius-md)]", className)}
      aria-hidden="true"
    />
  );
}
