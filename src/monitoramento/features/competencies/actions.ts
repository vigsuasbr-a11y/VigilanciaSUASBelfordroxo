"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCompetencySchema,
  saveGroupObservationSchema,
  saveIndicatorValueSchema,
  saveSpecialFieldValueSchema,
  submitCompetencyReviewSchema,
  type SaveGroupObservationInput,
  type SaveIndicatorValueInput,
  type SaveSpecialFieldValueInput,
  type SubmitCompetencyReviewInput,
} from "@/monitoramento/features/competencies/schema";
import type {
  FieldMessage,
  FieldSaveResult,
  ReviewSubmitResult,
} from "@/monitoramento/features/competencies/wizard/types";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";
import { hasPermission } from "@/monitoramento/lib/permissions/permissions";
import {
  normalizeServiceType,
  serviceTypeFromFormCode,
} from "@/monitoramento/lib/service-types";
import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import { validateIndicatorValueInput } from "@/monitoramento/lib/validation/indicator-values";
import type {
  IndicatorDataType,
  IndicatorValue,
  ValueStatus,
} from "@/monitoramento/types/domain";

const EDITABLE_TO_IN_PROGRESS = [
  "draft",
  "returned_for_correction",
  "reopened",
] as const;

export async function createCompetencyAction(
  formData: FormData,
): Promise<void> {
  await openOrCreateCompetencyAction(formData);
}

export async function openOrCreateCompetencyAction(
  formData: FormData,
): Promise<void> {
  const context = await requireActiveSession();

  const parsed = createCompetencySchema.safeParse({
    unit_id: formData.get("unit_id"),
    form_version_id: formData.get("form_version_id"),
    reference_year: formData.get("reference_year"),
    reference_month: formData.get("reference_month"),
  });

  if (!parsed.success) {
    redirect("/monitoramento/competencias/nova?erro=dados-invalidos");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/monitoramento/competencias/nova?erro=ambiente-nao-configurado");
  }

  const servicePair = await loadCompetencyServicePair(
    supabase,
    parsed.data.unit_id,
    parsed.data.form_version_id,
  );

  if (
    !servicePair?.unitActive ||
    !servicePair.formActive ||
    servicePair.formStatus !== "active"
  ) {
    redirect("/monitoramento/competencias/nova?erro=formulario-inativo-ou-em-revisao");
  }

  if (servicePair && servicePair.unitType !== servicePair.formServiceType) {
    redirect("/monitoramento/competencias/nova?erro=unidade-formulario-incompativeis");
  }

  const { data: existing, error: existingError } = await supabase
    .from("competencies")
    .select("id")
    .eq("unit_id", parsed.data.unit_id)
    .eq("form_version_id", parsed.data.form_version_id)
    .eq("reference_year", parsed.data.reference_year)
    .eq("reference_month", parsed.data.reference_month)
    .maybeSingle();

  if (existingError) {
    redirect("/monitoramento/competencias/nova?erro=sem-permissao-ou-consulta");
  }

  if (existing?.id) {
    redirect(`/monitoramento/competencias/${existing.id}`);
  }

  if (!hasPermission(context.permissions, "competencies.create")) {
    redirect("/monitoramento/acesso-negado?motivo=sem-permissao");
  }

  const { data, error } = await supabase
    .from("competencies")
    .insert({
      ...parsed.data,
      status: "draft",
      created_by: context.user?.id,
      updated_by: context.user?.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/monitoramento/competencias/nova?erro=competencia-duplicada-ou-sem-permissao");
  }

  revalidatePath("/monitoramento/competencias");
  redirect(`/monitoramento/competencias/${data.id}`);
}

export async function saveIndicatorValueAction(
  input: SaveIndicatorValueInput,
): Promise<FieldSaveResult> {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "competencies.edit_draft")) {
    return {
      ok: false,
      message: "Sua sessão não tem permissão para editar competências.",
    };
  }

  const parsed = saveIndicatorValueSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos para salvar o indicador." };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Ambiente de dados indisponível." };
  }

  const { data: indicator, error: indicatorError } = await supabase
    .from("indicators")
    .select(
      "id, data_type, minimum_value, maximum_value, accepts_zero, allows_not_applicable, required, form_version_id",
    )
    .eq("id", parsed.data.indicatorId)
    .maybeSingle();

  if (indicatorError || !indicator) {
    return { ok: false, message: "Indicador não encontrado." };
  }

  const validation = validateTypedValue({
    dataType: indicator.data_type as IndicatorDataType,
    valueStatus: parsed.data.valueStatus,
    numericValue: parsed.data.numericValue,
    textValue: parsed.data.textValue,
    minimumValue: toNumberOrNull(indicator.minimum_value),
    maximumValue: toNumberOrNull(indicator.maximum_value),
  });

  if (!validation.ok) {
    return {
      ok: false,
      message: "O valor não passou nas validações.",
      issues: validation.issues,
    };
  }

  const now = new Date().toISOString();
  const payload = {
    competency_id: parsed.data.competencyId,
    indicator_id: parsed.data.indicatorId,
    numeric_value:
      parsed.data.valueStatus === "informed" ? parsed.data.numericValue : null,
    text_value:
      parsed.data.valueStatus === "informed" ? parsed.data.textValue : null,
    value_status: parsed.data.valueStatus,
    notes: parsed.data.notes ?? null,
    informed_by:
      parsed.data.valueStatus === "informed" ? context.user?.id : null,
    informed_at: parsed.data.valueStatus === "informed" ? now : null,
    updated_by: context.user?.id,
  };

  const { data, error } = await supabase
    .from("indicator_values")
    .upsert(payload, { onConflict: "competency_id,indicator_id" })
    .select(
      "id, competency_id, indicator_id, numeric_value, text_value, value_status, notes, informed_by, informed_at, updated_by, updated_at",
    )
    .single();

  if (error || !data) {
    return { ok: false, message: "Não foi possível salvar o indicador." };
  }

  await markCompetencyInProgress(
    parsed.data.competencyId,
    context.user?.id ?? null,
  );
  revalidateCompetency(parsed.data.competencyId);

  return { ok: true, savedAt: data.updated_at, record: data as IndicatorValue };
}

