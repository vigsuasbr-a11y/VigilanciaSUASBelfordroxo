import type { CompetencyStatus, IndicatorDataType, UUID } from "@/monitoramento/types/domain";
import type { ServiceTypeFilter } from "@/monitoramento/lib/service-types";

export type ExecutiveDashboardFilters = {
  serviceType: ServiceTypeFilter;
  year: number | "all";
  month: number | "all";
  formVersionId: UUID | "all";
  unitId: UUID | "all";
  groupId: UUID | "all";
  indicatorId: UUID | "all";
};

export type ExecutiveUnit = {
  id: UUID;
  code: string;
  name: string;
  fullName: string;
  acronym: string;
  unitType: string;
  displayOrder: number;
};

export type ExecutiveGroup = {
  id: UUID;
  code: string;
  name: string;
  displayOrder: number;
};

export type ExecutiveIndicator = {
  id: UUID;
  formVersionId: UUID;
  serviceType: string;
  groupId: UUID;
  code: string;
  displayName: string;
  unitOfMeasure: string;
  dataType: IndicatorDataType;
  displayOrder: number;
  defaultPresentation: string | null;
};

export type ExecutiveCompetency = {
  id: UUID;
  unitId: UUID;
  formVersionId: UUID;
  serviceType: string;
  referenceYear: number;
  referenceMonth: number;
  status: CompetencyStatus;
  updatedAt: string;
};

export type ExecutivePublication = {
  id: UUID;
  competencyId: UUID;
  unitId: UUID;
  formVersionId: UUID;
  serviceType: string;
  referenceYear: number;
  referenceMonth: number;
  versionNumber: number;
  publishedBy: UUID | null;
  publishedByName: string | null;
  publishedAt: string;
  createdAt: string;
};

export type ExecutiveSnapshot = {
  id: UUID;
  publicationId: UUID;
  competencyId: UUID;
  unitId: UUID;
  formVersionId: UUID;
  serviceType: string;
  referenceYear: number;
  referenceMonth: number;
  snapshotKind: "indicator_value" | "special_field_value" | "group_observation";
  indicatorId: UUID | null;
  groupId: UUID | null;
  numericValue: number | null;
  textValue: string | null;
  valueStatus: "informed" | "not_informed" | "not_applicable" | null;
  notes: string | null;
  publishedAt: string;
};

export type StrategicCardModel = {
  indicator: ExecutiveIndicator;
  value: number | null;
  previousValue: number | null;
  absoluteVariation: number | null;
  percentVariation: number | null;
  status: "no_data" | "stable" | "increase" | "decrease";
};

export type MonthlyPoint = {
  month: number;
  label: string;
  value: number;
};

export type UnitComparisonRow = {
  unit: ExecutiveUnit;
  value: number | null;
  status: CompetencyStatus | "not_started";
  publicationDate: string | null;
  updatedAt: string | null;
  strategicPublishedCount: number;
  strategicTotal: number;
};

export type PublicationCoverage = {
  totalUnits: number;
  publishedUnits: number;
  pendingUnits: number;
  inReviewUnits: number;
  returnedUnits: number;
  status: "complete" | "partial" | "empty";
};

export type ExecutiveAlertRule = {
  id: string;
  enabled: boolean;
  type:
    | "partial_data"
    | "missing_publication"
    | "late_publication"
    | "zero_indicator"
    | "significant_increase"
    | "significant_decrease"
    | "special_fields_pending";
  severity: "info" | "warning" | "critical";
  thresholdPercent?: number;
};

export type ExecutiveAlert = {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  ruleId: string;
};

export const DEFAULT_EXECUTIVE_ALERT_RULES: ExecutiveAlertRule[] = [
  { id: "partial-data", enabled: true, type: "partial_data", severity: "warning" },
  { id: "missing-publication", enabled: true, type: "missing_publication", severity: "critical" },
  { id: "late-publication", enabled: true, type: "late_publication", severity: "critical" },
  { id: "zero-indicator", enabled: true, type: "zero_indicator", severity: "warning" },
  { id: "increase-30", enabled: true, type: "significant_increase", severity: "info", thresholdPercent: 30 },
  { id: "decrease-30", enabled: true, type: "significant_decrease", severity: "warning", thresholdPercent: 30 },
  { id: "special-fields-pending", enabled: true, type: "special_fields_pending", severity: "info" },
];

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] as const;

