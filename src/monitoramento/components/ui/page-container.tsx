import type { ReactNode } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  wide?: boolean;
};

export function PageContainer({
  children,
  className,
  wide = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "page-transition mx-auto w-full space-y-6",
        wide ? "max-w-[var(--app-content-max)]" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
