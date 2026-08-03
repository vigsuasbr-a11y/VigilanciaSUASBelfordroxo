import type { Route } from "next";
import Link from "next/link";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { Button } from "@/monitoramento/components/ui/button";
import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { EmptyState } from "@/monitoramento/components/ui/empty-state";
import { FilterBar } from "@/monitoramento/components/ui/filter-bar";
import { MetricCard } from "@/monitoramento/components/ui/metric-card";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { ProgressBar } from "@/monitoramento/components/ui/progress-bar";
import { SectionCard } from "@/monitoramento/components/ui/section-card";
import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/monitoramento/components/ui/status-badge";
import {
  OPERATIONAL_STATUS_FILTERS,
  operationalStageLabel,
} from "@/monitoramento/features/monitoring/operational";
import { formatDateTime, monthLabel } from "@/monitoramento/lib/format";
import { SERVICE_TYPES, serviceTypeLabel } from "@/monitoramento/lib/service-types";
import type {
  OperationalMonitoringData,
  OperationalMonitoringSummary,
  OperationalUnitRow,
} from "@/monitoramento/services/operational-monitoring";

const fieldControlClass =
  "mt-1 h-11 w-full rounded-[12px] border border-blue-100 bg-white/92 px-3 text-sm font-medium text-blue-950 shadow-sm transition duration-200 hover:border-blue-200 hover:bg-blue-50/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const outlineActionClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[12px] border border-blue-100 bg-white/92 px-3 py-2 text-sm font-semibold text-blue-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 active:translate-y-0 active:scale-[0.985]";

export function OperationalMonitoringView({
  data,
}: {
  data: OperationalMonitoringData;
}) {
  const attentionRows = data.allRows
    .filter((row) => row.attention !== "ok" || row.stage === "pending_review")
    .sort((a, b) => attentionWeight(b) - attentionWeight(a))
    .slice(0, 8);

  return (
    <PageContainer wide>
      <PageHeader
        actions={
          <StatusBadge icon="time" tone="info">
            {`Prazo: ${formatShortDate(data.dueDate)}`}
          </StatusBadge>
        }
        badge={
          <StatusBadge icon="operational" tone="success">
            Fase 4A
          </StatusBadge>
        }
        description="Acompanhe quais unidades já iniciaram, quais precisam de atenção e onde a Vigilância deve agir no fluxo mensal."
        eyebrow="Monitoramento"
        icon="operational"
        title="Monitoramento operacional"
        variant="operational"
      />

      <OperationalFilterForm data={data} />

      {!data.selectedFormVersion ? (
        <section className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <AppIcon className="mt-0.5" name="alert" size="sm" />
          <div>
            <p className="font-semibold">Nenhum formulário ativo encontrado.</p>
            <p className="mt-1">
              Revise os filtros ou ative uma versão de formulário para esse
              setor.
            </p>
          </div>
        </section>
      ) : null}

      <OperationalSummaryCards summary={data.summary} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <OperationalUnitTable rows={data.rows} />
        <OperationalAttentionPanel rows={attentionRows} />
      </div>
    </PageContainer>
  );
}