export function filterPublishedSnapshots(snapshots: ExecutiveSnapshot[], filters: ExecutiveDashboardFilters): ExecutiveSnapshot[] {
  return snapshots.filter((snapshot) => {
    if (snapshot.snapshotKind !== "indicator_value") {
      return false;
    }

    if (snapshot.valueStatus !== "informed" || snapshot.numericValue === null) {
      return false;
    }

    if (filters.year !== "all" && snapshot.referenceYear !== filters.year) {
      return false;
    }

    if (filters.serviceType !== "all" && snapshot.serviceType !== filters.serviceType) {
      return false;
    }

    if (filters.month !== "all" && snapshot.referenceMonth !== filters.month) {
      return false;
    }

    if (filters.formVersionId !== "all" && snapshot.formVersionId !== filters.formVersionId) {
      return false;
    }

    if (filters.unitId !== "all" && snapshot.unitId !== filters.unitId) {
      return false;
    }

    if (filters.groupId !== "all" && snapshot.groupId !== filters.groupId) {
      return false;
    }

    if (filters.indicatorId !== "all" && snapshot.indicatorId !== filters.indicatorId) {
      return false;
    }

    return true;
  });
}

export function buildStrategicCards(input: {
  indicators: ExecutiveIndicator[];
  snapshots: ExecutiveSnapshot[];
  filters: ExecutiveDashboardFilters;
}): StrategicCardModel[] {
  return input.indicators
    .filter((indicator) => indicatorMatchesFilters(indicator, input.filters))
    .filter((indicator) => input.filters.groupId === "all" || indicator.groupId === input.filters.groupId)
    .filter((indicator) => input.filters.indicatorId === "all" || indicator.id === input.filters.indicatorId)
    .map((indicator) => {
      const currentValue = sumIndicatorValue(input.snapshots, indicator.id, input.filters);
      const previousValue = sumIndicatorValue(input.snapshots, indicator.id, previousPeriodFilters(input.filters));
      const absoluteVariation = currentValue === null || previousValue === null ? null : currentValue - previousValue;
      const percentVariation =
        currentValue === null || previousValue === null || previousValue === 0
          ? null
          : ((currentValue - previousValue) / previousValue) * 100;

      return {
        indicator,
        value: currentValue,
        previousValue,
        absoluteVariation,
        percentVariation,
        status: cardStatus(currentValue, percentVariation),
      };
    });
}

export function buildMonthlyEvolution(input: {
  indicatorId: UUID;
  snapshots: ExecutiveSnapshot[];
  filters: ExecutiveDashboardFilters;
}): MonthlyPoint[] {
  const year = input.filters.year === "all" ? new Date().getFullYear() : input.filters.year;

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const value =
      sumIndicatorValue(input.snapshots, input.indicatorId, {
        ...input.filters,
        year,
        month,
        indicatorId: input.indicatorId,
      }) ?? 0;

    return { month, label: MONTH_LABELS[index], value };
  });
}

export function buildUnitComparison(input: {
  units: ExecutiveUnit[];
  indicators: ExecutiveIndicator[];
  competencies: ExecutiveCompetency[];
  publications: ExecutivePublication[];
  snapshots: ExecutiveSnapshot[];
  filters: ExecutiveDashboardFilters;
  indicatorId: UUID;
}): UnitComparisonRow[] {
  const relevantIndicators = input.indicators.filter((indicator) => indicatorMatchesFilters(indicator, input.filters));
  const relevantIndicatorIds = new Set(relevantIndicators.map((indicator) => indicator.id));
  const publicationsByUnit = latestPublicationByUnit(input.publications, input.filters);
  const competenciesByUnit = latestCompetencyByUnit(input.competencies, input.filters);

  return input.units
    .filter((unit) => input.filters.serviceType === "all" || unit.unitType === input.filters.serviceType)
    .filter((unit) => input.filters.unitId === "all" || unit.id === input.filters.unitId)
    .map((unit) => {
      const publication = publicationsByUnit.get(unit.id) ?? null;
      const competency = competenciesByUnit.get(unit.id) ?? null;
      const value = sumIndicatorValue(input.snapshots, input.indicatorId, {
        ...input.filters,
        unitId: unit.id,
        indicatorId: input.indicatorId,
      });
      const strategicPublishedCount = new Set(
        input.snapshots
          .filter((snapshot) => snapshot.unitId === unit.id)
          .filter((snapshot) => snapshot.snapshotKind === "indicator_value")
          .filter((snapshot) => snapshot.valueStatus === "informed")
          .filter((snapshot) => snapshot.indicatorId !== null && relevantIndicatorIds.has(snapshot.indicatorId))
          .filter((snapshot) => matchesPeriod(snapshot, input.filters))
          .map((snapshot) => snapshot.indicatorId),
      ).size;

      return {
        unit,
        value,
        status: competency?.status ?? "not_started",
        publicationDate: publication?.publishedAt ?? null,
        updatedAt: competency?.updatedAt ?? null,
        strategicPublishedCount,
        strategicTotal: relevantIndicators.length,
      };
    })
    .sort((a, b) => a.unit.displayOrder - b.unit.displayOrder);
}

