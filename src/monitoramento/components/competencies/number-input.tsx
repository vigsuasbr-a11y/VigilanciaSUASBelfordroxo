"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

export function NumberInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[10px] border border-blue-100 bg-white px-3 text-sm shadow-sm transition placeholder:text-slate-400 hover:border-blue-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
        className,
      )}
      inputMode="decimal"
      {...props}
    />
  );
}
