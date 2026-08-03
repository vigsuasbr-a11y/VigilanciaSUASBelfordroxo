"use client";

import { AlertTriangle, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { type KeyboardEvent, type RefObject, useState } from "react";

import { cn } from "@/monitoramento/lib/utils/cn";

type PasswordFieldProps = {
  disabled?: boolean;
  error?: string;
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
};

export function PasswordField({
  disabled,
  error,
  inputRef,
  onChange,
  value,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  function handleKeyboard(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"));
  }

  return (
    <label className="block text-sm font-semibold text-blue-950">
      Senha
      <span
        className={cn(
          "mt-2 flex h-14 items-center gap-3 rounded-[14px] border bg-white px-4 text-slate-400 shadow-[0_7px_20px_rgba(29,66,112,0.04)] transition duration-200 focus-within:border-blue-500 focus-within:bg-blue-50/20 focus-within:text-blue-600 focus-within:ring-4 focus-within:ring-blue-100 sm:h-[58px] [@media(max-height:820px)]:h-11",
          error
            ? "border-red-300 text-red-500 focus-within:border-red-500 focus-within:ring-red-100"
            : "border-[#d8e2ef]",
          disabled ? "bg-slate-50 opacity-80" : "",
        )}
      >
        <LockKeyhole className="h-5 w-5 shrink-0" aria-hidden="true" />
        <input
          aria-describedby="password-error"
          aria-invalid={Boolean(error)}
          autoComplete="current-password"
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 focus-visible:outline-none disabled:cursor-not-allowed"
          disabled={disabled}
          maxLength={256}
          name="password"
          onBlur={() => setCapsLock(false)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyboard}
          onKeyUp={handleKeyboard}
          placeholder="Digite sua senha"
          ref={inputRef}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setVisible((current) => !current);
            inputRef.current?.focus({ preventScroll: true });
          }}
          type="button"
        >
          {visible ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </span>
      <span
        className={cn(
          "mt-1 flex min-h-5 items-center gap-1.5 text-xs font-bold",
          error ? "text-red-600" : "text-amber-700",
        )}
        id="password-error"
        aria-live="polite"
      >
        {error ? (
          error
        ) : capsLock ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Caps Lock ativado
          </>
        ) : (
          ""
        )}
      </span>
    </label>
  );
}
