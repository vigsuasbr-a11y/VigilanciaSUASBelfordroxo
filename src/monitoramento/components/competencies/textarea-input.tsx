"use client";

import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

export function TextareaInput({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-[10px] border border-blue-100 bg-white px-3 py-2.5 text-sm leading-6 shadow-sm transition placeholder:text-slate-400 hover:border-blue-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
        className,
      )}
      {...props}
    />
  );
}
