"use client";

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  type MaskKind,
  maskValue,
  validateFieldValue,
} from "@/lib/forms/masks";

type ValidatedFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "name" | "required"
> & {
  defaultValue?: string | null;
  fieldClassName?: string;
  label: string;
  mask?: MaskKind;
  matchLabel?: string;
  matchName?: string;
  minLength?: number;
  name: string;
  noFuture?: boolean;
  required?: boolean;
};

export function ValidatedField({
  defaultValue,
  fieldClassName,
  id,
  label,
  mask = "text",
  matchLabel,
  matchName,
  minLength,
  name,
  noFuture,
  onBlur,
  onChange,
  required,
  type,
  ...inputProps
}: ValidatedFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(() => maskValue(mask, defaultValue ?? ""));
  const [touched, setTouched] = useState(false);
  const [matchValue, setMatchValue] = useState("");

  useEffect(() => {
    if (!matchName || !inputRef.current?.form) return;

    const form = inputRef.current.form;
    const target = form.elements.namedItem(matchName);

    if (!(target instanceof HTMLInputElement)) return;

    const updateMatchValue = () => setMatchValue(target.value);
    updateMatchValue();
    target.addEventListener("input", updateMatchValue);

    return () => target.removeEventListener("input", updateMatchValue);
  }, [matchName]);

  const validation = useMemo(() => {
    const result = validateFieldValue(mask, value, {
      label,
      minLength,
      noFuture,
      required,
    });

    if (
      result.isValid &&
      matchName &&
      value &&
      matchValue &&
      value !== matchValue
    ) {
      return {
        isValid: false,
        message: `${label} deve ser igual a ${matchLabel ?? "o campo anterior"}.`,
      };
    }

    return result;
  }, [label, mask, matchLabel, matchName, matchValue, minLength, noFuture, required, value]);

  const shouldShowState = touched || Boolean(value);
  const showInvalid = shouldShowState && !validation.isValid;
  const showValid = shouldShowState && validation.isValid && Boolean(value);
  const inputType = type ?? (mask === "email" ? "email" : "text");
  const inputMode = inputProps.inputMode ?? inputModeForMask(mask);

  useEffect(() => {
    inputRef.current?.setCustomValidity(validation.message ?? "");
  }, [validation.message]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const maskedValue = maskValue(mask, event.target.value);
    setValue(maskedValue);

    if (onChange) {
      event.target.value = maskedValue;
      onChange(event);
    }
  }

  return (
    <label
      className={[
        "validated-field",
        fieldClassName ?? "",
        showValid ? "is-valid" : "",
        showInvalid ? "is-invalid" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-validation-state={showInvalid ? "invalid" : showValid ? "valid" : "neutral"}
    >
      <span className="validated-label-row">
        <span>
          {label}
          {required ? (
            <span className="validated-required" aria-hidden="true">
              *
            </span>
          ) : null}
        </span>
      </span>
      <span className="validated-control">
        <input
          {...inputProps}
          ref={inputRef}
          aria-describedby={showInvalid ? messageId : undefined}
          aria-invalid={showInvalid ? true : undefined}
          autoComplete={inputProps.autoComplete}
          id={inputId}
          inputMode={inputMode}
          minLength={minLength}
          name={name}
          onBlur={(event) => {
            setTouched(true);
            onBlur?.(event);
          }}
          onChange={handleChange}
          onInvalid={() => setTouched(true)}
          required={required}
          type={inputType}
          value={value}
        />
        {showValid ? (
          <CheckCircle2 className="validated-status-icon valid" aria-hidden="true" />
        ) : null}
        {showInvalid ? (
          <AlertCircle className="validated-status-icon invalid" aria-hidden="true" />
        ) : null}
      </span>
      <span className="validated-message" id={messageId} role={showInvalid ? "alert" : undefined}>
        {showInvalid ? validation.message : ""}
      </span>
    </label>
  );
}

function inputModeForMask(
  mask: MaskKind,
): InputHTMLAttributes<HTMLInputElement>["inputMode"] {
  switch (mask) {
    case "cep":
    case "cnpj":
    case "cpf":
    case "date":
    case "nis":
    case "percentage":
    case "pisPasep":
    case "rg":
    case "time":
      return "numeric";
    case "phone":
      return "tel";
    case "email":
      return "email";
    default:
      return undefined;
  }
}
