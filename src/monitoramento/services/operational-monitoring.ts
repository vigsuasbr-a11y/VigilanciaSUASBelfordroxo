import {
  computeOperationalDueDate,
  daysBetweenDates,
  isOperationallyLate,
  operationalAttention,
  operationalStageFromStatus,
  rowMatchesOperationalFilter,
  type OperationalAttention,
  type OperationalStage,
  type OperationalStatusFilter,
} from "@/monitoramento/features/monitoring/operational";
import { normalizeServiceType, type ServiceTypeFilter } from "@/monitoramento/lib/service-types";
import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import { listFormVersions } from "@/monitoramento/services/form-versions";
import type { Competency, CompetencyStatus, FormVersion, Unit, UUID } from "@/monitoramento/types/domain";

export type OperationalMonitoringFilters = {
  serviceType: ServiceTypeFilter;
  referenceYear: number;
  referenceMonth: number;
  formVersionId: UUID | null;
  status: OperationalStatusFilter;
  unitId: UUID | "all";
};

export type OperationalCompetencySummary = Pick<
  Competency,
  | "id"
  | "unit_id"
  | "form_version_id"
  | "reference_year"
  | "reference_month"
  | "status"
  | "completion_percentage"
  | "created_at"
  | "updated_at"
  | "submitted_at"
  | "reviewed_at"
  | "published_at"
  | "current_publication_version"
>;

export type OperationalUnitRow = {
  unit: Unit;
  competency: OperationalCompetencySummary | null;
  stage: OperationalStage;
  attention: OperationalAttention;
  completionPercentage: number;
  filledIndicators: number;
  totalIndicators: number;
  requiredIndicators: number;
  openErrors: number;
  openWarnings: number;
  latestReviewAction: string | null;
  latestReviewComment: string | null;
  latestReviewAt: string | null;
  dueDate: string;
  late: boolean;
  daysLate: number;
  actionHref: string;
  actionLabel: string;
};

export type OperationalMonitoringSummary = {
  totalUnits: number;
  notStarted: number;
  filling: number;
  pendingReview: number;
  returned: number;
  reviewed: number;
  published: number;
  cancelled: number;
  late: number;
  openErrors: number;
  openWarnings: number;
  averageCompletion: number;
};

export type OperationalMonitoringData = {
  filters: OperationalMonitoringFilters;
  units: Unit[];
  formVersions: FormVersion[];
  selectedFormVersion: FormVersion | null;
  dueDate: string;
  rows: OperationalUnitRow[];
  allRows: OperationalUnitRow[];
  summary: OperationalMonitoringSummary;
};

type RawValidation = {
  competency_id: UUID;
  severity: "error" | "warning" | "information";
  status: "open" | "justified" | "resolved" | "ignored";
};

type RawIndicatorValue = {
  competency_id: UUID;
  value_status: "informed" | "not_informed" | "not_applicable";
};

type RawReview = {
  competency_id: UUID;
  action: string;
  comment: string | null;
  created_at: string;
};

