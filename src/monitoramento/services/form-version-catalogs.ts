import { normalizeServiceType, type ServiceType } from "@/monitoramento/lib/service-types";
import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import { listFormVersions } from "@/monitoramento/services/form-versions";
import type { FormVersion } from "@/monitoramento/types/domain";

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

export type FormVersionCatalogCounts = {
  groups: number;
  indicators: number;
  featuredIndicators: number;
  observations: number;
  specialFields: number;
};

export type FormVersionCatalogOverview = {
  formVersion: FormVersion;
  serviceType: ServiceType;
  activeUnits: number;
  counts: FormVersionCatalogCounts;
  operationalState: "available" | "review" | "archived";
  canOpenCompetencies: boolean;
};

export async function getFormVersionCatalogOverviews(): Promise<FormVersionCatalogOverview[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const [formVersions, unitsResult] = await Promise.all([
    listFormVersions(supabase),
    supabase
      .from("units")
      .select("unit_type")
      .eq("active", true),
  ]);

  if (unitsResult.error) {
    throw new Error("Não foi possível carregar unidades para o painel de formulários.");
  }

  const activeUnitsByServiceType = new Map<ServiceType, number>();

  for (const unit of unitsResult.data ?? []) {
    const serviceType = normalizeServiceType((unit as { unit_type?: string }).unit_type);
    activeUnitsByServiceType.set(serviceType, (activeUnitsByServiceType.get(serviceType) ?? 0) + 1);
  }

  return Promise.all(
    formVersions.map(async (formVersion) => {
      const serviceType = normalizeServiceType(formVersion.service_type);
      const counts = await countCatalogRows(supabase, formVersion.id);
      const canOpenCompetencies = formVersion.active && formVersion.status === "active";

      return {
        formVersion,
        serviceType,
        activeUnits: activeUnitsByServiceType.get(serviceType) ?? 0,
        counts,
        operationalState: formVersion.status === "archived" ? "archived" : canOpenCompetencies ? "available" : "review",
        canOpenCompetencies,
      };
    }),
  );
}

async function countCatalogRows(supabase: SupabaseServerClient, formVersionId: string): Promise<FormVersionCatalogCounts> {
  const [groups, indicators, featuredIndicators, observations, specialFields] = await Promise.all([
    countRows(supabase, "indicator_groups", formVersionId),
    countRows(supabase, "indicators", formVersionId),
    countRows(supabase, "indicators", formVersionId, { featuredOnly: true }),
    countRows(supabase, "group_observation_definitions", formVersionId),
    countRows(supabase, "special_field_definitions", formVersionId),
  ]);

  return {
    groups,
    indicators,
    featuredIndicators,
    observations,
    specialFields,
  };
}

async function countRows(
  supabase: SupabaseServerClient,
  table: string,
  formVersionId: string,
  options: { featuredOnly?: boolean } = {},
): Promise<number> {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("form_version_id", formVersionId);

  if (options.featuredOnly) {
    query = query.eq("is_dashboard_featured", true);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  return count ?? 0;
}