function OperationalFilterForm({ data }: { data: OperationalMonitoringData }) {
  return (
    <form method="get">
      <FilterBar
        actions={
          <>
            <Button type="submit">
              <AppIcon name="filter" size="sm" />
              Aplicar filtros
            </Button>
            <Link className={outlineActionClass} href="/monitoramento/operacional">
              <AppIcon name="refresh" size="sm" />
              Limpar filtros
            </Link>
          </>
        }
        chips={
          <>
            <StatusBadge icon="unit" tone="neutral">
              {serviceFilterLabel(data.filters.serviceType)}
            </StatusBadge>
            <StatusBadge icon="calendar" tone="neutral">
              {`${monthLabel(data.filters.referenceMonth)} / ${data.filters.referenceYear}`}
            </StatusBadge>
            <StatusBadge icon="pending" tone="neutral">
              {activeStatusLabel(data.filters.status)}
            </StatusBadge>
          </>
        }
        title="Filtros operacionais"
      >
        <label className="block text-sm font-bold text-slate-800">
          Setor
          <select
            className={fieldControlClass}
            defaultValue={data.filters.serviceType}
            name="service_type"
          >
            <option value="all">Todos</option>
            {SERVICE_TYPES.map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {serviceTypeLabel(serviceType)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-800">
          Ano
          <input
            className={fieldControlClass}
            defaultValue={data.filters.referenceYear}
            max={2100}
            min={2000}
            name="reference_year"
            type="number"
          />
        </label>

        <label className="block text-sm font-bold text-slate-800">
          Mês
          <select
            className={fieldControlClass}
            defaultValue={data.filters.referenceMonth}
            name="reference_month"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {monthLabel(index + 1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-800">
          Formulário
          <select
            className={fieldControlClass}
            defaultValue={data.filters.formVersionId ?? ""}
            name="form_version_id"
          >
            <option value="">Formulário ativo</option>
            {data.formVersions.map((formVersion) => (
              <option key={formVersion.id} value={formVersion.id}>
                {formVersion.name} -{" "}
                {serviceTypeLabel(formVersion.service_type)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-800">
          Unidade
          <select
            className={fieldControlClass}
            defaultValue={data.filters.unitId}
            name="unit_id"
          >
            <option value="all">Todas</option>
            {data.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.acronym}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-800">
          Status
          <select
            className={fieldControlClass}
            defaultValue={data.filters.status}
            name="status"
          >
            {OPERATIONAL_STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>
      </FilterBar>
    </form>
  );
}

function OperationalSummaryCards({
  summary,
}: {
  summary: OperationalMonitoringSummary;
}) {
  const cards = [
    {
      description: "No filtro atual",
      icon: "units",
      label: "Unidades",
      tone: "neutral",
      value: summary.totalUnits,
    },
    {
      description: "Ainda sem preenchimento",
      icon: "pending",
      label: "Não iniciadas",
      tone: summary.notStarted > 0 ? "warning" : "success",
      value: summary.notStarted,
    },
    {
      description: "Em andamento",
      icon: "edit",
      label: "Em preenchimento",
      tone: "info",
      value: summary.filling,
    },
    {
      description: "Aguardam análise",
      icon: "review",
      label: "Em revisão",
      tone: "info",
      value: summary.pendingReview,
    },
    {
      description: "Precisam de correção",
      icon: "error",
      label: "Devolvidas",
      tone: summary.returned > 0 ? "danger" : "neutral",
      value: summary.returned,
    },
    {
      description: "Finalizadas oficialmente",
      icon: "publish",
      label: "Publicadas",
      tone: "success",
      value: summary.published,
    },
    {
      description: "Fora do prazo",
      icon: "time",
      label: "Atrasadas",
      tone: summary.late > 0 ? "danger" : "success",
      value: summary.late,
    },
    {
      description: "Erros e alertas abertos",
      icon: "alert",
      label: "Pendências",
      tone:
        summary.openErrors + summary.openWarnings > 0 ? "warning" : "success",
      value: summary.openErrors + summary.openWarnings,
    },
  ] as const;

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard
          description={card.description}
          icon={card.icon}
          key={card.label}
          label={card.label}
          tone={card.tone}
          value={card.value}
        />
      ))}
    </section>
  );
}

function OperationalUnitTable({ rows }: { rows: OperationalUnitRow[] }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">
            Unidades acompanhadas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} unidades encontradas para os filtros atuais.
          </p>
        </div>
        <StatusBadge icon="unit" tone="info">
          Entrega mensal
        </StatusBadge>
      </div>

      <DataTable
        empty={
          rows.length === 0 ? (
            <EmptyState
              action={
                <Link
                  className={outlineActionClass}
                  href={"/monitoramento/competencias/nova" as Route}
                >
                  Abrir competência
                  <AppIcon name="forward" size="sm" />
                </Link>
              }
              description="Nenhuma unidade foi encontrada com os filtros atuais. Revise setor, formulário e mês de referência ou abra uma nova competência mensal."
              icon="unit"
              title="Nenhuma unidade encontrada"
            />
          ) : null
        }
        minWidth="min-w-[1080px]"
      >
        <thead className={dataTableHeaderClass}>
          <tr>
            <th className={dataTableCellClass}>Unidade</th>
            <th className={dataTableCellClass}>Status</th>
            <th className={dataTableCellClass}>Preenchimento</th>
            <th className={dataTableCellClass}>Validações</th>
            <th className={dataTableCellClass}>Prazo</th>
            <th className={dataTableCellClass}>Última atividade</th>
            <th className={dataTableCellClass}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className={dataTableRowClass} key={row.unit.id}>
              <td className={dataTableCellClass}>
                <p className="font-semibold text-blue-950">
                  {row.unit.full_name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.unit.acronym} · {row.unit.code}
                </p>
              </td>
              <td className={dataTableCellClass}>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    icon={stageIcon(row.stage, row.attention)}
                    tone={stageTone(row.stage, row.attention)}
                  >
                    {operationalStageLabel(row.stage)}
                  </StatusBadge>
                  {row.late ? (
                    <StatusBadge icon="time" tone="danger">
                      {`${row.daysLate} dias`}
                    </StatusBadge>
                  ) : null}
                </div>
              </td>
              <td className={dataTableCellClass}>
                <div className="w-56 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground">
                    {`${row.filledIndicators} de ${row.totalIndicators} campos informados`}
                  </p>
                  <ProgressBar value={row.completionPercentage} />
                </div>
              </td>
              <td className={dataTableCellClass}>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    icon={row.openErrors > 0 ? "error" : "success"}
                    tone={row.openErrors > 0 ? "danger" : "neutral"}
                  >
                    {`${row.openErrors} erros`}
                  </StatusBadge>
                  <StatusBadge
                    icon={row.openWarnings > 0 ? "alert" : "success"}
                    tone={row.openWarnings > 0 ? "warning" : "neutral"}
                  >
                    {`${row.openWarnings} alertas`}
                  </StatusBadge>
                </div>
              </td>
              <td className={dataTableCellClass}>
                {formatShortDate(row.dueDate)}
              </td>
              <td className={dataTableCellClass}>
                {row.competency
                  ? formatDateTime(row.competency.updated_at)
                  : "Sem competência aberta"}
              </td>
              <td className={dataTableCellClass}>
                <Link
                  className={outlineActionClass}
                  href={row.actionHref as Route}
                >
                  {row.actionLabel}
                  <AppIcon name="forward" size="sm" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function OperationalAttentionPanel({ rows }: { rows: OperationalUnitRow[] }) {
  return (
    <SectionCard
      description="Pendências, atrasos e itens que merecem acompanhamento pela Vigilância."
      icon="alert"
      title="Atenção operacional"
    >
      <div className="space-y-3">
        {rows.map((row) => (
          <article
            className="rounded-[var(--radius-lg)] border border-blue-100 bg-white p-3 shadow-sm"
            key={row.unit.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-blue-950">
                  {row.unit.acronym}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {operationalStageLabel(row.stage)}
                </p>
              </div>
              <StatusBadge
                icon={attentionIcon(row.attention)}
                tone={attentionTone(row.attention)}
              >
                {attentionLabel(row.attention)}
              </StatusBadge>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {attentionReason(row)}
            </p>
            {row.latestReviewComment ? (
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap rounded-[var(--radius-md)] bg-blue-50 px-3 py-2 text-xs leading-5 text-slate-700">
                {row.latestReviewComment}
              </p>
            ) : null}
            <Link
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              href={row.actionHref as Route}
            >
              {row.actionLabel}
              <AppIcon name="forward" size="xs" />
            </Link>
          </article>
        ))}
        {rows.length === 0 ? (
          <EmptyState
            description="Nenhuma pendência crítica apareceu no filtro atual. Acompanhe apenas novas entregas, devoluções e publicações do ciclo mensal."
            icon="success"
            tone="success"
            title="Tudo em ordem"
          />
        ) : null}
      </div>
    </SectionCard>
  );
}

function activeStatusLabel(value: string): string {
  return (
    OPERATIONAL_STATUS_FILTERS.find((filter) => filter.value === value)
      ?.label ?? "Todos"
  );
}

function serviceFilterLabel(value: string): string {
  return value === "all" ? "Todos os setores" : serviceTypeLabel(value);
}

function stageTone(
  stage: OperationalUnitRow["stage"],
  attention: OperationalUnitRow["attention"],
): StatusBadgeTone {
  if (attention === "critical") {
    return "danger";
  }

  if (stage === "published" || stage === "reviewed") {
    return "success";
  }

  if (stage === "pending_review" || stage === "filling") {
    return "info";
  }

  if (attention === "warning") {
    return "warning";
  }

  return "neutral";
}

function stageIcon(
  stage: OperationalUnitRow["stage"],
  attention: OperationalUnitRow["attention"],
): AppIconName {
  if (attention === "critical") {
    return "error";
  }

  if (stage === "published" || stage === "reviewed") {
    return "success";
  }

  if (stage === "pending_review") {
    return "review";
  }

  if (stage === "filling") {
    return "edit";
  }

  return "pending";
}

function attentionTone(
  attention: OperationalUnitRow["attention"],
): StatusBadgeTone {
  if (attention === "critical") {
    return "danger";
  }

  if (attention === "warning") {
    return "warning";
  }

  return "success";
}

function attentionIcon(
  attention: OperationalUnitRow["attention"],
): AppIconName {
  if (attention === "critical") {
    return "error";
  }

  if (attention === "warning") {
    return "alert";
  }

  return "success";
}

function attentionLabel(attention: OperationalUnitRow["attention"]): string {
  if (attention === "critical") {
    return "Crítico";
  }

  if (attention === "warning") {
    return "Acompanhar";
  }

  return "Ok";
}

function attentionReason(row: OperationalUnitRow): string {
  if (row.late) {
    return `Entrega atrasada há ${row.daysLate} dias.`;
  }

  if (row.openErrors > 0) {
    return `${row.openErrors} erros abertos bloqueiam o fluxo.`;
  }

  if (row.stage === "returned") {
    return "Competência devolvida para correção.";
  }

  if (row.openWarnings > 0) {
    return `${row.openWarnings} alertas precisam ser justificados ou acompanhados.`;
  }

  if (row.stage === "pending_review") {
    return "Aguardando revisão da Vigilância.";
  }

  return "Sem pendência operacional relevante.";
}

function attentionWeight(row: OperationalUnitRow): number {
  if (row.late) {
    return 50 + row.daysLate;
  }

  if (row.openErrors > 0) {
    return 40 + row.openErrors;
  }

  if (row.stage === "returned") {
    return 35;
  }

  if (row.openWarnings > 0) {
    return 20 + row.openWarnings;
  }

  if (row.stage === "pending_review") {
    return 10;
  }

  return 0;
}

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