export async function getOperationalMonitoringData(input?: Partial<OperationalMonitoringFilters>): Promise<OperationalMonitoringData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return emptyOperationalMonitoringData(input);
  }

  const now = new Date();
  const serviceType = normalizeServiceTypeFilter(input?.serviceType);
  const requestedYear = normalizeYear(input?.referenceYear, now.getFullYear());
  const requestedMonth = normalizeMonth(input?.referenceMonth, now.getMonth() + 1);
  const status = normalizeStatusFilter(input?.status);
  const unitId = input?.unitId ?? "all";

  const [unitsResult, formVersions] = await Promise.all([
    supabase
      .from("units")
      .select(
        "id, code, roman_number, name, full_name, acronym, unit_type, display_order, active, created_at, updated_at, deactivated_at",
      )
      .eq("active", true)
      .order("display_order", { ascending: true }),
    listFormVersions(supabase, { activeOnly: true }),
  ]);

  if (unitsResult.error) {
    throw new Error("Não foi possível carregar os dados base do monitoramento operacional.");
  }

  const units = (unitsResult.data ?? []) as Unit[];
  const serviceUnits = serviceType === "all" ? units : units.filter((unit) => unit.unit_type === serviceType);
  const serviceFormVersions =
    serviceType === "all" ? formVersions : formVersions.filter((formVersion) => formVersion.service_type === serviceType);
  const selectedFormVersion =
    serviceFormVersions.find((formVersion) => formVersion.id === input?.formVersionId)
    ?? serviceFormVersions.find((formVersion) => formVersion.status === "active")
    ?? serviceFormVersions[0]
    ?? null;
  const operationalUnits = selectedFormVersion
    ? serviceUnits.filter((unit) => unit.unit_type === selectedFormVersion.service_type)
    : serviceUnits;

  const filters: OperationalMonitoringFilters = {
    serviceType,
    referenceYear: requestedYear,
    referenceMonth: requestedMonth,
    formVersionId: selectedFormVersion?.id ?? null,
    status,
    unitId,
  };

  if (!selectedFormVersion) {
    return {
      filters,
      units: serviceUnits,
      formVersions: serviceFormVersions,
      selectedFormVersion: null,
      dueDate: computeOperationalDueDate(requestedYear, requestedMonth).toISOString(),
      rows: [],
      allRows: [],
      summary: emptySummary(),
    };
  }

  const [{ count: totalIndicators }, { count: requiredIndicators }, competenciesResult] = await Promise.all([
    supabase
      .from("indicators")
      .select("id", { count: "exact", head: true })
      .eq("form_version_id", selectedFormVersion.id)
      .eq("active", true),
    supabase
      .from("indicators")
      .select("id", { count: "exact", head: true })
      .eq("form_version_id", selectedFormVersion.id)
      .eq("active", true)
      .eq("required", true),
    supabase
      .from("competencies")
      .select(
        "id, unit_id, form_version_id, reference_year, reference_month, status, completion_percentage, created_at, updated_at, submitted_at, reviewed_at, published_at, current_publication_version",
      )
      .eq("form_version_id", selectedFormVersion.id)
      .eq("reference_year", requestedYear)
      .eq("reference_month", requestedMonth),
  ]);

  if (competenciesResult.error) {
    throw new Error("Não foi possível carregar as competências do período.");
  }

  const competencies = (competenciesResult.data ?? []) as OperationalCompetencySummary[];
  const competencyIds = competencies.map((competency) => competency.id);
  const [values, validations, reviews] = competencyIds.length > 0 ? await loadOperationalChildren(competencyIds) : [[], [], []];
  const valuesByCompetency = countValuesByCompetency(values);
  const validationsByCompetency = countValidationsByCompetency(validations);
  const reviewsByCompetency = latestReviewByCompetency(reviews);
  const competencyByUnit = new Map(competencies.map((competency) => [competency.unit_id, competency]));
  const dueDate = computeOperationalDueDate(requestedYear, requestedMonth);

  const allRows = operationalUnits.map<OperationalUnitRow>((unit) => {
    const competency = competencyByUnit.get(unit.id) ?? null;
    const stage = operationalStageFromStatus(competency?.status as CompetencyStatus | undefined);
    const filledIndicators = competency ? (valuesByCompetency.get(competency.id) ?? 0) : 0;
    const validationCounts = competency ? validationsByCompetency.get(competency.id) : undefined;
    const late = isOperationallyLate(stage, dueDate, now);
    const latestReview = competency ? reviewsByCompetency.get(competency.id) : undefined;
    const rowLike = {
      stage,
      late,
      openErrors: validationCounts?.errors ?? 0,
      openWarnings: validationCounts?.warnings ?? 0,
    };

    return {
      unit,
      competency,
      stage,
      attention: operationalAttention(rowLike),
      completionPercentage: competency?.completion_percentage ?? 0,
      filledIndicators,
      totalIndicators: totalIndicators ?? 0,
      requiredIndicators: requiredIndicators ?? 0,
      openErrors: validationCounts?.errors ?? 0,
      openWarnings: validationCounts?.warnings ?? 0,
      latestReviewAction: latestReview?.action ?? null,
      latestReviewComment: latestReview?.comment ?? null,
      latestReviewAt: latestReview?.created_at ?? null,
      dueDate: dueDate.toISOString(),
      late,
      daysLate: late ? daysBetweenDates(dueDate, now) : 0,
      actionHref: competency
        ? `/monitoramento/competencias/${competency.id}`
        : `/monitoramento/competencias/nova?unit_id=${unit.id}&form_version_id=${selectedFormVersion.id}&reference_year=${requestedYear}&reference_month=${requestedMonth}`,
      actionLabel: actionLabelForStage(stage, Boolean(competency)),
    };
  });

  const unitFilteredRows = filters.unitId === "all" ? allRows : allRows.filter((row) => row.unit.id === filters.unitId);
  const rows = unitFilteredRows.filter((row) => rowMatchesOperationalFilter(row, filters.status));

  return {
    filters,
    units: operationalUnits,
    formVersions: serviceFormVersions,
    selectedFormVersion,
    dueDate: dueDate.toISOString(),
    rows,
    allRows,
    summary: summarizeOperationalRows(allRows),
  };
}

export function summarizeOperationalRows(rows: OperationalUnitRow[]): OperationalMonitoringSummary {
  const totalCompletion = rows.reduce((sum, row) => sum + row.completionPercentage, 0);

  return {
    totalUnits: rows.length,
    notStarted: rows.filter((row) => row.stage === "not_started").length,
    filling: rows.filter((row) => row.stage === "filling").length,
    pendingReview: rows.filter((row) => row.stage === "pending_review").length,
    returned: rows.filter((row) => row.stage === "returned").length,
    reviewed: rows.filter((row) => row.stage === "reviewed").length,
    published: rows.filter((row) => row.stage === "published").length,
    cancelled: rows.filter((row) => row.stage === "cancelled").length,
    late: rows.filter((row) => row.late).length,
    openErrors: rows.reduce((sum, row) => sum + row.openErrors, 0),
    openWarnings: rows.reduce((sum, row) => sum + row.openWarnings, 0),
    averageCompletion: rows.length === 0 ? 0 : Math.round(totalCompletion / rows.length),
  };
}

