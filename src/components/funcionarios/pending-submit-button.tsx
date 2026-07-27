"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

type PendingSubmitButtonProps = {
  children: ReactNode;
  className?: string;
  pendingLabel: string;
  disabled?: boolean;
};

export function PendingSubmitButton({
  children,
  className,
  pendingLabel,
  disabled = false,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      className={className}
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <LoaderCircle className="submit-spinner" size={18} aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
