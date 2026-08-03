import type { ButtonHTMLAttributes } from "react";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: AppIconName;
  label: string;
};

export function IconButton({
  className,
  icon,
  label,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        "icon-surface inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-blue-800 transition duration-200 ease-out hover:-translate-y-0.5 hover:text-blue-950 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      title={label}
      type={type}
      {...props}
    >
      <AppIcon name={icon} size="sm" />
    </button>
  );
}