export function computePublicationCoverage(input: {
  units: ExecutiveUnit[];
  competencies: ExecutiveCompetency[];
  filters: ExecutiveDashboardFilters;
}): PublicationCoverage {
  const relevantCompetencies = input.competencies.filter((competency) => competencyMatchesFilters(competency, input.filters));
  const publishedUnits = new Set(relevantCompetencies.filter((competency) => competency.status === "published").map((competency) => competency.unitId)).size;
  const inReviewUnits = new Set(relevantCompetencies.filter((competency) => competency.status === "pending_review").map((competency) => competency.unitId)).size;
  const returnedUnits = new Set(
    relevantCompetencies.filter((competency) => competency.status === "returned_for_correction").map((competency) => competency.unitId),
  ).size;
  const relevantUnits = input.units
    .filter((unit) => input.filters.serviceType === "all" || unit.unitType === input.filters.serviceType)
    .filter((unit) => input.filters.unitId === "all" || unit.id === input.filters.unitId);
  const totalUnits = relevantUnits.length;
  const pendingUnits = Math.max(totalUnits - publishedUnits, 0);

  return {
    totalUnits,
    publishedUnits,
    pendingUnits,
    inReviewUnits,
    returnedUnits,
    status: publishedUnits === 0 ? "empty" : publishedUnits === totalUnits ? "complete" : "partial",
  };
}

export function buildExecutiveAlerts(input: {
  rules: ExecutiveAlertRule[];
  coverage: PublicationCoverage;
  cards: StrategicCardModel[];
  pendingSpecialFields: number;
  dueDate: Date;
  today?: Date;
}): ExecutiveAlert[] {
  const alerts: ExecutiveAlert[] = [];
  const today = input.today ?? new Date();

  for (const rule of input.rules.filter((item) => item.enabled)) {
    if (rule.type === "partial_data" && input.coverage.status === "partial") {
      alerts.push({
        id: `${rule.id}-coverage`,
        title: "Dados parciais",
        description: `${input.coverage.publishedUnits} de ${input.coverage.totalUnits} unidades publicadas.`,
        severity: rule.severity,
        ruleId: rule.id,
      });
    }

    if (rule.type === "missing_publication" && input.coverage.pendingUnits > 0) {
      alerts.push({
        id: `${rule.id}-pending`,
        title: "Unidades sem publicação",
        description: `${input.coverage.pendingUnits} unidades ainda não possuem dados publicados para o filtro atual.`,
        severity: rule.severity,
        ruleId: rule.id,
      });
    }

    if (rule.type === "late_publication" && input.coverage.pendingUnits > 0 && today.getTime() > input.dueDate.getTime()) {
      alerts.push({
        id: `${rule.id}-late`,
        title: "Competência atrasada",
        description: "O prazo operacional passou e ainda existem unidades sem publicação.",
        severity: rule.severity,
        ruleId: rule.id,
      });
    }

    if (rule.type === "zero_indicator") {
      for (const card of input.cards.filter((item) => item.value === 0)) {
        alerts.push({
          id: `${rule.id}-${card.indicator.id}`,
          title: "Indicador zerado",
          description: `${card.indicator.displayName} esta com valor zero no filtro atual.`,
          severity: rule.severity,
          ruleId: rule.id,
        });
      }
    }

    if (rule.type === "significant_increase" || rule.type === "significant_decrease") {
      const threshold = rule.thresholdPercent ?? 30;
      for (const card of input.cards) {
        if (card.percentVariation === null) {
          continue;
        }

        const significantIncrease = rule.type === "significant_increase" && card.percentVariation >= threshold;
        const significantDecrease = rule.type === "significant_decrease" && card.percentVariation <= -threshold;

        if (significantIncrease || significantDecrease) {
          alerts.push({
            id: `${rule.id}-${card.indicator.id}`,
            title: significantIncrease ? "Aumento abrupto" : "Reducao abrupta",
            description: `${card.indicator.displayName} variou ${formatPercentValue(card.percentVariation)} frente à competência anterior.`,
            severity: rule.severity,
            ruleId: rule.id,
          });
        }
      }
    }

    if (rule.type === "special_fields_pending" && input.pendingSpecialFields > 0) {
      alerts.push({
        id: `${rule.id}-pending`,
        title: "Campos especiais pendentes",
        description: `${input.pendingSpecialFields} campos especiais seguem pendentes de confirmação no catálogo.`,
        severity: rule.severity,
        ruleId: rule.id,
      });
    }
  }

  return alerts.slice(0, 12);
}

