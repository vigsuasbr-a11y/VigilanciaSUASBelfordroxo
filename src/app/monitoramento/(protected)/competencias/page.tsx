import type { Route } from "next";
import Link from "next/link";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { EmptyState } from "@/monitoramento/components/ui/empty-state";
import { MetricCard } from "@/monitoramento/components/ui/metric-card";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { ProgressBar } from "@/monitoramento/components/ui/progress-bar";
import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/monitoramento/components/ui/status-badge";
import { monthLabel } from "@/monitoramento/lib/format";
import { listCompetencies } from "@/monitoramento/services/competencies";
import type { Competency, CompetencyStatus } from "@/monitoramento/types/domain";

const statusLabels: Record<CompetencyStatus, string> = {
  cancelled: "Cancelada",
  draft: "Rascunho",
  in_progress: "Em preenchimento",
  not_started: "Não iniciada",
  pending_review: "Em revisão",
  published: "Publicada",
  reopened: "Reaberta",
  returned_for_correction: "Devolvida",
  reviewed: "Revisada",
};

const primaryActionClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_26px_rgba(0,102,204,0.22)] transition hover:-translate-y-px hover:bg-blue-700";

const outlineActionClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[12px] border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 active:translate-y-0";

export default async function CompetenciesPage() {
  const competencies = await listCompetencies();
  const stats = buildCompetencyStats(competencies);
  const hasCompetencies = competencies.length > 0;

  return (
    <PageContainer wide>
      <PageHeader
        actions={
          <Link className={primaryActionClass} href="/monitoramento/competencias/nova">
            <AppIcon name="open" size="sm" />
            Nova competência
          </Link>
        }
        description="Abra competências mensais, acompanhe o andamento por unidade e continue o preenchimento sem perder o contexto."
        eyebrow="Fluxo mensal"
        icon="competencies"
        title="Competências"
        variant="operational"
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="Registros disponíveis para sua sessão"
          icon="competencies"
          label="Total de competências"
          tone="info"
          value={stats.total}
        />
        <MetricCard
          description="Unidades com dados em andamento"
          icon="edit"
          label="Em preenchimento"
          tone="warning"
          value={stats.filling}
        />
        <MetricCard
          description="Aguardando análise da Vigilância"
          icon="review"
          label="Em revisão"
          tone="neutral"
          value={stats.review}
        />
        <MetricCard
          description="Dados consolidados oficialmente"
          icon="publish"
          label="Publicadas"
          tone="success"
          value={stats.published}
        />
      </section>

      <section className="space-y-3">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-semibold text-blue-950">
              Competências abertas
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Lista das competências disponíveis conforme sua sessão e
              permissões. Use esta tela para retomar preenchimentos, revisar
              devoluções e consultar publicações.
            </p>
          </div>
          <StatusBadge icon="competencies" tone="info">
            {`${competencies.length} registros`}
          </StatusBadge>
        </div>

        {hasCompetencies ? (
          <DataTable minWidth="min-w-[980px]">
            <thead className={dataTableHeaderClass}>
              <tr>
                <th className={dataTableCellClass}>Competência</th>
                <th className={dataTableCellClass}>Unidade</th>
                <th className={dataTableCellClass}>Formulário</th>
                <th className={dataTableCellClass}>Status</th>
                <th className={dataTableCellClass}>Preenchimento</th>
                <th className={dataTableCellClass}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((competency) => (
                <tr className={dataTableRowClass} key={competency.id}>
                  <td className={dataTableCellClass}>
                    <Link
                      className="font-semibold text-primary hover:underline"
                      href={`/monitoramento/competencias/${competency.id}` as Route}
                    >
                      {monthLabel(competency.reference_month)} /{" "}
                      {competency.reference_year}
                    </Link>
                  </td>
                  <td className={dataTableCellClass}>
                    <p className="font-bold text-blue-950">
                      {competency.units?.full_name ?? "Unidade não informada"}
                    </p>
                    {competency.units?.acronym ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {competency.units.acronym}
                      </p>
                    ) : null}
                  </td>
                  <td className={dataTableCellClass}>
                    {competency.form_versions?.name ?? "Formulário"}
                  </td>
                  <td className={dataTableCellClass}>
                    <StatusBadge
                      icon={statusIcon(competency.status)}
                      tone={statusTone(competency.status)}
                    >
                      {statusLabels[competency.status]}
                    </StatusBadge>
                  </td>
                  <td className={dataTableCellClass}>
                    <div className="w-44 space-y-2">
                      <ProgressBar value={competency.completion_percentage} />
                      <p className="text-xs text-muted-foreground">
                        Andamento salvo automaticamente
                      </p>
                    </div>
                  </td>
                  <td className={dataTableCellClass}>
                    <Link
                      className={outlineActionClass}
                      href={`/monitoramento/competencias/${competency.id}` as Route}
                    >
                      {actionLabel(competency.status)}
                      <AppIcon name="forward" size="sm" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        ) : (
          <CompetenciesEmptyState />
        )}
      </section>
    </PageContainer>
  );
}

function CompetenciesEmptyState() {
  return (
    <EmptyState
      action={
        <Link className={primaryActionClass} href="/monitoramento/competencias/nova">
          <AppIcon name="open" size="sm" />
          Abrir primeira competência
        </Link>
      }
      className="px-5 py-6 sm:px-6"
      description={
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <p>
            O ambiente está pronto para iniciar um novo ciclo mensal. Ao abrir
            uma competência, o sistema carrega o formulário ativo, vincula a
            unidade correta e libera o acompanhamento no painel operacional.
          </p>
          <div className="grid gap-3 text-left sm:grid-cols-3">
            {[
              "Escolha o setor e a unidade de atendimento.",
              "Defina o mês de referência da competência.",
              "Acompanhe pendências e revisão pelo Operacional.",
            ].map((step, index) => (
              <div
                className="rounded-[14px] border border-blue-100 bg-white px-4 py-3 shadow-sm"
                key={step}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-800">
                  {index + 1}
                </span>
                <p className="mt-2 text-sm font-medium leading-5 text-slate-700">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      }
      icon="competencies"
      title="Nenhuma competência aberta"
    />
  );
}

function buildCompetencyStats(competencies: Competency[]) {
  return {
    total: competencies.length,
    filling: competencies.filter((competency) =>
      ["draft", "in_progress", "not_started", "reopened"].includes(
        competency.status,
      ),
    ).length,
    review: competencies.filter((competency) =>
      ["pending_review", "returned_for_correction"].includes(competency.status),
    ).length,
    published: competencies.filter((competency) =>
      ["published", "reviewed"].includes(competency.status),
    ).length,
  };
}

function actionLabel(status: CompetencyStatus) {
  if (status === "published" || status === "reviewed") {
    return "Consultar";
  }

  if (status === "pending_review") {
    return "Revisar";
  }

  return "Continuar";
}

function statusTone(status: CompetencyStatus): StatusBadgeTone {
  const tones: Record<CompetencyStatus, StatusBadgeTone> = {
    cancelled: "danger",
    draft: "neutral",
    in_progress: "info",
    not_started: "neutral",
    pending_review: "warning",
    published: "success",
    reopened: "info",
    returned_for_correction: "danger",
    reviewed: "success",
  };

  return tones[status];
}

function statusIcon(status: CompetencyStatus): AppIconName {
  if (status === "published" || status === "reviewed") {
    return "success";
  }

  if (status === "returned_for_correction" || status === "cancelled") {
    return "error";
  }

  if (status === "pending_review") {
    return "review";
  }

  return "pending";
}