async function loadOperationalChildren(competencyIds: UUID[]): Promise<[RawIndicatorValue[], RawValidation[], RawReview[]]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [[], [], []];
  }

  const [valuesResult, validationsResult, reviewsResult] = await Promise.all([
    supabase
      .from("indicator_values")
      .select("competency_id, value_status")
      .in("competency_id", competencyIds)
      .in("value_status", ["informed", "not_applicable"]),
    supabase
      .from("validation_results")
      .select("competency_id, severity, status")
      .in("competency_id", competencyIds)
      .eq("status", "open"),
    supabase
      .from("submission_reviews")
      .select("competency_id, action, comment, created_at")
      .in("competency_id", competencyIds)
      .order("created_at", { ascending: false }),
  ]);

  if (valuesResult.error || validationsResult.error || reviewsResult.error) {
    throw new Error("Não foi possível carregar pendências operacionais.");
  }

  return [
    (valuesResult.data ?? []) as RawIndicatorValue[],
    (validationsResult.data ?? []) as RawValidation[],
    (reviewsResult.data ?? []) as RawReview[],
  ];
}

function countValuesByCompetency(values: RawIndicatorValue[]): Map<UUID, number> {
  const counts = new Map<UUID, number>();

  for (const value of values) {
    counts.set(value.competency_id, (counts.get(value.competency_id) ?? 0) + 1);
  }

  return counts;
}

function countValidationsByCompetency(validations: RawValidation[]): Map<UUID, { errors: number; warnings: number }> {
  const counts = new Map<UUID, { errors: number; warnings: number }>();

  for (const validation of validations) {
    const current = counts.get(validation.competency_id) ?? { errors: 0, warnings: 0 };

    if (validation.severity === "error") {
      current.errors += 1;
    }

    if (validation.severity === "warning") {
      current.warnings += 1;
    }

    counts.set(validation.competency_id, current);
  }

  return counts;
}

function latestReviewByCompetency(reviews: RawReview[]): Map<UUID, RawReview> {
  const latest = new Map<UUID, RawReview>();

  for (const review of reviews) {
    if (!latest.has(review.competency_id)) {
      latest.set(review.competency_id, review);
    }
  }

  return latest;
}

function actionLabelForStage(stage: OperationalStage, hasCompetency: boolean): string {
  if (!hasCompetency) {
    return "Criar";
  }

  const labels: Record<OperationalStage, string> = {
    not_started: "Abrir",
    filling: "Preencher",
    pending_review: "Analisar",
    returned: "Corrigir",
    reviewed: "Abrir",
    published: "Ver",
    cancelled: "Ver",
  };

  return labels[stage];
}

function normalizeYear(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    return fallback;
  }

  return parsed;
}

function normalizeMonth(value: unknown, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 12) {
    return fallback;
  }

  return parsed;
}

function normalizeStatusFilter(value: unknown): OperationalStatusFilter {
  const allowed = new Set<OperationalStatusFilter>([
    "all",
    "not_started",
    "filling",
    "pending_review",
    "returned",
    "reviewed",
    "published",
    "late",
    "errors",
    "warnings",
  ]);

  return typeof value === "string" && allowed.has(value as OperationalStatusFilter) ? (value as OperationalStatusFilter) : "all";
}

function normalizeServiceTypeFilter(value: unknown): ServiceTypeFilter {
  if (value === "all") {
    return "all";
  }

  return normalizeServiceType(value);
}

function emptySummary(): OperationalMonitoringSummary {
  return {
    totalUnits: 0,
    notStarted: 0,
    filling: 0,
    pendingReview: 0,
    returned: 0,
    reviewed: 0,
    published: 0,
    cancelled: 0,
    late: 0,
    openErrors: 0,
    openWarnings: 0,
    averageCompletion: 0,
  };
}

function emptyOperationalMonitoringData(input?: Partial<OperationalMonitoringFilters>): OperationalMonitoringData {
  const now = new Date();
  const referenceYear = normalizeYear(input?.referenceYear, now.getFullYear());
  const referenceMonth = normalizeMonth(input?.referenceMonth, now.getMonth() + 1);

  return {
    filters: {
      serviceType: normalizeServiceTypeFilter(input?.serviceType),
      referenceYear,
      referenceMonth,
      formVersionId: input?.formVersionId ?? null,
      status: normalizeStatusFilter(input?.status),
      unitId: input?.unitId ?? "all",
    },
    units: [],
    formVersions: [],
    selectedFormVersion: null,
    dueDate: computeOperationalDueDate(referenceYear, referenceMonth).toISOString(),
    rows: [],
    allRows: [],
    summary: emptySummary(),
  };
}
