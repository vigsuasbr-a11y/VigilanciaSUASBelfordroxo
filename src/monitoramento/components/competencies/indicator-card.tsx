"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleSlash,
  Edit3,
} from "lucide-react";

import { AutosaveIndicator } from "@/monitoramento/components/competencies/autosave-indicator";
import { IndicatorField } from "@/monitoramento/components/competencies/indicator-field";
import { ValidationMessage } from "@/monitoramento/components/competencies/validation-message";
import { cn } from "@/monitoramento/lib/utils/cn";
import type {
  FieldDraft,
  FieldMessage,
  FieldVisualStatus,
  SaveState,
} from "@/monitoramento/features/competencies/wizard/types";
import type { Indicator, IndicatorDataType } from "@/monitoramento/types/domain";

const visualStatusConfig: Record<
  FieldVisualStatus,
  { label: string; className: string; icon: typeof Circle }
> = {
  edited: {
    className:
      "border-amber-200 border-l-amber-400 bg-[linear-gradient(135deg,#ffffff,#fffbeb)]",
    icon: Edit3,
    label: "Editado",
  },
  error: {
    className:
      "border-red-200 border-l-red-500 bg-[linear-gradient(135deg,#ffffff,#fff7f7)]",
    icon: AlertTriangle,
    label: "Erro",
  },
  never_filled: {
    className:
      "border-slate-200 border-l-slate-300 bg-[linear-gradient(135deg,#ffffff,#f8fafc)]",
    icon: CircleDashed,
    label: "Nunca preenchido",
  },
  not_applicable: {
    className:
      "border-slate-200 border-l-slate-500 bg-[linear-gradient(135deg,#ffffff,#f8fafc)]",
    icon: CircleSlash,
    label: "N/A",
  },
  saved: {
    className:
      "border-emerald-200 border-l-emerald-500 bg-[linear-gradient(135deg,#ffffff,#f7fffb)]",
    icon: CheckCircle2,
    label: "Salvo",
  },
  warning: {
    className:
      "border-amber-200 border-l-amber-500 bg-[linear-gradient(135deg,#ffffff,#fffbeb)]",
    icon: AlertTriangle,
    label: "Alerta",
  },
};

export function IndicatorCard({
  indicator,
  draft,
  messages,
  saveState,
  savedAt,
  disabled,
  onChange,
  onBlur,
}: {
  indicator: Indicator;
  draft: FieldDraft;
  messages: FieldMessage[];
  saveState: SaveState;
  savedAt?: string | null;
  disabled: boolean;
  onChange: (draft: FieldDraft) => void;
  onBlur: () => void;
}) {
  const visualStatus = resolveVisualStatus(draft, messages, saveState);
  const config = visualStatusConfig[visualStatus];
  const Icon = config.icon;

  return (
    <article
      className={cn(
        "interactive-card rounded-[16px] border border-l-4 p-5 shadow-[var(--shadow-card)]",
        config.className,
      )}
    >
      <div className="mb-4 flex flex-col gap-3 border-b border-blue-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {indicator.subgroup ? (
            <p className="text-xs font-semibold uppercase tracking-normal text-blue-700">
              {indicator.subgroup}
            </p>
          ) : null}
          <p className="text-xs leading-5 text-muted-foreground">
            {dataTypeLabel(indicator.data_type)} / {indicator.unit_of_measure}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-border bg-white/86 px-2.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {config.label}
          </span>
          <AutosaveIndicator state={saveState} savedAt={savedAt} />
        </div>
      </div>

      <IndicatorField
        allowsNotApplicable={indicator.allows_not_applicable}
        dataType={indicator.data_type}
        description={indicator.description}
        disabled={disabled}
        draft={draft}
        id={indicator.id}
        label={indicator.display_name}
        onBlur={onBlur}
        onChange={onChange}
        required={indicator.required}
        source={indicator.source_cell ?? indicator.source_cells}
        technicalCode={indicator.code}
        unitOfMeasure={indicator.unit_of_measure}
      />

      {messages.length > 0 ? (
        <div className="mt-4 space-y-2">
          {messages.map((message, index) => (
            <ValidationMessage
              key={`${message.code ?? "message"}-${index}`}
              message={message}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function resolveVisualStatus(
  draft: FieldDraft,
  messages: FieldMessage[],
  saveState: SaveState,
): FieldVisualStatus {
  if (messages.some((message) => message.severity === "error")) {
    return "error";
  }

  if (draft.valueStatus === "not_applicable") {
    return "not_applicable";
  }

  if (messages.some((message) => message.severity === "warning")) {
    return "warning";
  }

  if (saveState === "dirty" || saveState === "saving") {
    return "edited";
  }

  if (saveState === "saved" || draft.valueStatus === "informed") {
    return "saved";
  }

  return "never_filled";
}

function dataTypeLabel(dataType: IndicatorDataType): string {
  const labels: Record<IndicatorDataType, string> = {
    integer: "Inteiro",
    decimal: "Decimal",
    percentage: "Percentual",
    short_text: "Texto",
    long_text: "Texto longo",
    boolean: "Sim/Não",
  };

  return labels[dataType];
}
