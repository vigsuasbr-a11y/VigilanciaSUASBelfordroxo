import { cache } from "react";

import {
  DEFAULT_EXECUTIVE_ALERT_RULES,
  type ExecutiveAlertRule,
  type ExecutiveCompetency,
  type ExecutiveGroup,
  type ExecutiveIndicator,
  type ExecutivePublication,
  type ExecutiveSnapshot,
  type ExecutiveUnit,
} from "@/monitoramento/features/dashboard/executive";
import { normalizeServiceType, serviceTypeFromFormCode } from "@/monitoramento/lib/service-types";
import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import { listFormVersions } from "@/monitoramento/services/form-versions";
import type { CompetencyStatus, FormVersion, IndicatorDataType, UUID } from "@/monitoramento/types/domain";

export type ExecutiveDashboardFormVersion = Pick<
  FormVersion,
  "id" | "code" | "name" | "year" | "version" | "status" | "active" | "published_at" | "service_type"
>;

export type ExecutiveDashboardData = {
  units: ExecutiveUnit[];
  formVersions: ExecutiveDashboardFormVersion[];
  groups: ExecutiveGroup[];
  indicators: ExecutiveIndicator[];
  competencies: ExecutiveCompetency[];
  publications: ExecutivePublication[];
  snapshots: ExecutiveSnapshot[];
  alertRules: ExecutiveAlertRule[];
  pendingSpecialFields: number;
  loadedAt: string;
};

type RawUnit = {
  id: UUID;
  code: string;
  name: string;
  full_name: string;
  acronym: string;
  unit_type: string;
  display_order: number;
};

type RawGroup = {
  id: UUID;
  code: string;
  name: string;
  display_order: number;
};

type RawIndicator = {
  id: UUID;
  form_version_id: UUID;
  group_id: UUID;
  code: string;
  display_name: string;
  unit_of_measure: string;
  data_type: IndicatorDataType;
  display_order: number;
  dashboard_default_presentation: string | null;
};

type RawCompetency = {
  id: UUID;
  unit_id: UUID;
  form_version_id: UUID;
  reference_year: number;
  reference_month: number;
  status: CompetencyStatus;
  updated_at: string;
  published_at: string | null;
};

type RawPublication = {
  id: UUID;
  competency_id: UUID;
  version_number: number;
  status: "current" | "superseded" | "cancelled";
  published_by: UUID | null;
  published_at: string;
  created_at: string;
};

type RawSnapshot = {
  id: UUID;
  publication_id: UUID;
  competency_id: UUID;
  indicator_id: UUID | null;
  special_field_definition_id: UUID | null;
  indicator_group_id: UUID | null;
  snapshot_kind: "indicator_value" | "special_field_value" | "group_observation";
  numeric_value: number | string | null;
  text_value: string | null;
  value_status: "informed" | "not_informed" | "not_applicable" | null;
  notes: string | null;
  created_at: string;
};

type RawProfile = {
  id: UUID;
  display_name: string | null;
  full_name: string | null;
  email: string | null;
};

type RawDashboardDefinition = {
  id: UUID;
};

type RawDashboardWidget = {
  id: UUID;
  code: string;
  settings: unknown;
};

export const getExecutiveDashboardData = cache(async (): Promise<ExecutiveDashboardData> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return emptyExecutiveDashboardData();
  }

  const [unitsResult, formsResult, groupsResult, indicatorsResult, competenciesResult, publicationsResult, specialFieldsResult, dashboardResult] =
    await Promise.all([
      supabase
        .from("units")
        .select("id, code, name, full_name, acronym, unit_type, display_order")
        .eq("active", true)
        .order("display_order", { ascending: true }),
      listFormVersions(supabase, { activeOnly: true }),
      supabase
        .from("indicator_groups")
        .select("id, code, name, display_order")
        .eq("active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("indicators")
        .select("id, form_version_id, group_id, code, display_name, unit_of_measure, data_type, display_order, dashboard_default_presentation")
        .eq("active", true)
        .eq("is_dashboard_featured", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("competencies")
        .select("id, unit_id, form_version_id, reference_year, reference_month, status, updated_at, published_at")
        .order("reference_year", { ascending: false })
        .order("reference_month", { ascending: false }),
      supabase
        .from("publications")
        .select("id, competency_id, version_number, status, published_by, published_at, created_at")
        .eq("status", "current")
        .order("published_at", { ascending: false }),
      supabase
        .from("special_field_definitions")
        .select("id", { count: "exact", head: true })
        .eq("active", true)
        .eq("model_status", "pending_confirmation"),
      supabase.from("dashboard_definitions").select("id").eq("code", "executive").eq("active", true).maybeSingle(),
    ]);

  if (
    unitsResult.error
    || groupsResult.error
    || indicatorsResult.error
    || competenciesResult.error
    || publicationsResult.error
  ) {
    throw new Error("Não foi possível carregar os dados do dashboard executivo.");
  }

  const units = ((unitsResult.data ?? []) as RawUnit[]).map(mapUnit);
  const formVersions = formVersionsToDashboard(formsResult);
  const formVersionById = new Map(formVersions.map((formVersion) => [formVersion.id, formVersion]));
  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  const groups = ((groupsResult.data ?? []) as RawGroup[]).map(mapGroup);
  const indicators = ((indicatorsResult.data ?? []) as RawIndicator[]).map((indicator) => mapIndicator(indicator, formVersionById));
  const competencies = ((competenciesResult.data ?? []) as RawCompetency[]).map((competency) =>
    mapCompetency(competency, formVersionById, unitById),
  );
  const publications = (publicationsResult.data ?? []) as RawPublication[];
  const competenciesById = new Map(competencies.map((competency) => [competency.id, competency]));
  const officialPublications = publications.filter((publication) =>
    isOfficialExecutivePublication({
      competencyStatus: competenciesById.get(publication.competency_id)?.status ?? null,
      publicationStatus: publication.status,
    }),
  );
  const publishedCompetencies = new Map(competencies.filter((competency) => competency.status === "published").map((competency) => [competency.id, competency]));
  const profilesById = await loadProfilesById(officialPublications.map((publication) => publication.published_by).filter(isUUID));
  const executivePublications = officialPublications.map((publication) =>
    mapPublication(publication, publishedCompetencies.get(publication.competency_id), profilesById.get(publication.published_by ?? "")),
  );
  const snapshots = await loadOfficialSnapshots(officialPublications, publishedCompetencies, indicators);
  const widgets = await loadExecutiveWidgets((dashboardResult.data as RawDashboardDefinition | null)?.id ?? null);

  return {
    units,
    formVersions,
    groups,
    indicators,
    competencies,
    publications: executivePublications,
    snapshots,
    alertRules: parseAlertRules(widgets),
    pendingSpecialFields: specialFieldsResult.count ?? 0,
    loadedAt: new Date().toISOString(),
  };
});

