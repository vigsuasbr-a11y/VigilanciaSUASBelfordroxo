import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import { listFormVersions } from "@/monitoramento/services/form-versions";
import type { Competency, FormVersion, Unit } from "@/monitoramento/types/domain";
import type {
  CompetencyWizardData,
  GroupObservation,
  GroupObservationDefinition,
  IndicatorRelationship,
  SpecialFieldDefinition,
  SpecialFieldValue,
  SubmissionReview,
  ValidationResult,
} from "@/monitoramento/features/competencies/wizard/types";
import type { Indicator, IndicatorGroup, IndicatorValue } from "@/monitoramento/types/domain";

export type CompetencyLookups = {
  units: Unit[];
  formVersions: FormVersion[];
  unavailableUnits: Unit[];
  draftFormVersions: FormVersion[];
};

export async function listCompetencies(): Promise<Competency[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("competencies")
    .select(
      "id, unit_id, form_version_id, reference_year, reference_month, status, completion_percentage, created_by, created_at, updated_by, updated_at, submitted_by, submitted_at, reviewed_by, reviewed_at, published_by, published_at, reopened_by, reopened_at, reopen_reason, cancellation_reason, current_publication_version, general_notes, units(code, full_name, acronym), form_versions(code, name)",
    )
    .order("reference_year", { ascending: false })
    .order("reference_month", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar as competências.");
  }

  return ((data ?? []) as unknown as RawCompetency[]).map(normalizeCompetency);
}

export async function getCompetencyById(id: string): Promise<Competency | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("competencies")
    .select(
      "id, unit_id, form_version_id, reference_year, reference_month, status, completion_percentage, created_by, created_at, updated_by, updated_at, submitted_by, submitted_at, reviewed_by, reviewed_at, published_by, published_at, reopened_by, reopened_at, reopen_reason, cancellation_reason, current_publication_version, general_notes, units(code, full_name, acronym), form_versions(code, name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a competência.");
  }

  return data ? normalizeCompetency(data as unknown as RawCompetency) : null;
}

