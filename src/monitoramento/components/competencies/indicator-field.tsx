"use client";

import { HelpCircle } from "lucide-react";

import { NumberInput } from "@/monitoramento/components/competencies/number-input";
import { TextareaInput } from "@/monitoramento/components/competencies/textarea-input";
import { cn } from "@/monitoramento/lib/utils/cn";
import type { FieldDraft } from "@/monitoramento/features/competencies/wizard/types";
import {
  parseDraftValue,
  valueDisplayForDraft,
} from "@/monitoramento/features/competencies/wizard/utils";
import type { IndicatorDataType, ValueStatus } from "@/monitoramento/types/domain";

const statusOptions: Array<{ value: ValueStatus; label: string }> = [
  { value: "informed", label: "Informado" },
  { value: "not_informed", label: "Não informado" },
  { value: "not_applicable", label: "N/A" },
];

export function IndicatorField({
  id,
  label,
  dataType,
  unitOfMeasure,
  allowsNotApplicable,
  required,
  description,
  source,
  technicalCode,
  draft,
  disabled,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  dataType: IndicatorDataType;
  unitOfMeasure?: string | null;
  allowsNotApplicable: boolean;
  required: boolean;
  description?: string | null;
  source?: string | null;
  technicalCode?: string | null;
  draft: FieldDraft;
  disabled: boolean;
  onChange: (draft: FieldDraft) => void;
  onBlur: () => void;
}) {
  const helpText = [
    description,
    source ? `Origem: ${source}` : null,
    technicalCode ? `Código técnico: ${technicalCode}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const inputDisabled = disabled || draft.valueStatus === "not_applicable";
  const fieldId = `field-${id}`;
  const statusId = `status-${id}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <label
          className="text-sm font-bold leading-6 text-slate-900"
          htmlFor={fieldId}
        >
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </label>
        <div className="flex items-center gap-2">
          {helpText ? (
            <button
              aria-label={`Ajuda: ${label}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-blue-100 bg-white text-muted-foreground shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-primary"
              title={helpText}
              type="button"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <select
            aria-label={`Status de preenchimento de ${label}`}
            className="h-9 rounded-[10px] border border-blue-100 bg-white px-2.5 text-xs font-bold text-blue-900 shadow-sm transition hover:border-blue-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
            disabled={disabled}
            id={statusId}
            onBlur={onBlur}
            onChange={(event) =>
              onChange(
                parseDraftValue(
                  dataType,
                  valueDisplayForDraft(dataType, draft),
                  event.target.value as ValueStatus,
                ),
              )
            }
            value={draft.valueStatus}
          >
            {statusOptions.map((option) => (
              <option
                disabled={
                  option.value === "not_applicable" && !allowsNotApplicable
                }
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {renderInput({
        id: fieldId,
        dataType,
        unitOfMeasure,
        draft,
        disabled: inputDisabled,
        readOnlyReason: disabled
          ? "Campo bloqueado para edição"
          : draft.valueStatus === "not_applicable"
            ? "Campo marcado como N/A"
            : null,
        onBlur,
        onChange,
      })}
    </div>
  );
}

function renderInput({
  id,
  dataType,
  unitOfMeasure,
  draft,
  disabled,
  readOnlyReason,
  onChange,
  onBlur,
}: {
  id: string;
  dataType: IndicatorDataType;
  unitOfMeasure?: string | null;
  draft: FieldDraft;
  disabled: boolean;
  readOnlyReason?: string | null;
  onChange: (draft: FieldDraft) => void;
  onBlur: () => void;
}) {
  const needsFirstAnswer = draft.valueStatus === "not_informed" && !disabled;

  if (dataType === "boolean") {
    const checked =
      draft.valueStatus === "informed" && draft.numericValue === 1;

    return (
      <label
        className={cn(
          "inline-flex min-h-12 items-center gap-3 rounded-[10px] border border-blue-100 bg-white px-3 text-sm shadow-sm",
          disabled && "text-muted-foreground",
        )}
      >
        <input
          checked={checked}
          className="h-5 w-10 rounded-full accent-primary"
          disabled={disabled}
          id={id}
          onBlur={onBlur}
          onChange={(event) =>
            onChange({
              valueStatus: "informed",
              numericValue: event.target.checked ? 1 : 0,
              textValue: null,
            })
          }
          role="switch"
          type="checkbox"
        />
        {checked ? "Sim" : needsFirstAnswer ? "Clique para informar" : "Não"}
      </label>
    );
  }

  if (dataType === "short_text" || dataType === "long_text") {
    return (
      <TextareaInput
        disabled={disabled}
        id={id}
        maxLength={dataType === "short_text" ? 500 : 5000}
        onBlur={onBlur}
        onChange={(event) =>
          onChange(parseDraftValue(dataType, event.target.value, "informed"))
        }
        placeholder={
          disabled
            ? (readOnlyReason ?? "Campo bloqueado")
            : needsFirstAnswer
              ? "Digite para marcar como informado"
              : "Digite o texto"
        }
        value={valueDisplayForDraft(dataType, draft)}
      />
    );
  }

  return (
    <div className="relative">
      <NumberInput
        className={unitOfMeasure ? "pr-24" : undefined}
        disabled={disabled}
        id={id}
        onBlur={onBlur}
        onChange={(event) =>
          onChange(parseDraftValue(dataType, event.target.value, "informed"))
        }
        placeholder={
          disabled
            ? (readOnlyReason ?? "Campo bloqueado")
            : dataType === "percentage"
              ? "0 a 100"
              : needsFirstAnswer
                ? "Digite para marcar como informado"
                : "0"
        }
        type="text"
        value={valueDisplayForDraft(dataType, draft)}
      />
      {unitOfMeasure ? (
        <span className="pointer-events-none absolute right-3 top-1/2 max-w-28 -translate-y-1/2 truncate rounded-md bg-white/90 px-1 text-xs font-medium text-muted-foreground">
          {dataType === "percentage" ? "%" : unitOfMeasure}
        </span>
      ) : null}
    </div>
  );
}