export function isOfficialExecutivePublication(input: {
  competencyStatus: CompetencyStatus | null | undefined;
  publicationStatus: "current" | "superseded" | "cancelled";
}): boolean {
  return input.publicationStatus === "current" && input.competencyStatus === "published";
}

async function loadOfficialSnapshots(
  publications: RawPublication[],
  competenciesById: Map<UUID, ExecutiveCompetency>,
  indicators: ExecutiveIndicator[],
): Promise<ExecutiveSnapshot[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase || publications.length === 0) {
    return [];
  }

  const publicationsById = new Map(publications.map((publication) => [publication.id, publication]));
  const indicatorById = new Map(indicators.map((indicator) => [indicator.id, indicator]));
  const snapshots: RawSnapshot[] = [];

  for (const chunk of chunks(publications.map((publication) => publication.id), 100)) {
    const result = await supabase
      .from("publication_snapshots")
      .select(
        "id, publication_id, competency_id, indicator_id, special_field_definition_id, indicator_group_id, snapshot_kind, numeric_value, text_value, value_status, notes, created_at",
      )
      .in("publication_id", chunk);

    if (result.error) {
      throw new Error("Não foi possível carregar os snapshots oficiais publicados.");
    }

    snapshots.push(...((result.data ?? []) as RawSnapshot[]));
  }

  return snapshots
    .map((snapshot) => {
      const publication = publicationsById.get(snapshot.publication_id);
      const competency = competenciesById.get(snapshot.competency_id);
      const indicator = snapshot.indicator_id ? indicatorById.get(snapshot.indicator_id) : undefined;

      if (!publication || !competency) {
        return null;
      }

      return {
        id: snapshot.id,
        publicationId: snapshot.publication_id,
        competencyId: snapshot.competency_id,
        unitId: competency.unitId,
        formVersionId: competency.formVersionId,
        serviceType: competency.serviceType,
        referenceYear: competency.referenceYear,
        referenceMonth: competency.referenceMonth,
        snapshotKind: snapshot.snapshot_kind,
        indicatorId: snapshot.indicator_id,
        groupId: snapshot.indicator_group_id ?? indicator?.groupId ?? null,
        numericValue: parseNumeric(snapshot.numeric_value),
        textValue: snapshot.text_value,
        valueStatus: snapshot.value_status,
        notes: snapshot.notes,
        publishedAt: publication.published_at,
      };
    })
    .filter((snapshot): snapshot is ExecutiveSnapshot => snapshot !== null);
}

async function loadProfilesById(ids: UUID[]): Promise<Map<UUID, RawProfile>> {
  const supabase = await createSupabaseServerClient();

  if (!supabase || ids.length === 0) {
    return new Map();
  }

  const result = await supabase.from("profiles").select("id, display_name, full_name, email").in("id", Array.from(new Set(ids)));

  if (result.error) {
    return new Map();
  }

  return new Map(((result.data ?? []) as RawProfile[]).map((profile) => [profile.id, profile]));
}

async function loadExecutiveWidgets(dashboardId: UUID | null): Promise<RawDashboardWidget[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase || !dashboardId) {
    return [];
  }

  const result = await supabase
    .from("dashboard_widgets")
    .select("id, code, settings")
    .eq("dashboard_id", dashboardId)
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (result.error) {
    return [];
  }

  return (result.data ?? []) as RawDashboardWidget[];
}

