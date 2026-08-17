import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import { listFormVersions } from "@/monitoramento/services/form-versions";
import type { FormVersion, Indicator, IndicatorGroup, UUID } from "@/monitoramento/types/domain";

export type IndicatorStats = {
  activeFormVersion: FormVersion | null;
  activeFormVersions: FormVersion[];
  groups: number;
  indicators: number;
  featuredIndicators: number;
  observations: number;
  specialFields: number;
};

export async function getActiveFormVersion(): Promise<FormVersion | null> {
  return (await getActiveFormVersions())[0] ?? null;
}

export async function getActiveFormVersions(): Promise<FormVersion[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  return listFormVersions(supabase, { activeOnly: true, status: "active" });
}

export async function listIndicatorGroups(formVersionId?: UUID): Promise<IndicatorGroup[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const targetFormVersionIds = formVersionId
    ? [formVersionId]
    : (await getActiveFormVersions()).map((formVersion) => formVersion.id);

  if (targetFormVersionIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("indicator_groups")
    .select(
      "id, form_version_id, code, name, source_name, inferred_name, description, display_order, source_start_row, source_end_row, observation_source_range, active, created_at, updated_at",
    )
    .eq("active", true);

  query =
    targetFormVersionIds.length === 1
      ? query.eq("form_version_id", targetFormVersionIds[0])
      : query.in("form_version_id", targetFormVersionIds);

  const { data, error } = await query
    .order("form_version_id", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os grupos de indicadores.");
  }

  return (data ?? []) as IndicatorGroup[];
}

export async function listIndicators(limit = 80, formVersionId?: UUID): Promise<Indicator[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const targetFormVersionIds = formVersionId
    ? [formVersionId]
    : (await getActiveFormVersions()).map((formVersion) => formVersion.id);

  if (targetFormVersionIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("indicators")
    .select(
      "id, form_version_id, group_id, code, original_name, display_name, description, subgroup, source_sheet, source_cell, source_row, source_column, source_cells, source_metadata, data_type, unit_of_measure, calculation_type, annual_aggregation_type, required, accepts_zero, allows_empty, allows_not_applicable, minimum_value, maximum_value, display_order, active, is_dashboard_featured, dashboard_default_presentation, dashboard_card_enabled, dashboard_chart_enabled, created_at, updated_at, indicator_groups(code, name, display_order)",
    )
    .eq("active", true);

  query =
    targetFormVersionIds.length === 1
      ? query.eq("form_version_id", targetFormVersionIds[0])
      : query.in("form_version_id", targetFormVersionIds);

  const { data, error } = await query
    .order("form_version_id", { ascending: true })
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error("Não foi possível carregar os indicadores.");
  }

  return ((data ?? []) as unknown as RawIndicator[]).map(normalizeIndicator);
}

export async function getIndicatorByCode(code: string): Promise<Indicator | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const activeFormVersions = await getActiveFormVersions();
  const activeFormVersionIds = activeFormVersions.map(
    (formVersion) => formVersion.id,
  );

  if (activeFormVersionIds.length === 0) {
    return null;
  }

  let query = supabase
    .from("indicators")
    .select(
      "id, form_version_id, group_id, code, original_name, display_name, description, subgroup, source_sheet, source_cell, source_row, source_column, source_cells, source_metadata, data_type, unit_of_measure, calculation_type, annual_aggregation_type, required, accepts_zero, allows_empty, allows_not_applicable, minimum_value, maximum_value, display_order, active, is_dashboard_featured, dashboard_default_presentation, dashboard_card_enabled, dashboard_chart_enabled, created_at, updated_at, indicator_groups(code, name, display_order)",
    )
    .eq("code", code);

  query =
    activeFormVersionIds.length === 1
      ? query.eq("form_version_id", activeFormVersionIds[0])
      : query.in("form_version_id", activeFormVersionIds);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o indicador.");
  }

  return data ? normalizeIndicator(data as unknown as RawIndicator) : null;
}

export async function getIndicatorStats(): Promise<IndicatorStats> {
  const supabase = await createSupabaseServerClient();
  const activeFormVersions = await getActiveFormVersions();
  const activeFormVersionIds = activeFormVersions.map(
    (formVersion) => formVersion.id,
  );
  const activeFormVersion = activeFormVersions[0] ?? null;

  if (!supabase || activeFormVersionIds.length === 0) {
    return {
      activeFormVersion,
      activeFormVersions,
      groups: 0,
      indicators: 0,
      featuredIndicators: 0,
      observations: 0,
      specialFields: 0,
    };
  }

  const [
    { count: groups },
    { count: indicators },
    { count: featuredIndicators },
    { count: observations },
    { count: specialFields },
  ] = await Promise.all([
    countRowsForFormVersions(supabase, "indicator_groups", activeFormVersionIds),
    countRowsForFormVersions(supabase, "indicators", activeFormVersionIds),
    countRowsForFormVersions(supabase, "indicators", activeFormVersionIds, {
      featuredOnly: true,
    }),
    countRowsForFormVersions(
      supabase,
      "group_observation_definitions",
      activeFormVersionIds,
    ),
    countRowsForFormVersions(
      supabase,
      "special_field_definitions",
      activeFormVersionIds,
    ),
  ]);

  return {
    activeFormVersion,
    activeFormVersions,
    groups: groups ?? 0,
    indicators: indicators ?? 0,
    featuredIndicators: featuredIndicators ?? 0,
    observations: observations ?? 0,
    specialFields: specialFields ?? 0,
  };
}

async function countRowsForFormVersions(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  table: string,
  formVersionIds: UUID[],
  options: { featuredOnly?: boolean } = {},
) {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  query =
    formVersionIds.length === 1
      ? query.eq("form_version_id", formVersionIds[0])
      : query.in("form_version_id", formVersionIds);

  if (options.featuredOnly) {
    query = query.eq("is_dashboard_featured", true);
  }

  return query;
}

type RawIndicator = Omit<Indicator, "indicator_groups"> & {
  indicator_groups?: Pick<IndicatorGroup, "code" | "name" | "display_order"> | Array<Pick<IndicatorGroup, "code" | "name" | "display_order">> | null;
};

function normalizeIndicator(indicator: RawIndicator): Indicator {
  return {
    ...indicator,
    indicator_groups: normalizeSingle(indicator.indicator_groups),
  };
}

function normalizeSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
