import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "link";

const variants: Record<ButtonVariant, string> = {
  danger:
    "bg-[linear-gradient(135deg,#f04438,#c01048)] text-white shadow-[0_14px_26px_rgba(225,29,72,0.18)] hover:shadow-[0_18px_34px_rgba(225,29,72,0.22)]",
  ghost: "text-muted-foreground hover:bg-blue-50/80 hover:text-blue-800",
  link: "min-h-0 px-0 py-0 text-blue-700 hover:text-blue-900 hover:underline",
  outline:
    "border border-blue-200 bg-white/92 text-blue-800 shadow-sm hover:border-blue-300 hover:bg-blue-50/82",
  primary:
    "bg-[linear-gradient(135deg,#2585ff,#075fdc)] text-primary-foreground shadow-[0_14px_28px_rgba(0,91,219,0.22)] hover:shadow-[0_18px_36px_rgba(0,91,219,0.27)]",
  secondary:
    "border border-blue-200 bg-white/92 text-blue-800 shadow-sm hover:border-blue-300 hover:bg-blue-50/82",
  success:
    "bg-[linear-gradient(135deg,#12b76a,#079455)] text-white shadow-[0_14px_26px_rgba(7,148,85,0.18)] hover:shadow-[0_18px_34px_rgba(7,148,85,0.23)]",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-[12px] border border-transparent px-4 py-2 text-center text-sm font-semibold leading-5 transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
