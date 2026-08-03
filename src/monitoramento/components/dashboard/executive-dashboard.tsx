"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  FileText,
  Info,
  Layers3,
  LineChart as LineChartIcon,
  ListChecks,
  Minus,
  PanelRightOpen,
  PieChart as PieChartIcon,
  RefreshCcw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/monitoramento/components/ui/badge";
import {
  buildMonthlyEvolution,
  buildStrategicCards,
  buildUnitComparison,
  computePublicationCoverage,
  filterPublishedSnapshots,
  type ExecutiveDashboardFilters,
  type ExecutiveIndicator,
  type ExecutivePublication,
  type ExecutiveSnapshot,
  type StrategicCardModel,
  type UnitComparisonRow,
} from "@/monitoramento/features/dashboard/executive";
import {
  operationalStageFromStatus,
  operationalStageLabel,
} from "@/monitoramento/features/monitoring/operational";
import { formatDateTime, monthLabel } from "@/monitoramento/lib/format";
import {
  EXECUTIVE_SERVICE_TYPES,
  normalizeServiceType,
  serviceTypeLabel,
  type ServiceTypeFilter,
} from "@/monitoramento/lib/service-types";
import { cn } from "@/monitoramento/lib/utils/cn";
import type { ExecutiveDashboardData } from "@/monitoramento/services/executive-dashboard";
import type { CompetencyStatus, UUID } from "@/monitoramento/types/domain";

const STATUS_COLORS = {
  published: "#059669",
  pending: "#d97706",
  review: "#0066CC",
  returned: "#dc2626",
} as const;

const selectWithIconClass =
  "h-11 w-full rounded-[12px] border border-blue-100 bg-white/92 py-2 pl-10 pr-8 text-sm font-medium text-blue-950 shadow-sm transition duration-200 hover:border-blue-200 hover:bg-blue-50/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const panelClass = "surface-card min-w-0 rounded-[var(--radius-xl)]";

const panelHeaderClass =
  "relative z-10 border-b border-blue-100 bg-white/72 px-4 py-3 backdrop-blur";

