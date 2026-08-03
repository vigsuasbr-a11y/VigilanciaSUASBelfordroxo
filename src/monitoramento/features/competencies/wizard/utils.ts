import type { Indicator, IndicatorDataType, UUID, ValueStatus } from "@/monitoramento/types/domain";
import type { FieldDraft, FieldMessage, IndicatorRelationship, ValidationResult } from "./types";

export const GROUP_STEP_LABELS = [
  "Familias Referenciadas",
  "Perfil dos Referenciados",
  "Publico Prioritario",
  "Perfil do Responsável Familiar",
  "PAIF",
  "Novas Familias PAIF",
  "Atendimentos Particularizados",
  "Atendimentos Coletivos",
  "Desligamentos PAIF",
  "Encaminhamentos",
  "Demandas",
  "Procedimentos",
  "Eventos",
] as const;

export type CompletionStats = {
  total: number;
  informed: number;
  empty: number;
  notApplicable: number;
  percent: number;
};

export type GroupStepState = "empty" | "in_progress" | "complete" | "blocked" | "warning";

export function groupStepLabel(displayOrder: number, fallback: string): string {
  return GROUP_STEP_LABELS[displayOrder - 1] ?? fallback;
}

export function formatSavedTime(value: string | null | undefined): string {
  if (!value) {
    return "Nunca salvo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function draftFromValue(value?: { numeric_value: number | null; text_value: string | null; value_status: ValueStatus }): FieldDraft {
  return {
    valueStatus: value?.value_status ?? "not_informed",
    numericValue: value?.numeric_value ?? null,
    textValue: value?.text_value ?? null,
  };
}

export function isDraftFilled(draft: FieldDraft | undefined): boolean {
  return draft?.valueStatus === "informed";
}

export function isDraftNotApplicable(draft: FieldDraft | undefined): boolean {
  return draft?.valueStatus === "not_applicable";
}

export function calculateCompletionStats(indicators: Array<Pick<Indicator, "id">>, drafts: Record<string, FieldDraft>): CompletionStats {
  const total = indicators.length;
  const informed = indicators.filter((indicator) => isDraftFilled(drafts[indicator.id])).length;
  const notApplicable = indicators.filter((indicator) => isDraftNotApplicable(drafts[indicator.id])).length;
  const empty = Math.max(total - informed - notApplicable, 0);
  const percent = total === 0 ? 100 : Math.round(((informed + notApplicable) / total) * 100);

  return { total, informed, empty, notApplicable, percent };
}

export function groupState(stats: CompletionStats, messages: FieldMessage[]): GroupStepState {
  if (messages.some((message) => message.severity === "error")) {
    return "blocked";
  }

  if (messages.some((message) => message.severity === "warning")) {
    return "warning";
  }

  if (stats.total > 0 && stats.informed + stats.notApplicable === stats.total) {
    return "complete";
  }

  if (stats.informed > 0 || stats.notApplicable > 0) {
    return "in_progress";
  }

  return "empty";
}

export function emptyDraft(): FieldDraft {
  return { valueStatus: "not_informed", numericValue: null, textValue: null };
}

export function valueDisplayForDraft(dataType: IndicatorDataType, draft: FieldDraft): string {
  if (draft.valueStatus !== "informed") {
    return "";
  }

  if (dataType === "short_text" || dataType === "long_text") {
    return draft.textValue ?? "";
  }

  if (dataType === "boolean") {
    return draft.numericValue === 1 ? "true" : "false";
  }

  return draft.numericValue === null ? "" : String(draft.numericValue).replace(".", ",");
}

export function parseDraftValue(dataType: IndicatorDataType, rawValue: string, valueStatus: ValueStatus): FieldDraft {
  if (valueStatus !== "informed") {
    return { valueStatus, numericValue: null, textValue: null };
  }

  if (dataType === "short_text" || dataType === "long_text") {
    return {
      valueStatus,
      numericValue: null,
      textValue: rawValue.trim() === "" ? null : rawValue,
    };
  }

  if (dataType === "boolean") {
    return {
      valueStatus,
      numericValue: rawValue === "true" ? 1 : 0,
      textValue: null,
    };
  }

  const trimmed = rawValue.trim();
  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  const numericValue = normalized === "" ? null : Number(normalized);

  return {
    valueStatus,
    numericValue: Number.isFinite(numericValue) ? numericValue : Number.NaN,
    textValue: null,
  };
}

export function validateIndicatorDraft(indicator: Indicator, draft: FieldDraft): FieldMessage[] {
  return validateTypedDraft({
    label: indicator.display_name,
    dataType: indicator.data_type,
    required: indicator.required,
    allowsNotApplicable: indicator.allows_not_applicable,
    minimumValue: indicator.minimum_value,
    maximumValue: indicator.maximum_value,
    draft,
    indicatorId: indicator.id,
  });
}

export function validateSpecialDraft(input: {
  id: UUID;
  label: string;
  dataType: IndicatorDataType;
  required: boolean;
  draft: FieldDraft;
}): FieldMessage[] {
  return validateTypedDraft({
    label: input.label,
    dataType: input.dataType,
    required: input.required,
    allowsNotApplicable: true,
    minimumValue: null,
    maximumValue: null,
    draft: input.draft,
    indicatorId: input.id,
  });
}

function validateTypedDraft(input: {
  label: string;
  dataType: IndicatorDataType;
  required: boolean;
  allowsNotApplicable: boolean;
  minimumValue: number | null;
  maximumValue: number | null;
  draft: FieldDraft;
  indicatorId?: UUID;
}): FieldMessage[] {
  const messages: FieldMessage[] = [];
  const { dataType, draft } = input;

  if (draft.valueStatus === "not_applicable") {
    if (!input.allowsNotApplicable) {
      messages.push({
        severity: "warning",
        message: "Este campo não foi marcado no catálogo como não aplicável.",
        code: "not_applicable_not_catalogued",
        indicatorId: input.indicatorId,
      });
    }

    return messages;
  }

  if (draft.valueStatus === "not_informed") {
    if (input.required) {
      messages.push({
        severity: "error",
        message: "Campo obrigatório ainda não preenchido.",
        code: "required",
        indicatorId: input.indicatorId,
      });
    }

    return messages;
  }

  if (dataType === "short_text" || dataType === "long_text") {
    if (!draft.textValue || draft.textValue.trim() === "") {
      messages.push({
        severity: "error",
        message: "Informe um texto para este campo.",
        code: "text_required",
        indicatorId: input.indicatorId,
      });
    }

    return messages;
  }

  if (draft.numericValue === null || Number.isNaN(draft.numericValue)) {
    messages.push({
      severity: "error",
      message: "Informe um numero valido.",
      code: "number_required",
      indicatorId: input.indicatorId,
    });

    return messages;
  }

  if (dataType === "integer" && !Number.isInteger(draft.numericValue)) {
    messages.push({
      severity: "error",
      message: "Este indicador aceita apenas numeros inteiros.",
      code: "integer_required",
      indicatorId: input.indicatorId,
    });
  }

  if (dataType === "boolean" && draft.numericValue !== 0 && draft.numericValue !== 1) {
    messages.push({
      severity: "error",
      message: "Este campo aceita apenas Sim ou Não.",
      code: "boolean_required",
      indicatorId: input.indicatorId,
    });
  }

  if (dataType === "percentage" && (draft.numericValue < 0 || draft.numericValue > 100)) {
    messages.push({
      severity: "error",
      message: "Percentual deve ficar entre 0 e 100.",
      code: "percentage_range",
      indicatorId: input.indicatorId,
    });
  }

  if (input.minimumValue !== null && draft.numericValue < input.minimumValue) {
    messages.push({
      severity: "error",
      message: `Valor menor que o minimo permitido (${input.minimumValue}).`,
      code: "minimum_value",
      indicatorId: input.indicatorId,
    });
  }

  if (input.maximumValue !== null && draft.numericValue > input.maximumValue) {
    messages.push({
      severity: "error",
      message: `Valor maior que o maximo permitido (${input.maximumValue}).`,
      code: "maximum_value",
      indicatorId: input.indicatorId,
    });
  }

  return messages;
}

export function buildRelationshipMessages(
  relationships: IndicatorRelationship[],
  indicators: Indicator[],
  drafts: Record<string, FieldDraft>,
): FieldMessage[] {
  const indicatorById = new Map(indicators.map((indicator) => [indicator.id, indicator]));
  const childrenByParent = new Map<string, IndicatorRelationship[]>();

  for (const relationship of relationships) {
    if (
      relationship.active
      && relationship.relationship_type === "parent_equals_sum_children"
      && relationship.parent_indicator_id
      && relationship.child_indicator_id
    ) {
      const current = childrenByParent.get(relationship.parent_indicator_id) ?? [];
      current.push(relationship);
      childrenByParent.set(relationship.parent_indicator_id, current);
    }
  }

  const messages: FieldMessage[] = [];

  for (const [parentId, parentRelationships] of childrenByParent.entries()) {
    const parentDraft = drafts[parentId];

    if (parentDraft?.valueStatus !== "informed" || parentDraft.numericValue === null || Number.isNaN(parentDraft.numericValue)) {
      continue;
    }

    const childDrafts = parentRelationships
      .map((relationship) => ({
        relationship,
        draft: relationship.child_indicator_id ? drafts[relationship.child_indicator_id] : undefined,
      }))
      .filter((item) => item.draft?.valueStatus === "informed" && item.draft.numericValue !== null);

    if (childDrafts.length === 0) {
      continue;
    }

    const childrenSum = childDrafts.reduce((sum, item) => sum + (item.draft?.numericValue ?? 0), 0);
    const tolerance = parentRelationships[0]?.tolerance_value ?? 0;
    const difference = Math.abs(parentDraft.numericValue - childrenSum);

    if (difference > tolerance) {
      const parent = indicatorById.get(parentId);
      messages.push({
        severity: parentRelationships[0]?.validation_severity ?? "warning",
        message: `Total diverge da soma das subcategorias (${parentDraft.numericValue} vs ${childrenSum}).`,
        code: "relationship_total_mismatch",
        indicatorId: parentId,
        relationshipId: parentRelationships[0]?.id,
      });

      if (parent) {
        for (const child of childDrafts) {
          messages.push({
            severity: parentRelationships[0]?.validation_severity ?? "warning",
            message: `Relacionado ao total "${parent.display_name}".`,
            code: "relationship_child_context",
            indicatorId: child.relationship.child_indicator_id ?? undefined,
            relationshipId: child.relationship.id,
          });
        }
      }
    }
  }

  return messages;
}

export function validationResultsToMessages(results: ValidationResult[]): FieldMessage[] {
  return results
    .filter((result) => result.status === "open")
    .map((result) => ({
      severity: result.severity,
      message: result.message,
      code: result.code,
      indicatorId: result.indicator_id ?? undefined,
      relationshipId: result.relationship_id ?? undefined,
    }));
}
