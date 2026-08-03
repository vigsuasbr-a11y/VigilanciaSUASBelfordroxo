"use client";

import { AlertTriangle, MessageSquareText } from "lucide-react";

import { AutosaveIndicator } from "@/monitoramento/components/competencies/autosave-indicator";
import { IndicatorCard } from "@/monitoramento/components/competencies/indicator-card";
import { IndicatorField } from "@/monitoramento/components/competencies/indicator-field";
import { SectionDivider } from "@/monitoramento/components/competencies/section-divider";
import { TextareaInput } from "@/monitoramento/components/competencies/textarea-input";
import { ValidationMessage } from "@/monitoramento/components/competencies/validation-message";
import type {
  FieldDraft,
  FieldMessage,
  GroupObservationDefinition,
  SaveState,
  SpecialFieldDefinition,
} from "@/monitoramento/features/competencies/wizard/types";
import type { Indicator, IndicatorGroup } from "@/monitoramento/types/domain";

export function IndicatorGroupStep({
  group,
  indicators,
  indicatorDrafts,
  specialFieldDefinitions,
  specialDrafts,
  messagesById,
  saveStateById,
  savedAtById,
  observationDefinition,
  observationText,
  observationSaveState,
  observationSavedAt,
  disabled,
  onIndicatorChange,
  onIndicatorBlur,
  onSpecialChange,
  onSpecialBlur,
  onObservationChange,
  onObservationBlur,
}: {
  group: IndicatorGroup;
  indicators: Indicator[];
  indicatorDrafts: Record<string, FieldDraft>;
  specialFieldDefinitions: SpecialFieldDefinition[];
  specialDrafts: Record<string, FieldDraft>;
  messagesById: Record<string, FieldMessage[]>;
  saveStateById: Record<string, SaveState>;
  savedAtById: Record<string, string | null>;
  observationDefinition?: GroupObservationDefinition;
  observationText: string;
  observationSaveState: SaveState;
  observationSavedAt?: string | null;
  disabled: boolean;
  onIndicatorChange: (indicator: Indicator, draft: FieldDraft) => void;
  onIndicatorBlur: (indicator: Indicator) => void;
  onSpecialChange: (
    definition: SpecialFieldDefinition,
    draft: FieldDraft,
  ) => void;
  onSpecialBlur: (definition: SpecialFieldDefinition) => void;
  onObservationChange: (group: IndicatorGroup, text: string) => void;
  onObservationBlur: (group: IndicatorGroup) => void;
}) {
  const observationLength = observationText.length;

  return (
    <section className="space-y-5">
      <SectionDivider
        description={`${indicators.length} indicadores carregados dinamicamente do catálogo versionado.`}
        title="Indicadores"
      />

      <div className="grid gap-4">
        {indicators.map((indicator) => (
          <IndicatorCard
            disabled={disabled}
            draft={indicatorDrafts[indicator.id]}
            indicator={indicator}
            key={indicator.id}
            messages={messagesById[indicator.id] ?? []}
            onBlur={() => onIndicatorBlur(indicator)}
            onChange={(draft) => onIndicatorChange(indicator, draft)}
            savedAt={savedAtById[indicator.id]}
            saveState={saveStateById[indicator.id] ?? "idle"}
          />
        ))}
      </div>

      {specialFieldDefinitions.length > 0 ? (
        <div className="space-y-4">
          <SectionDivider
            description="Campos especiais confirmados no catálogo. Eles aparecem sem alterar código quando forem habilitados."
            title="Campos especiais"
          />
          <div className="grid gap-4">
            {specialFieldDefinitions.map((definition) => (
              <article
                className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 shadow-sm"
                key={definition.id}
              >
                <div className="mb-4 flex flex-col gap-2 border-b border-blue-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-normal text-blue-700">
                      {definition.parent_label ?? "Campo especial confirmado"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fonte {definition.source_cell} /{" "}
                      {definition.proposed_value_cell_or_range ??
                        "sem intervalo"}
                    </p>
                  </div>
                  <AutosaveIndicator
                    savedAt={savedAtById[definition.id]}
                    state={saveStateById[definition.id] ?? "idle"}
                  />
                </div>
                <IndicatorField
                  allowsNotApplicable
                  dataType={definition.proposed_data_type}
                  description={definition.notes}
                  disabled={disabled}
                  draft={specialDrafts[definition.id]}
                  id={definition.id}
                  label={definition.label}
                  onBlur={() => onSpecialBlur(definition)}
                  onChange={(draft) => onSpecialChange(definition, draft)}
                  required={false}
                  source={definition.source_cell}
                  technicalCode={definition.code}
                  unitOfMeasure={
                    definition.proposed_data_type === "percentage"
                      ? "%"
                      : "quantidade"
                  }
                />
                {(messagesById[definition.id] ?? []).length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {(messagesById[definition.id] ?? []).map(
                      (message, index) => (
                        <ValidationMessage
                          key={`${message.code ?? "special"}-${index}`}
                          message={message}
                        />
                      ),
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="text-base font-bold">
              {observationDefinition?.label ?? "Observação do grupo"}
            </h3>
          </div>
          <AutosaveIndicator
            state={observationSaveState}
            savedAt={observationSavedAt}
          />
        </div>
        <TextareaInput
          disabled={disabled}
          maxLength={8000}
          onBlur={() => onObservationBlur(group)}
          onChange={(event) => onObservationChange(group, event.target.value)}
          placeholder="Registre contexto, justificativas ou observações do grupo."
          value={observationText}
        />
        <div className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{observationLength}/8000 caracteres</span>
          {!observationDefinition ? (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Definição de observação não encontrada para este grupo
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