export function ExecutiveDashboard({ data }: { data: ExecutiveDashboardData }) {
  const [filters, setFilters] = useState<ExecutiveDashboardFilters>(() =>
    initialFilters(data),
  );
  const [focusedIndicatorId, setFocusedIndicatorId] = useState<UUID | null>(
    () =>
      firstIndicatorForFilters(data.indicators, initialFilters(data))?.id ??
      null,
  );
  const [drawerIndicatorId, setDrawerIndicatorId] = useState<UUID | null>(null);

  const filteredIndicators = useMemo(
    () => indicatorsForFilters(data.indicators, filters),
    [data.indicators, filters],
  );
  const cards = useMemo(
    () =>
      buildStrategicCards({
        indicators: data.indicators,
        snapshots: data.snapshots,
        filters,
      }),
    [data.indicators, data.snapshots, filters],
  );
  const coverage = useMemo(
    () =>
      computePublicationCoverage({
        units: data.units,
        competencies: data.competencies,
        filters,
      }),
    [data.competencies, data.units, filters],
  );
  const activeIndicator = useMemo(() => {
    const visible =
      filteredIndicators.find(
        (indicator) => indicator.id === focusedIndicatorId,
      ) ??
      filteredIndicators[0] ??
      null;
    return visible;
  }, [filteredIndicators, focusedIndicatorId]);
  const evolution = useMemo(
    () =>
      activeIndicator
        ? buildMonthlyEvolution({
            indicatorId: activeIndicator.id,
            snapshots: data.snapshots,
            filters,
          })
        : [],
    [activeIndicator, data.snapshots, filters],
  );
  const unitRows = useMemo(
    () =>
      activeIndicator
        ? buildUnitComparison({
            units: data.units,
            indicators: data.indicators,
            competencies: data.competencies,
            publications: data.publications,
            snapshots: data.snapshots,
            filters,
            indicatorId: activeIndicator.id,
          })
        : [],
    [
      activeIndicator,
      data.competencies,
      data.indicators,
      data.publications,
      data.snapshots,
      data.units,
      filters,
    ],
  );
  const filteredPublications = useMemo(
    () =>
      data.publications
        .filter((publication) =>
          publicationMatchesFilters(publication, filters),
        )
        .slice(0, 10),
    [data.publications, filters],
  );
  const drawerCard = useMemo(
    () => cards.find((card) => card.indicator.id === drawerIndicatorId) ?? null,
    [cards, drawerIndicatorId],
  );
  const indicatorSnapshotCount = filterPublishedSnapshots(
    data.snapshots,
    filters,
  ).length;

  function updateFilters(next: Partial<ExecutiveDashboardFilters>) {
    setFilters((current) => {
      const merged = { ...current, ...next };

      if (next.serviceType !== undefined) {
        merged.formVersionId = "all";
        merged.unitId = "all";
        merged.groupId = "all";
        merged.indicatorId = "all";
      }

      if (next.formVersionId !== undefined || next.groupId !== undefined) {
        merged.indicatorId = "all";
      }

      return merged;
    });
    setDrawerIndicatorId(null);
  }

  function selectIndicator(indicatorId: UUID | "all") {
    updateFilters({ indicatorId });
    setFocusedIndicatorId(
      indicatorId === "all" ? (filteredIndicators[0]?.id ?? null) : indicatorId,
    );
  }

  function resetFilters() {
    const nextFilters = initialFilters(data);

    setFilters(nextFilters);
    setFocusedIndicatorId(
      firstIndicatorForFilters(data.indicators, nextFilters)?.id ?? null,
    );
    setDrawerIndicatorId(null);
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        coverageStatus={coverage.status}
        data={data}
        filters={filters}
        published={coverage.publishedUnits}
        total={coverage.totalUnits}
      />

      <DashboardFilters
        data={data}
        filteredIndicators={filteredIndicators}
        filters={filters}
        onIndicatorChange={selectIndicator}
        onReset={resetFilters}
        onUpdate={updateFilters}
      />

      <MunicipalSummary
        coverage={{
          inReview: coverage.inReviewUnits,
          pending: coverage.pendingUnits,
          published: coverage.publishedUnits,
          returned: coverage.returnedUnits,
          total: coverage.totalUnits,
        }}
        indicatorSnapshotCount={indicatorSnapshotCount}
        latestPublication={filteredPublications[0] ?? null}
      />

      {cards.length > 0 ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <StrategicIndicatorCard
              card={card}
              key={card.indicator.id}
              onClick={() => {
                setFocusedIndicatorId(card.indicator.id);
                setDrawerIndicatorId(card.indicator.id);
              }}
            />
          ))}
        </section>
      ) : (
        <DashboardEmptyState
          icon={BarChart3}
          description="Nenhum indicador destacado foi encontrado para os filtros atuais."
          title="Sem indicadores estratégicos"
        />
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.72fr)]">
        <div className="space-y-5">
          <ChartPanel
            action={
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                Indicador
                <select
                  className="h-9 max-w-64 rounded-[10px] border border-blue-100 bg-white px-2 text-sm text-foreground shadow-sm transition hover:border-blue-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onChange={(event) =>
                    setFocusedIndicatorId(event.target.value)
                  }
                  value={activeIndicator?.id ?? ""}
                >
                  {filteredIndicators.map((indicator) => (
                    <option key={indicator.id} value={indicator.id}>
                      {indicator.displayName}
                    </option>
                  ))}
                </select>
              </label>
            }
            icon={LineChartIcon}
            subtitle="Série Jan-Dez calculada apenas com registros publicados."
            title="Evolução mensal"
          >
            <EvolutionChart data={evolution} />
          </ChartPanel>

          <UnitComparisonTable indicator={activeIndicator} rows={unitRows} />
        </div>

        <div className="space-y-5">
          <ChartPanel
            icon={PieChartIcon}
            subtitle="Mostra se a competência está completa ou parcial."
            title="Cobertura municipal"
          >
            <CoverageDonut coverage={coverage} />
          </ChartPanel>
          <PublicationTimeline
            publications={filteredPublications}
            snapshots={data.snapshots}
          />
        </div>
      </section>

      {drawerCard ? (
        <DrillDownDrawer
          card={drawerCard}
          filters={filters}
          onClose={() => setDrawerIndicatorId(null)}
          rows={buildUnitComparison({
            units: data.units,
            indicators: data.indicators,
            competencies: data.competencies,
            publications: data.publications,
            snapshots: data.snapshots,
            filters,
            indicatorId: drawerCard.indicator.id,
          })}
          snapshots={data.snapshots}
        />
      ) : null}
    </div>
  );
}