export async function saveGroupObservationAction(
  input: SaveGroupObservationInput,
): Promise<FieldSaveResult> {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "competencies.edit_draft")) {
    return {
      ok: false,
      message: "Sua sessão não tem permissão para editar observações.",
    };
  }

  const parsed = saveGroupObservationSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Observação inválida." };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Ambiente de dados indisponível." };
  }

  const { data, error } = await supabase
    .from("group_observations")
    .upsert(
      {
        competency_id: parsed.data.competencyId,
        indicator_group_id: parsed.data.groupId,
        text: parsed.data.text,
        created_by: context.user?.id,
        updated_by: context.user?.id,
      },
      { onConflict: "competency_id,indicator_group_id" },
    )
    .select(
      "id, competency_id, indicator_group_id, text, created_by, created_at, updated_by, updated_at",
    )
    .single();

  if (error || !data) {
    return { ok: false, message: "Não foi possível salvar a observação." };
  }

  await markCompetencyInProgress(
    parsed.data.competencyId,
    context.user?.id ?? null,
  );
  revalidateCompetency(parsed.data.competencyId);

  return { ok: true, savedAt: data.updated_at, record: data };
}

export async function saveSpecialFieldValueAction(
  input: SaveSpecialFieldValueInput,
): Promise<FieldSaveResult> {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "competencies.edit_draft")) {
    return {
      ok: false,
      message: "Sua sessão não tem permissão para editar campos especiais.",
    };
  }

  const parsed = saveSpecialFieldValueSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Dados inválidos para salvar o campo especial.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Ambiente de dados indisponível." };
  }

  const { data: definition, error: definitionError } = await supabase
    .from("special_field_definitions")
    .select("id, proposed_data_type, active, model_status")
    .eq("id", parsed.data.specialFieldDefinitionId)
    .eq("active", true)
    .eq("model_status", "confirmed")
    .maybeSingle();

  if (definitionError || !definition) {
    return {
      ok: false,
      message: "Campo especial não está habilitado no catálogo.",
    };
  }

  const validation = validateTypedValue({
    dataType: definition.proposed_data_type as IndicatorDataType,
    valueStatus: parsed.data.valueStatus,
    numericValue: parsed.data.numericValue,
    textValue: parsed.data.textValue,
    minimumValue: null,
    maximumValue: null,
  });

  if (!validation.ok) {
    return {
      ok: false,
      message: "O campo especial não passou nas validações.",
      issues: validation.issues,
    };
  }

  const { data, error } = await supabase
    .from("special_field_values")
    .upsert(
      {
        competency_id: parsed.data.competencyId,
        special_field_definition_id: parsed.data.specialFieldDefinitionId,
        numeric_value:
          parsed.data.valueStatus === "informed"
            ? parsed.data.numericValue
            : null,
        text_value:
          parsed.data.valueStatus === "informed" ? parsed.data.textValue : null,
        value_status: parsed.data.valueStatus,
        notes: parsed.data.notes ?? null,
        created_by: context.user?.id,
        updated_by: context.user?.id,
      },
      { onConflict: "competency_id,special_field_definition_id" },
    )
    .select(
      "id, competency_id, special_field_definition_id, numeric_value, text_value, value_status, notes, created_by, created_at, updated_by, updated_at",
    )
    .single();

  if (error || !data) {
    return { ok: false, message: "Não foi possível salvar o campo especial." };
  }

  await markCompetencyInProgress(
    parsed.data.competencyId,
    context.user?.id ?? null,
  );
  revalidateCompetency(parsed.data.competencyId);

  return { ok: true, savedAt: data.updated_at, record: data };
}

