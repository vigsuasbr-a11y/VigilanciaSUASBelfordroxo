"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      closeButton
      duration={4600}
      expand={false}
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "font-sans rounded-[14px] border border-blue-100 shadow-[var(--shadow-elevated)]",
          title: "text-sm font-semibold",
          description: "text-sm leading-5",
        },
      }}
    />
  );
}