function DashboardHeader({
  coverageStatus,
  data,
  filters,
  published,
  total,
}: {
  coverageStatus: "complete" | "partial" | "empty";
  data: ExecutiveDashboardData;
  filters: ExecutiveDashboardFilters;
  published: number;
  total: number;
}) {
  const percent = coveragePercent(published, total);

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="surface-panel relative min-h-48 rounded-[var(--radius-2xl)] p-5 shadow-[var(--shadow-panel)]">
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">Somente dados publicados</Badge>
            <Badge
              tone={
                coverageStatus === "complete"
                  ? "success"
                  : coverageStatus === "empty"
                    ? "neutral"
                    : "warning"
              }
            >
              {coverageStatus === "complete"
                ? "Dados completos"
                : coverageStatus === "empty"
                  ? "Sem dados publicados"
                  : "Dados parciais"}
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-[1.15] text-blue-950">
            Dashboard executivo
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Centro de inteligência socioassistencial para leitura municipal,
            histórica e comparativa das publicações oficiais.
          </p>
        </div>
        <HeroAnalyticsIllustration />
      </div>

      <div className="surface-card rounded-[var(--radius-2xl)] p-5 shadow-[var(--shadow-card)]">
        <p className="relative z-10 text-sm font-semibold text-slate-700">
          Cobertura oficial
        </p>
        <div className="relative z-10 mt-5 flex items-center gap-5">
          <div
            className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#0066CC ${percent * 3.6}deg, #d8dee8 0deg)`,
            }}
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-xl font-bold text-blue-950">
              {percent}%
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-blue-950">
              {published} de {total}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              unidades publicadas
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 border-t border-blue-100 pt-4 text-xs text-muted-foreground">
          <div>
            <p className="font-semibold text-blue-950">
              {periodLabel(filters)}
            </p>
          </div>
          <div className="border-l border-blue-100 pl-3">
            <p>Atualizado em</p>
            <p className="font-semibold text-blue-950">
              {formatDateTime(data.loadedAt)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroAnalyticsIllustration() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 right-4 hidden h-40 w-[390px] opacity-90 lg:block"
      aria-hidden="true"
    >
      <div className="absolute bottom-2 right-0 h-28 w-72 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-[0_18px_40px_rgba(0,102,204,0.12)]" />
      <div className="absolute bottom-8 right-28 h-20 w-32 rounded-lg border border-blue-100 bg-white/90 p-3 shadow-sm">
        <div className="h-2 w-20 rounded-full bg-blue-200" />
        <div className="mt-4 flex h-10 items-end gap-2">
          <span className="h-4 w-4 rounded-sm bg-blue-300" />
          <span className="h-7 w-4 rounded-sm bg-blue-500" />
          <span className="h-10 w-4 rounded-sm bg-blue-700" />
          <span className="h-6 w-4 rounded-sm bg-cyan-300" />
        </div>
      </div>
      <div className="absolute bottom-11 right-7 h-20 w-24 rounded-lg border border-blue-100 bg-white/90 p-3 shadow-sm">
        <div className="mx-auto h-14 w-14 rounded-full border-[12px] border-blue-200 border-r-blue-600" />
      </div>
      <div className="absolute bottom-12 right-44 h-16 w-28 rounded-lg border border-blue-100 bg-white/95 p-3 shadow-sm">
        <div className="relative mt-5 h-6">
          <span className="absolute bottom-1 left-0 h-1 w-28 rotate-[-10deg] rounded-full bg-blue-300" />
          <span className="absolute bottom-2 left-5 h-1 w-20 rotate-[16deg] rounded-full bg-blue-600" />
        </div>
      </div>
      <div className="absolute right-52 top-2 h-9 w-9 rounded-full bg-blue-100" />
      <div className="absolute bottom-16 right-72 h-5 w-5 rounded-full bg-blue-200" />
    </div>
  );
}