export async function submitCompetencyReviewAction(
  input: SubmitCompetencyReviewInput,
): Promise<ReviewSubmitResult> {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "competencies.submit_review")) {
    return {
      ok: false,
      status: "error",
      message:
        "Sua sessão não tem permissão para enviar competências para revisão.",
    };
  }

  const parsed = submitCompetencyReviewSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      status: "error",
      message: "Dados inválidos para envio.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      status: "error",
      message: "Ambiente de dados indisponível.",
    };
  }

  const { error: validationError } = await supabase.rpc(
    "run_foundation_validations",
    {
      target_competency_id: parsed.data.competencyId,
    },
  );

  if (validationError) {
    return {
      ok: false,
      status: "error",
      message: "Não foi possível executar as validações finais.",
    };
  }

  const { data: openValidations, error: openValidationError } = await supabase
    .from("validation_results")
    .select(
      "id, indicator_id, relationship_id, severity, code, message, expected_value, actual_value, status",
    )
    .eq("competency_id", parsed.data.competencyId)
    .eq("status", "open");

  if (openValidationError) {
    return {
      ok: false,
      status: "error",
      message: "Não foi possível conferir os resultados de validação.",
    };
  }

  const issues = (
    (openValidations ?? []) as Array<{
      indicator_id: string | null;
      relationship_id: string | null;
      severity: "error" | "warning" | "information";
      code: string;
      message: string;
    }>
  ).map<FieldMessage>((result) => ({
    severity: result.severity,
    message: result.message,
    code: result.code,
    indicatorId: result.indicator_id ?? undefined,
    relationshipId: result.relationship_id ?? undefined,
  }));

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  if (errors.length > 0) {
    return {
      ok: false,
      status: "blocked",
      message:
        "A competência tem erros impeditivos. Corrija antes de enviar para revisão.",
      issues: errors,
    };
  }

  const warningJustification = parsed.data.warningJustification?.trim();

  if (warnings.length > 0 && !warningJustification) {
    return {
      ok: false,
      status: "needs_justification",
      message:
        "Há alertas abertos. Informe uma justificativa para enviar mesmo assim.",
      issues: warnings,
    };
  }

  if (warnings.length > 0 && warningJustification) {
    const { error: justifyError } = await supabase
      .from("validation_results")
      .update({
        status: "justified",
        justification: warningJustification,
        justified_by: context.user?.id,
        justified_at: new Date().toISOString(),
      })
      .eq("competency_id", parsed.data.competencyId)
      .eq("status", "open")
      .eq("severity", "warning");

    if (justifyError) {
      return {
        ok: false,
        status: "error",
        message: "Não foi possível registrar a justificativa dos alertas.",
      };
    }
  }

  const reviewComment = [
    parsed.data.comment?.trim(),
    warningJustification
      ? `Justificativa dos alertas: ${warningJustification}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { error: submitError } = await supabase.rpc(
    "submit_competency_for_review",
    {
      target_competency_id: parsed.data.competencyId,
      review_comment: reviewComment || null,
    },
  );

  if (submitError) {
    return {
      ok: false,
      status: "error",
      message: "Não foi possível enviar a competência para revisão.",
    };
  }

  revalidateCompetency(parsed.data.competencyId);

  return { ok: true, submittedAt: new Date().toISOString() };
}

async function markCompetencyInProgress(
  competencyId: string,
  userId: string | null,
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("competencies")
    .update({ status: "in_progress", updated_by: userId })
    .eq("id", competencyId)
    .in("status", [...EDITABLE_TO_IN_PROGRESS]);
}

function revalidateCompetency(competencyId: string): void {
  revalidatePath("/monitoramento/competencias");
  revalidatePath(`/monitoramento/competencias/${competencyId}`);
}

function validateTypedValue(input: {
  dataType: IndicatorDataType;
  valueStatus: ValueStatus;
  numericValue: number | null;
  textValue: string | null;
  minimumValue: number | null;
  maximumValue: number | null;
}): { ok: true } | { ok: false; issues: FieldMessage[] } {
  const issues: FieldMessage[] = [];

  const shapeValidation = validateIndicatorValueInput({
    dataType: input.dataType,
    numericValue: input.valueStatus === "informed" ? input.numericValue : null,
    textValue: input.valueStatus === "informed" ? input.textValue : null,
    valueStatus: input.valueStatus,
  });

  if (!shapeValidation.valid) {
    issues.push(
      ...shapeValidation.errors.map((message) => ({
        severity: "error" as const,
        message,
        code: "value_shape",
      })),
    );
  }

  if (input.valueStatus === "informed" && input.numericValue !== null) {
    if (
      input.dataType === "percentage" &&
      (input.numericValue < 0 || input.numericValue > 100)
    ) {
      issues.push({
        severity: "error",
        message: "Percentual deve ficar entre 0 e 100.",
        code: "percentage_range",
      });
    }

    if (
      input.minimumValue !== null &&
      input.numericValue < input.minimumValue
    ) {
      issues.push({
        severity: "error",
        message: "Valor menor que o minimo permitido.",
        code: "minimum_value",
      });
    }

    if (
      input.maximumValue !== null &&
      input.numericValue > input.maximumValue
    ) {
      issues.push({
        severity: "error",
        message: "Valor maior que o maximo permitido.",
        code: "maximum_value",
      });
    }
  }

  return issues.length > 0 ? { ok: false, issues } : { ok: true };
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

async function loadCompetencyServicePair(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  unitId: string,
  formVersionId: string,
): Promise<{
  unitType: string;
  unitActive: boolean;
  formServiceType: string;
  formStatus: "draft" | "active" | "archived";
  formActive: boolean;
} | null> {
  if (!supabase) {
    return null;
  }

  const [{ data: unit }, formVersion] = await Promise.all([
    supabase
      .from("units")
      .select("unit_type, active")
      .eq("id", unitId)
      .maybeSingle(),
    loadFormVersionOperationalState(supabase, formVersionId),
  ]);

  const unitRow = unit as { unit_type?: string; active?: boolean } | null;
  const unitType = normalizeServiceType(unitRow?.unit_type);

  return formVersion
    ? {
        unitType,
        unitActive: unitRow?.active === true,
        formServiceType: formVersion.serviceType,
        formStatus: formVersion.status,
        formActive: formVersion.active,
      }
    : null;
}

async function loadFormVersionOperationalState(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  formVersionId: string,
): Promise<{
  serviceType: string;
  status: "draft" | "active" | "archived";
  active: boolean;
} | null> {
  if (!supabase) {
    return null;
  }

  const withServiceType = await supabase
    .from("form_versions")
    .select("code, service_type, status, active")
    .eq("id", formVersionId)
    .maybeSingle();

  if (!withServiceType.error) {
    const row = withServiceType.data as {
      code: string;
      service_type?: string | null;
      status: "draft" | "active" | "archived";
      active: boolean;
    } | null;

    return row
      ? {
          serviceType: normalizeServiceType(
            row.service_type,
            serviceTypeFromFormCode(row.code),
          ),
          status: row.status,
          active: row.active,
        }
      : null;
  }

  if (!withServiceType.error.message.includes("service_type")) {
    return null;
  }

  const fallback = await supabase
    .from("form_versions")
    .select("code, status, active")
    .eq("id", formVersionId)
    .maybeSingle();

  if (fallback.error) {
    return null;
  }

  const row = fallback.data as {
    code?: string;
    status: "draft" | "active" | "archived";
    active: boolean;
  } | null;

  return row
    ? {
        serviceType: serviceTypeFromFormCode(row.code),
        status: row.status,
        active: row.active,
      }
    : null;
}