export function previousPeriodFilters(filters: ExecutiveDashboardFilters): ExecutiveDashboardFilters {
  if (filters.month === "all" || filters.year === "all") {
    return filters;
  }

  if (filters.month === 1) {
    return { ...filters, year: filters.year - 1, month: 12 };
  }

  return { ...filters, month: filters.month - 1 };
}

export function sumIndicatorValue(
  snapshots: ExecutiveSnapshot[],
  indicatorId: UUID,
  filters: ExecutiveDashboardFilters,
): number | null {
  const values = filterPublishedSnapshots(snapshots, { ...filters, indicatorId })
    .map((snapshot) => snapshot.numericValue)
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0);
}

function cardStatus(value: number | null, percentVariation: number | null): StrategicCardModel["status"] {
  if (value === null) {
    return "no_data";
  }

  if (percentVariation === null || Math.abs(percentVariation) < 5) {
    return "stable";
  }

  return percentVariation > 0 ? "increase" : "decrease";
}

function latestCompetencyByUnit(
  competencies: ExecutiveCompetency[],
  filters: ExecutiveDashboardFilters,
): Map<UUID, ExecutiveCompetency> {
  const result = new Map<UUID, ExecutiveCompetency>();

  for (const competency of competencies.filter((item) => competencyMatchesFilters(item, filters))) {
    const current = result.get(competency.unitId);

    if (!current || new Date(competency.updatedAt).getTime() > new Date(current.updatedAt).getTime()) {
      result.set(competency.unitId, competency);
    }
  }

  return result;
}

function latestPublicationByUnit(
  publications: ExecutivePublication[],
  filters: ExecutiveDashboardFilters,
): Map<UUID, ExecutivePublication> {
  const result = new Map<UUID, ExecutivePublication>();

  for (const publication of publications.filter((item) => publicationMatchesFilters(item, filters))) {
    const current = result.get(publication.unitId);

    if (!current || new Date(publication.publishedAt).getTime() > new Date(current.publishedAt).getTime()) {
      result.set(publication.unitId, publication);
    }
  }

  return result;
}

function matchesPeriod(snapshot: ExecutiveSnapshot, filters: ExecutiveDashboardFilters): boolean {
  if (filters.serviceType !== "all" && snapshot.serviceType !== filters.serviceType) {
    return false;
  }

  if (filters.year !== "all" && snapshot.referenceYear !== filters.year) {
    return false;
  }

  if (filters.month !== "all" && snapshot.referenceMonth !== filters.month) {
    return false;
  }

  if (filters.formVersionId !== "all" && snapshot.formVersionId !== filters.formVersionId) {
    return false;
  }

  return true;
}

function indicatorMatchesFilters(indicator: ExecutiveIndicator, filters: ExecutiveDashboardFilters): boolean {
  if (filters.serviceType !== "all" && indicator.serviceType !== filters.serviceType) {
    return false;
  }

  if (filters.formVersionId !== "all" && indicator.formVersionId !== filters.formVersionId) {
    return false;
  }

  return true;
}

function competencyMatchesFilters(competency: ExecutiveCompetency, filters: ExecutiveDashboardFilters): boolean {
  if (filters.serviceType !== "all" && competency.serviceType !== filters.serviceType) {
    return false;
  }

  if (filters.year !== "all" && competency.referenceYear !== filters.year) {
    return false;
  }

  if (filters.month !== "all" && competency.referenceMonth !== filters.month) {
    return false;
  }

  if (filters.formVersionId !== "all" && competency.formVersionId !== filters.formVersionId) {
    return false;
  }

  if (filters.unitId !== "all" && competency.unitId !== filters.unitId) {
    return false;
  }

  return true;
}

function publicationMatchesFilters(publication: ExecutivePublication, filters: ExecutiveDashboardFilters): boolean {
  if (filters.serviceType !== "all" && publication.serviceType !== filters.serviceType) {
    return false;
  }

  if (filters.year !== "all" && publication.referenceYear !== filters.year) {
    return false;
  }

  if (filters.month !== "all" && publication.referenceMonth !== filters.month) {
    return false;
  }

  if (filters.formVersionId !== "all" && publication.formVersionId !== filters.formVersionId) {
    return false;
  }

  if (filters.unitId !== "all" && publication.unitId !== filters.unitId) {
    return false;
  }

  return true;
}

function formatPercentValue(value: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;
}