function DashboardFilters({
  data,
  filteredIndicators,
  filters,
  onIndicatorChange,
  onReset,
  onUpdate,
}: {
  data: ExecutiveDashboardData;
  filteredIndicators: ExecutiveIndicator[];
  filters: ExecutiveDashboardFilters;
  onIndicatorChange: (indicatorId: UUID | "all") => void;
  onReset: () => void;
  onUpdate: (next: Partial<ExecutiveDashboardFilters>) => void;
}) {
  const years = availableYears(data, filters);
  const formVersions = data.formVersions.filter(
    (formVersion) =>
      filters.serviceType === "all" ||
      formVersion.service_type === filters.serviceType,
  );
  const units = data.units.filter(
    (unit) =>
      filters.serviceType === "all" || unit.unitType === filters.serviceType,
  );
  const groups = data.groups.filter((group) =>
    data.indicators.some(
      (indicator) =>
        indicator.groupId === group.id &&
        (filters.serviceType === "all" ||
          indicator.serviceType === filters.serviceType) &&
        (filters.formVersionId === "all" ||
          indicator.formVersionId === filters.formVersionId),
    ),
  );

  return (
    <section className="surface-card rounded-[var(--radius-xl)] p-4">
      <div className="relative z-10 mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-950">
          <span className="icon-surface inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-blue-800">
            <Filter className="h-4 w-4" aria-hidden="true" />
          </span>
          Filtros executivos
        </div>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[12px] border border-blue-100 bg-white/92 px-3 text-sm font-semibold text-blue-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary/20 active:translate-y-0 active:scale-[0.985]"
          onClick={onReset}
          type="button"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Limpar filtros
        </button>
      </div>
      <div className="relative z-10 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        <SelectField
          icon={Layers3}
          label="Setor"
          onChange={(value) =>
            onUpdate({ serviceType: value as ServiceTypeFilter })
          }
          value={filters.serviceType}
        >
          <option value="all">Todos</option>
          {EXECUTIVE_SERVICE_TYPES.map((serviceType) => (
            <option key={serviceType} value={serviceType}>
              {serviceTypeLabel(serviceType)}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={CalendarDays}
          label="Ano"
          onChange={(value) =>
            onUpdate({ year: value === "all" ? "all" : Number(value) })
          }
          value={filters.year}
        >
          <option value="all">Todos</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={CalendarDays}
          label="Competência"
          onChange={(value) =>
            onUpdate({ month: value === "all" ? "all" : Number(value) })
          }
          value={filters.month}
        >
          <option value="all">Todas</option>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {monthLabel(index + 1)}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={FileText}
          label="Formulário"
          onChange={(value) =>
            onUpdate({ formVersionId: value as UUID | "all" })
          }
          value={filters.formVersionId}
        >
          <option value="all">Todos</option>
          {formVersions.map((formVersion) => (
            <option key={formVersion.id} value={formVersion.id}>
              {formVersion.name} - {serviceTypeLabel(formVersion.service_type)}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={Building2}
          label="Unidade"
          onChange={(value) => onUpdate({ unitId: value as UUID | "all" })}
          value={filters.unitId}
        >
          <option value="all">Todos</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.acronym} - {serviceTypeLabel(unit.unitType)}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={Layers3}
          label="Grupo"
          onChange={(value) => onUpdate({ groupId: value as UUID | "all" })}
          value={filters.groupId}
        >
          <option value="all">Todos</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={BarChart3}
          label="Indicador"
          onChange={(value) => onIndicatorChange(value as UUID | "all")}
          value={filters.indicatorId}
        >
          <option value="all">Todos</option>
          {filteredIndicators.map((indicator) => (
            <option key={indicator.id} value={indicator.id}>
              {indicator.displayName}
            </option>
          ))}
        </SelectField>
      </div>
    </section>
  );
}

function SelectField({
  children,
  icon: Icon,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  icon: typeof Activity;
  label: string;
  onChange: (value: string) => void;
  value: number | string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      <span className="mb-1.5 block">{label}</span>
      <span className="relative block">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-700"
          aria-hidden="true"
        />
        <select
          className={selectWithIconClass}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {children}
        </select>
      </span>
    </label>
  );
}

function MunicipalSummary({
  coverage,
  indicatorSnapshotCount,
  latestPublication,
}: {
  coverage: {
    total: number;
    published: number;
    pending: number;
    returned: number;
    inReview: number;
  };
  indicatorSnapshotCount: number;
  latestPublication: ExecutivePublication | null;
}) {
  const items = [
    {
      description: "Total cadastrado",
      label: "Unidades",
      value: coverage.total,
      icon: Building2,
      tone: "neutral",
    },
    {
      description: "Total publicadas",
      label: "Publicadas",
      value: coverage.published,
      icon: CheckCircle2,
      tone: "success",
    },
    {
      description: "Aguardando envio",
      label: "Pendentes",
      value: coverage.pending,
      icon: Clock3,
      tone: coverage.pending > 0 ? "warning" : "success",
    },
    {
      description: "Em análise",
      label: "Em revisão",
      value: coverage.inReview,
      icon: ListChecks,
      tone: "info",
    },
    {
      description: "Com pendências",
      label: "Devolvidas",
      value: coverage.returned,
      icon: AlertTriangle,
      tone: coverage.returned > 0 ? "danger" : "neutral",
    },
    {
      description: "Total publicados",
      label: "Indicadores publicados",
      value: indicatorSnapshotCount,
      icon: BarChart3,
      tone: "purple",
    },
  ] as const;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            className={cn(
              "interactive-card relative min-h-28 overflow-hidden rounded-[var(--radius-xl)] border bg-white p-4 shadow-[var(--shadow-card)]",
              metricToneClass(item.tone),
            )}
            key={item.label}
          >
            <div className="relative z-10 flex items-start gap-3">
              <span
                className={cn(
                  "icon-surface inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]",
                  metricIconToneClass(item.tone),
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-950">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-950">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-8 h-28 w-28 rounded-full bg-white/55" />
          </div>
        );
      })}
      <div className="surface-card rounded-[var(--radius-xl)] border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 p-4 md:col-span-2 xl:col-span-6">
        <div className="relative z-10 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="icon-surface inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-emerald-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-blue-950">
                Última publicação oficial
              </p>
              <p className="text-sm text-muted-foreground">
                {latestPublication
                  ? `${monthLabel(latestPublication.referenceMonth)} ${latestPublication.referenceYear} - ${formatDateTime(latestPublication.publishedAt)}`
                  : "Nenhuma publicação registrada até o momento."}
              </p>
            </div>
          </div>
          <a
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[10px] border border-emerald-200 bg-white px-3 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-emerald-50"
            href="#publicacoes-recentes"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Ver histórico
          </a>
        </div>
      </div>
    </section>
  );
}

function StrategicIndicatorCard({
  card,
  onClick,
}: {
  card: StrategicCardModel;
  onClick: () => void;
}) {
  const TrendIcon =
    card.status === "increase"
      ? TrendingUp
      : card.status === "decrease"
        ? TrendingDown
        : card.status === "stable"
          ? Minus
          : Info;

  return (
    <button
      className={cn(
        "interactive-card min-h-44 min-w-0 rounded-[var(--radius-xl)] border border-l-4 bg-white p-4 text-left shadow-[var(--shadow-card)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        strategicToneClass(card.status),
      )}
      onClick={onClick}
      title="Abrir detalhamento do indicador"
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="line-clamp-2 break-words text-sm font-semibold leading-snug text-slate-950"
            title={card.indicator.code}
          >
            {card.indicator.displayName}
          </p>
        </div>
        <TrendIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      </div>
      <p className="mt-4 text-2xl font-bold">
        {formatMetric(card.value, card.indicator)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{card.indicator.unitOfMeasure}</span>
        <VariationPill card={card} />
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
        Detalhar
        <PanelRightOpen className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
    </button>
  );
}

function VariationPill({ card }: { card: StrategicCardModel }) {
  if (card.percentVariation === null) {
    return <span>Sem base anterior</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 rounded-full border px-2 py-0.5 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]",
        card.percentVariation >= 0
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {card.percentVariation >= 0 ? (
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
      )}
      {formatPercent(card.percentVariation)}
    </span>
  );
}

function ChartPanel({
  action,
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon: typeof Activity;
  subtitle: string;
  title: string;
}) {
  return (
    <section className={panelClass}>
      <div className="relative z-10 flex flex-col justify-between gap-3 border-b border-blue-100 bg-blue-50/30 px-4 py-3 sm:flex-row sm:items-start">
        <div className="flex items-start gap-2">
          <span className="icon-surface inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-blue-800">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-blue-950">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="relative z-10 h-80 p-4">{children}</div>
    </section>
  );
}

function EvolutionChart({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  if (data.every((point) => point.value === 0)) {
    return (
      <DashboardEmptyState
        compact
        icon={LineChartIcon}
        description="O indicador não possui valores publicados no período filtrado."
        title="Sem série histórica"
      />
    );
  }

  return (
    <ResponsiveContainer height="100%" width="100%">
      <AreaChart data={data} margin={{ bottom: 4, left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="executiveArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#0066CC" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0066CC" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={42} />
        <Tooltip />
        <Area
          dataKey="value"
          fill="url(#executiveArea)"
          name="Valor"
          stroke="#0066CC"
          strokeWidth={2.5}
          type="monotone"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CoverageDonut({
  coverage,
}: {
  coverage: ReturnType<typeof computePublicationCoverage>;
}) {
  const chartData = [
    {
      name: "Publicadas",
      value: coverage.publishedUnits,
      color: STATUS_COLORS.published,
    },
    {
      name: "Pendentes",
      value: coverage.pendingUnits,
      color: STATUS_COLORS.pending,
    },
    {
      name: "Em revisão",
      value: coverage.inReviewUnits,
      color: STATUS_COLORS.review,
    },
    {
      name: "Devolvidas",
      value: coverage.returnedUnits,
      color: STATUS_COLORS.returned,
    },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <DashboardEmptyState
        compact
        icon={PieChartIcon}
        description="Ainda não há competências para o filtro atual."
        title="Sem cobertura"
      />
    );
  }

  return (
    <ResponsiveContainer height="100%" width="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          innerRadius={68}
          nameKey="name"
          outerRadius={106}
          paddingAngle={3}
        >
          {chartData.map((entry) => (
            <Cell fill={entry.color} key={entry.name} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  );
}

function UnitComparisonTable({
  indicator,
  rows,
}: {
  indicator: ExecutiveIndicator | null;
  rows: UnitComparisonRow[];
}) {
  return (
    <section className={panelClass}>
      <div className={panelHeaderClass}>
        <h2 className="text-base font-semibold text-blue-950">
          Comparativo por unidade
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {indicator
            ? indicator.displayName
            : "Selecione um indicador estratégico"}{" "}
          - leitura comparativa sem classificação.
        </p>
      </div>
      {rows.length > 0 ? (
        <div className="monitoramento-table-scroll">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-blue-100 bg-slate-50/95 text-xs font-medium uppercase text-muted-foreground backdrop-blur">
              <tr>
                <th className="px-4 py-3">Unidade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Indicador</th>
                <th className="px-4 py-3">Indicadores estratégicos</th>
                <th className="px-4 py-3">Data de publicação</th>
                <th className="px-4 py-3">Última atualização</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  className="border-b border-blue-50 transition duration-200 odd:bg-white/55 even:bg-slate-50/30 hover:bg-blue-50/55 last:border-b-0"
                  key={row.unit.id}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">
                      {row.unit.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.unit.code}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    {formatMetric(row.value, indicator)}
                  </td>
                  <td className="px-4 py-3">
                    {row.strategicPublishedCount}/{row.strategicTotal}
                  </td>
                  <td className="px-4 py-3">
                    {row.publicationDate
                      ? formatDateTime(row.publicationDate)
                      : "Não publicada"}
                  </td>
                  <td className="px-4 py-3">
                    {row.updatedAt
                      ? formatDateTime(row.updatedAt)
                      : "Sem atividade"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4">
          <DashboardEmptyState
            compact
            icon={indicator ? Building2 : LineChartIcon}
            description={
              indicator
                ? "Nenhuma unidade encontrada para os filtros selecionados."
                : "Selecione um indicador estratégico para comparar as unidades."
            }
            title={
              indicator ? "Sem unidades no filtro" : "Indicador não selecionado"
            }
          />
        </div>
      )}
    </section>
  );
}

function PublicationTimeline({
  publications,
  snapshots,
}: {
  publications: ExecutivePublication[];
  snapshots: ExecutiveSnapshot[];
}) {
  return (
    <section className={panelClass} id="publicacoes-recentes">
      <div className={panelHeaderClass}>
        <div className="flex items-center gap-2">
          <span className="icon-surface inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-blue-800">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-blue-950">
            Publicações recentes
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Histórico oficial com versão, responsável e registro publicado.
        </p>
      </div>
      {publications.length > 0 ? (
        <div className="divide-y divide-blue-50">
          {publications.map((publication) => {
            const publicationSnapshots = snapshots.filter(
              (snapshot) => snapshot.publicationId === publication.id,
            );
            const indicatorCount = publicationSnapshots.filter(
              (snapshot) => snapshot.snapshotKind === "indicator_value",
            ).length;
            const observationCount = publicationSnapshots.filter(
              (snapshot) => snapshot.snapshotKind === "group_observation",
            ).length;

            return (
              <div
                className="p-4 transition hover:bg-blue-50/30"
                key={publication.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">
                      {monthLabel(publication.referenceMonth)}{" "}
                      {publication.referenceYear} - v{publication.versionNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Responsável:{" "}
                      {publication.publishedByName ?? "Não informado"} -{" "}
                      {formatDateTime(publication.publishedAt)}
                    </p>
                  </div>
                  <Badge tone="success">Atual</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <span>{indicatorCount} indicadores</span>
                  <span>{observationCount} observações</span>
                  <span>Snapshot {shortId(publication.id)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4">
          <DashboardEmptyState
            compact
            icon={CalendarDays}
            description="Nenhuma publicação oficial foi encontrada no filtro atual."
            title="Sem publicações recentes"
          />
        </div>
      )}
    </section>
  );
}

function DrillDownDrawer({
  card,
  filters,
  onClose,
  rows,
  snapshots,
}: {
  card: StrategicCardModel;
  filters: ExecutiveDashboardFilters;
  onClose: () => void;
  rows: UnitComparisonRow[];
  snapshots: ExecutiveSnapshot[];
}) {
  const history = buildMonthlyEvolution({
    indicatorId: card.indicator.id,
    snapshots,
    filters,
  });
  const distribution = rows.map((row) => ({
    name: row.unit.acronym,
    value: row.value ?? 0,
  }));
  const observations = snapshots
    .filter((snapshot) => snapshot.snapshotKind === "group_observation")
    .filter((snapshot) => snapshot.groupId === card.indicator.groupId)
    .filter((snapshot) => snapshotMatchesFilters(snapshot, filters))
    .filter((snapshot) => Boolean(snapshot.textValue))
    .slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Detalhamento do indicador"
    >
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
        aria-label="Fechar detalhamento"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-blue-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="border-b border-blue-100 bg-blue-50/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-blue-800">
                Detalhamento
              </p>
              <h2
                className="mt-1 text-xl font-bold text-slate-950"
                title={card.indicator.code}
              >
                {card.indicator.displayName}
              </h2>
            </div>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-blue-100 bg-white text-muted-foreground shadow-sm transition hover:bg-blue-50 hover:text-blue-800"
              onClick={onClose}
              title="Fechar"
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <DrawerMetric
              label="Valor atual"
              value={formatMetric(card.value, card.indicator)}
            />
            <DrawerMetric
              label="Competência anterior"
              value={formatMetric(card.previousValue, card.indicator)}
            />
            <DrawerMetric
              label="Variação"
              value={
                card.percentVariation === null
                  ? "Sem base"
                  : formatPercent(card.percentVariation)
              }
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 overflow-y-auto p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-blue-100 p-3 shadow-sm">
              <h3 className="text-sm font-bold text-blue-950">
                Histórico mensal
              </h3>
              <div className="mt-3 h-56">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart
                    data={history}
                    margin={{ bottom: 4, left: 0, right: 8, top: 8 }}
                  >
                    <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip />
                    <Line
                      dataKey="value"
                      dot={false}
                      name="Valor"
                      stroke="#0066CC"
                      strokeWidth={2.5}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-blue-100 p-3 shadow-sm">
              <h3 className="text-sm font-bold text-blue-950">
                Distribuição por unidade
              </h3>
              <div className="mt-3 h-56">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    data={distribution}
                    margin={{ bottom: 4, left: 0, right: 8, top: 8 }}
                  >
                    <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#0066CC"
                      name="Valor"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="monitoramento-table-scroll mt-4 rounded-lg border border-blue-100 shadow-sm">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-blue-100 bg-slate-50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Unidade</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Publicação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    className="border-b border-blue-50 transition hover:bg-blue-50/35 last:border-b-0"
                    key={row.unit.id}
                  >
                    <td className="px-3 py-2">{row.unit.acronym}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-2">
                      {formatMetric(row.value, card.indicator)}
                    </td>
                    <td className="px-3 py-2">
                      {row.publicationDate
                        ? formatDateTime(row.publicationDate)
                        : "Não publicada"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mt-4 rounded-lg border border-blue-100 p-3 shadow-sm">
            <h3 className="text-sm font-bold text-blue-950">
              Observações relacionadas
            </h3>
            <div className="mt-3 space-y-3">
              {observations.map((snapshot) => (
                <p
                  className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-muted-foreground"
                  key={snapshot.id}
                >
                  {snapshot.textValue}
                </p>
              ))}
              {observations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma observação publicada para o grupo deste indicador.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function DrawerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: CompetencyStatus | "not_started" }) {
  const stage = operationalStageFromStatus(status);
  const tone =
    stage === "published" || stage === "reviewed"
      ? "success"
      : stage === "returned" || stage === "cancelled"
        ? "danger"
        : stage === "pending_review" || stage === "filling"
          ? "info"
          : "neutral";

  return <Badge tone={tone}>{operationalStageLabel(stage)}</Badge>;
}

function DashboardEmptyState({
  compact = false,
  description,
  icon: Icon = Info,
  title,
}: {
  compact?: boolean;
  description: string;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-40 flex-col items-center justify-center rounded-[18px] border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_100%)] px-4 text-center shadow-[var(--shadow-card)]",
        compact ? "py-6" : "py-10",
      )}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-blue-100 bg-white text-blue-800 shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function initialFilters(
  data: ExecutiveDashboardData,
): ExecutiveDashboardFilters {
  const loadedAt = new Date(data.loadedAt);
  const latestPublication = data.publications[0] ?? null;
  const latestFormVersion = latestPublication
    ? data.formVersions.find(
        (formVersion) => formVersion.id === latestPublication.formVersionId,
      )
    : data.formVersions[0];

  return {
    serviceType: normalizeServiceType(
      latestPublication?.serviceType ?? latestFormVersion?.service_type,
    ),
    year:
      latestPublication?.referenceYear ??
      latestFormVersion?.year ??
      loadedAt.getFullYear(),
    month: latestPublication?.referenceMonth ?? loadedAt.getMonth() + 1,
    formVersionId:
      latestPublication?.formVersionId ?? latestFormVersion?.id ?? "all",
    unitId: "all",
    groupId: "all",
    indicatorId: "all",
  };
}

function firstIndicatorForFilters(
  indicators: ExecutiveIndicator[],
  filters: ExecutiveDashboardFilters,
): ExecutiveIndicator | null {
  return indicatorsForFilters(indicators, filters)[0] ?? null;
}

function indicatorsForFilters(
  indicators: ExecutiveIndicator[],
  filters: ExecutiveDashboardFilters,
): ExecutiveIndicator[] {
  return indicators
    .filter(
      (indicator) =>
        filters.serviceType === "all" ||
        indicator.serviceType === filters.serviceType,
    )
    .filter(
      (indicator) =>
        filters.formVersionId === "all" ||
        indicator.formVersionId === filters.formVersionId,
    )
    .filter(
      (indicator) =>
        filters.groupId === "all" || indicator.groupId === filters.groupId,
    )
    .filter(
      (indicator) =>
        filters.indicatorId === "all" || indicator.id === filters.indicatorId,
    );
}

function availableYears(
  data: ExecutiveDashboardData,
  filters: ExecutiveDashboardFilters,
): number[] {
  const formVersionYears = data.formVersions
    .filter(
      (formVersion) =>
        filters.serviceType === "all" ||
        formVersion.service_type === filters.serviceType,
    )
    .map((formVersion) => formVersion.year);
  const competencyYears = data.competencies
    .filter(
      (competency) =>
        filters.serviceType === "all" ||
        competency.serviceType === filters.serviceType,
    )
    .map((competency) => competency.referenceYear);

  return Array.from(new Set([...formVersionYears, ...competencyYears]))
    .filter((year) => Number.isInteger(year))
    .sort((a, b) => b - a);
}

function periodLabel(filters: ExecutiveDashboardFilters): string {
  if (filters.year === "all" && filters.month === "all") {
    return "Todas as competências";
  }

  if (filters.year !== "all" && filters.month === "all") {
    return `Ano ${filters.year}`;
  }

  if (filters.year === "all" && filters.month !== "all") {
    return monthLabel(filters.month);
  }

  const month = filters.month === "all" ? 1 : filters.month;
  const year = filters.year === "all" ? "" : filters.year;

  return `${monthLabel(month)} ${year}`;
}

function publicationMatchesFilters(
  publication: ExecutivePublication,
  filters: ExecutiveDashboardFilters,
): boolean {
  if (
    filters.serviceType !== "all" &&
    publication.serviceType !== filters.serviceType
  ) {
    return false;
  }

  if (filters.year !== "all" && publication.referenceYear !== filters.year) {
    return false;
  }

  if (filters.month !== "all" && publication.referenceMonth !== filters.month) {
    return false;
  }

  if (
    filters.formVersionId !== "all" &&
    publication.formVersionId !== filters.formVersionId
  ) {
    return false;
  }

  if (filters.unitId !== "all" && publication.unitId !== filters.unitId) {
    return false;
  }

  return true;
}

function snapshotMatchesFilters(
  snapshot: ExecutiveSnapshot,
  filters: ExecutiveDashboardFilters,
): boolean {
  if (
    filters.serviceType !== "all" &&
    snapshot.serviceType !== filters.serviceType
  ) {
    return false;
  }

  if (filters.year !== "all" && snapshot.referenceYear !== filters.year) {
    return false;
  }

  if (filters.month !== "all" && snapshot.referenceMonth !== filters.month) {
    return false;
  }

  if (
    filters.formVersionId !== "all" &&
    snapshot.formVersionId !== filters.formVersionId
  ) {
    return false;
  }

  if (filters.unitId !== "all" && snapshot.unitId !== filters.unitId) {
    return false;
  }

  return true;
}

function formatMetric(
  value: number | null,
  indicator: ExecutiveIndicator | null,
): string {
  if (value === null || !indicator) {
    return "Sem dado";
  }

  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: indicator.dataType === "integer" ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(value);

  return indicator.dataType === "percentage" ? `${formatted}%` : formatted;
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;
}

function coveragePercent(published: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((published / total) * 100);
}

function shortId(value: string): string {
  return value.slice(0, 8);
}

function metricToneClass(
  tone: "danger" | "info" | "neutral" | "purple" | "success" | "warning",
): string {
  const tones = {
    neutral: "border-blue-100 bg-gradient-to-br from-white to-blue-50/60",
    success: "border-emerald-200 bg-emerald-50/40",
    warning: "border-amber-200 bg-amber-50/40",
    danger: "border-red-200 bg-red-50/40",
    info: "border-blue-200 bg-blue-50/40",
    purple: "border-violet-200 bg-violet-50/40",
  } satisfies Record<string, string>;

  return tones[tone];
}

function metricIconToneClass(
  tone: "danger" | "info" | "neutral" | "purple" | "success" | "warning",
): string {
  const tones = {
    neutral: "bg-blue-50 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    purple: "bg-violet-100 text-violet-700",
  } satisfies Record<string, string>;

  return tones[tone];
}

function strategicToneClass(status: StrategicCardModel["status"]): string {
  const tones = {
    no_data: "border-blue-100 border-l-slate-300",
    stable: "border-blue-100 border-l-blue-500",
    increase: "border-emerald-200 border-l-emerald-500 bg-emerald-50/30",
    decrease: "border-amber-200 border-l-amber-500 bg-amber-50/30",
  } satisfies Record<StrategicCardModel["status"], string>;

  return tones[status];
}