export async function getCompetencyWizardData(id: string): Promise<CompetencyWizardData | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: competencyData, error: competencyError } = await supabase
    .from("competencies")
    .select(
      "id, unit_id, form_version_id, reference_year, reference_month, status, completion_percentage, created_by, created_at, updated_by, updated_at, submitted_by, submitted_at, reviewed_by, reviewed_at, published_by, published_at, reopened_by, reopened_at, reopen_reason, cancellation_reason, current_publication_version, general_notes, units(code, full_name, acronym), form_versions(code, name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (competencyError) {
    throw new Error("Não foi possível carregar a competência.");
  }

  if (!competencyData) {
    return null;
  }

  const competency = normalizeCompetency(competencyData as unknown as RawCompetency);
  const formVersionId = competency.form_version_id;

  const [
    groupsResult,
    indicatorsResult,
    valuesResult,
    observationDefinitionsResult,
    observationsResult,
    specialFieldDefinitionsResult,
    specialFieldValuesResult,
    relationshipsResult,
    validationsResult,
    reviewsResult,
  ] = await Promise.all([
    supabase
      .from("indicator_groups")
      .select(
        "id, form_version_id, code, name, source_name, inferred_name, description, display_order, source_start_row, source_end_row, observation_source_range, active, created_at, updated_at",
      )
      .eq("form_version_id", formVersionId)
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("indicators")
      .select(
        "id, form_version_id, group_id, code, original_name, display_name, description, subgroup, source_sheet, source_cell, source_row, source_column, source_cells, source_metadata, data_type, unit_of_measure, calculation_type, annual_aggregation_type, required, accepts_zero, allows_empty, allows_not_applicable, minimum_value, maximum_value, display_order, active, is_dashboard_featured, dashboard_default_presentation, dashboard_card_enabled, dashboard_chart_enabled, created_at, updated_at",
      )
      .eq("form_version_id", formVersionId)
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("indicator_values")
      .select(
        "id, competency_id, indicator_id, numeric_value, text_value, value_status, notes, informed_by, informed_at, updated_by, updated_at",
      )
      .eq("competency_id", id),
    supabase
      .from("group_observation_definitions")
      .select("id, form_version_id, group_id, code, label, source_range, active, created_at, updated_at")
      .eq("form_version_id", formVersionId)
      .eq("active", true)
      .order("code", { ascending: true }),
    supabase
      .from("group_observations")
      .select("id, competency_id, indicator_group_id, text, created_by, created_at, updated_by, updated_at")
      .eq("competency_id", id),
    supabase
      .from("special_field_definitions")
      .select(
        "id, form_version_id, group_id, code, label, parent_label, source_cell, proposed_value_cell_or_range, proposed_data_type, model_status, requires_confirmation, notes, active, created_at, updated_at",
      )
      .eq("form_version_id", formVersionId)
      .eq("active", true)
      .eq("model_status", "confirmed")
      .order("code", { ascending: true }),
    supabase
      .from("special_field_values")
      .select(
        "id, competency_id, special_field_definition_id, numeric_value, text_value, value_status, notes, created_by, created_at, updated_by, updated_at",
      )
      .eq("competency_id", id),
    supabase
      .from("indicator_relationships")
      .select(
        "id, form_version_id, parent_indicator_id, child_indicator_id, relationship_type, display_order, validation_severity, tolerance_value, related_source_rows, active, notes, created_at, updated_at",
      )
      .eq("form_version_id", formVersionId)
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("validation_results")
      .select(
        "id, competency_id, indicator_id, relationship_id, severity, code, message, expected_value, actual_value, status, justification, justified_by, justified_at, created_at, updated_at",
      )
      .eq("competency_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("submission_reviews")
      .select("id, competency_id, action, reviewer_id, comment, created_at")
      .eq("competency_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const failed = [
    groupsResult.error,
    indicatorsResult.error,
    valuesResult.error,
    observationDefinitionsResult.error,
    observationsResult.error,
    specialFieldDefinitionsResult.error,
    specialFieldValuesResult.error,
    relationshipsResult.error,
    validationsResult.error,
    reviewsResult.error,
  ].find(Boolean);

  if (failed) {
    throw new Error("Não foi possível carregar os dados do formulário da competência.");
  }

  return {
    competency,
    groups: (groupsResult.data ?? []) as IndicatorGroup[],
    indicators: (indicatorsResult.data ?? []) as Indicator[],
    indicatorValues: (valuesResult.data ?? []) as IndicatorValue[],
    observationDefinitions: (observationDefinitionsResult.data ?? []) as GroupObservationDefinition[],
    groupObservations: (observationsResult.data ?? []) as GroupObservation[],
    specialFieldDefinitions: (specialFieldDefinitionsResult.data ?? []) as SpecialFieldDefinition[],
    specialFieldValues: (specialFieldValuesResult.data ?? []) as SpecialFieldValue[],
    relationships: (relationshipsResult.data ?? []) as IndicatorRelationship[],
    validationResults: (validationsResult.data ?? []) as ValidationResult[],
    reviewHistory: (reviewsResult.data ?? []) as SubmissionReview[],
  };
}

export async function getCompetencyLookups(): Promise<CompetencyLookups> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { units: [], formVersions: [], unavailableUnits: [], draftFormVersions: [] };
  }

  const [unitsResult, formVersions, draftFormVersions] = await Promise.all([
    supabase
      .from("units")
      .select(
        "id, code, roman_number, name, full_name, acronym, unit_type, display_order, active, created_at, updated_at, deactivated_at",
      )
      .eq("active", true)
      .order("display_order", { ascending: true }),
    listFormVersions(supabase, { activeOnly: true, status: "active" }),
    listFormVersions(supabase, { status: "draft" }),
  ]);

  if (unitsResult.error) {
    throw new Error("Não foi possível carregar dados para criação da competência.");
  }

  const units = (unitsResult.data ?? []) as Unit[];
  const activeServiceTypes = new Set(formVersions.map((formVersion) => formVersion.service_type));

  return {
    units: units.filter((unit) => activeServiceTypes.has(unit.unit_type)),
    unavailableUnits: units.filter((unit) => !activeServiceTypes.has(unit.unit_type)),
    formVersions,
    draftFormVersions,
  };
}

type RawCompetency = Omit<Competency, "units" | "form_versions"> & {
  units?: Pick<Unit, "code" | "full_name" | "acronym"> | Array<Pick<Unit, "code" | "full_name" | "acronym">> | null;
  form_versions?: Pick<FormVersion, "code" | "name"> | Array<Pick<FormVersion, "code" | "name">> | null;
};

function normalizeCompetency(competency: RawCompetency): Competency {
  return {
    ...competency,
    units: normalizeSingle(competency.units),
    form_versions: normalizeSingle(competency.form_versions),
  };
}

function normalizeSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