function mapUnit(unit: RawUnit): ExecutiveUnit {
  return {
    id: unit.id,
    code: unit.code,
    name: unit.name,
    fullName: unit.full_name,
    acronym: unit.acronym,
    unitType: unit.unit_type,
    displayOrder: unit.display_order,
  };
}

function mapGroup(group: RawGroup): ExecutiveGroup {
  return {
    id: group.id,
    code: group.code,
    name: group.name,
    displayOrder: group.display_order,
  };
}

function mapIndicator(indicator: RawIndicator, formVersionById: Map<UUID, ExecutiveDashboardFormVersion>): ExecutiveIndicator {
  const formVersion = formVersionById.get(indicator.form_version_id);

  return {
    id: indicator.id,
    formVersionId: indicator.form_version_id,
    serviceType: formVersion?.service_type ?? serviceTypeFromFormCode(formVersion?.code),
    groupId: indicator.group_id,
    code: indicator.code,
    displayName: indicator.display_name,
    unitOfMeasure: indicator.unit_of_measure,
    dataType: indicator.data_type,
    displayOrder: indicator.display_order,
    defaultPresentation: indicator.dashboard_default_presentation,
  };
}

function mapCompetency(
  competency: RawCompetency,
  formVersionById: Map<UUID, ExecutiveDashboardFormVersion>,
  unitById: Map<UUID, ExecutiveUnit>,
): ExecutiveCompetency {
  const formVersion = formVersionById.get(competency.form_version_id);

  return {
    id: competency.id,
    unitId: competency.unit_id,
    formVersionId: competency.form_version_id,
    serviceType: formVersion?.service_type ?? normalizeServiceType(unitById.get(competency.unit_id)?.unitType),
    referenceYear: competency.reference_year,
    referenceMonth: competency.reference_month,
    status: competency.status,
    updatedAt: competency.updated_at,
  };
}

function mapPublication(
  publication: RawPublication,
  competency: ExecutiveCompetency | undefined,
  profile: RawProfile | undefined,
): ExecutivePublication {
  if (!competency) {
    throw new Error("Publicação oficial sem competência publicada associada.");
  }

  return {
    id: publication.id,
    competencyId: publication.competency_id,
    unitId: competency.unitId,
    formVersionId: competency.formVersionId,
    serviceType: competency.serviceType,
    referenceYear: competency.referenceYear,
    referenceMonth: competency.referenceMonth,
    versionNumber: publication.version_number,
    publishedBy: publication.published_by,
    publishedByName: profile?.display_name ?? profile?.full_name ?? profile?.email ?? null,
    publishedAt: publication.published_at,
    createdAt: publication.created_at,
  };
}

function formVersionsToDashboard(formVersions: FormVersion[]): ExecutiveDashboardFormVersion[] {
  return formVersions.map((formVersion) => ({
    id: formVersion.id,
    code: formVersion.code,
    name: formVersion.name,
    year: formVersion.year,
    version: formVersion.version,
    status: formVersion.status,
    active: formVersion.active,
    published_at: formVersion.published_at,
    service_type: formVersion.service_type ?? serviceTypeFromFormCode(formVersion.code),
  }));
}

function parseAlertRules(widgets: RawDashboardWidget[]): ExecutiveAlertRule[] {
  const parsedRules = widgets.flatMap((widget) => {
    if (!isRecord(widget.settings)) {
      return [];
    }

    const rules = widget.settings.alert_rules;

    if (!Array.isArray(rules)) {
      return [];
    }

    return rules.filter(isAlertRule);
  });

  return parsedRules.length > 0 ? parsedRules : DEFAULT_EXECUTIVE_ALERT_RULES;
}

function isAlertRule(value: unknown): value is ExecutiveAlertRule {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string"
    && typeof value.enabled === "boolean"
    && isAlertRuleType(value.type)
    && isAlertSeverity(value.severity)
    && (value.thresholdPercent === undefined || typeof value.thresholdPercent === "number")
  );
}

function isAlertRuleType(value: unknown): value is ExecutiveAlertRule["type"] {
  return (
    value === "partial_data"
    || value === "missing_publication"
    || value === "late_publication"
    || value === "zero_indicator"
    || value === "significant_increase"
    || value === "significant_decrease"
    || value === "special_fields_pending"
  );
}

function isAlertSeverity(value: unknown): value is ExecutiveAlertRule["severity"] {
  return value === "info" || value === "warning" || value === "critical";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUUID(value: UUID | null): value is UUID {
  return typeof value === "string" && value.length > 0;
}

function parseNumeric(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

function emptyExecutiveDashboardData(): ExecutiveDashboardData {
  return {
    units: [],
    formVersions: [],
    groups: [],
    indicators: [],
    competencies: [],
    publications: [],
    snapshots: [],
    alertRules: DEFAULT_EXECUTIVE_ALERT_RULES,
    pendingSpecialFields: 0,
    loadedAt: new Date().toISOString(),
  };
}
