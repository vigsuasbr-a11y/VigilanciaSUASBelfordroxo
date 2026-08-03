import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
  Home,
  House,
  Send,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/monitoramento/components/ui/badge";
import {
  groupStepLabel,
  type CompletionStats,
} from "@/monitoramento/features/competencies/wizard/utils";
import { monthLabel } from "@/monitoramento/lib/format";
import type { Competency, IndicatorGroup } from "@/monitoramento/types/domain";

const statusLabels: Record<Competency["status"], string> = {
  not_started: "Não iniciada",
  draft: "Rascunho",
  in_progress: "Em preenchimento",
  pending_review: "Em revisão",
  returned_for_correction: "Devolvida",
  reviewed: "Revisada",
  published: "Publicada",
  reopened: "Reaberta",
  cancelled: "Cancelada",
};

export function ProgressHeader({
  competency,
  stats,
  errors,
  warnings,
  currentGroup,
  currentStep,
  totalGroups,
  isSummaryStep,
}: {
  competency: Competency;
  stats: CompletionStats;
  errors: number;
  warnings: number;
  currentGroup?: IndicatorGroup | null;
  currentStep: number;
  totalGroups: number;
  isSummaryStep: boolean;
}) {
  const groupTitle = isSummaryStep
    ? "Revisão Final"
    : currentGroup
      ? groupStepLabel(currentGroup.display_order, currentGroup.name)
      : "Competência mensal";
  const eyebrow = isSummaryStep
    ? "REVISÃO"
    : currentGroup
      ? `GRUPO ${currentStep + 1}`
      : "COMPETÊNCIA";

  return (
    <header className="surface-panel rounded-[18px] shadow-[var(--shadow-panel)]">
      <div className="h-1.5 bg-[linear-gradient(90deg,#0066CC,#003D7A,#FF9800)]" />
      <div className="relative overflow-hidden p-5 lg:p-6">
        <div className="pointer-events-none absolute -right-12 bottom-0 hidden h-40 w-[430px] text-blue-100 lg:block">
          <div className="absolute bottom-0 right-0 h-36 w-72 rounded-t-full bg-blue-50" />
          <UsersRound
            className="absolute bottom-7 right-52 h-20 w-20 text-blue-300"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <House
            className="absolute bottom-5 right-16 h-24 w-24 text-blue-300"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <div className="absolute bottom-20 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-blue-300 shadow-sm">
            <Home className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Link
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50/70 px-3 py-1.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100/75 hover:text-blue-950"
              href="/monitoramento/competencias"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar competências
            </Link>
            <p className="text-sm font-semibold uppercase tracking-normal text-blue-700">
              {eyebrow}
            </p>
            <h1 className="mt-2 max-w-3xl text-2xl font-bold tracking-normal text-blue-950 sm:text-3xl">
              {groupTitle}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/70 px-3 font-semibold text-blue-900">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                {competency.units?.full_name ?? "Unidade não informada"}
              </span>
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-blue-100 bg-white/86 px-3 font-medium text-slate-700 shadow-sm">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {monthLabel(competency.reference_month)} /{" "}
                {competency.reference_year}
              </span>
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-blue-100 bg-white/86 px-3 font-medium text-slate-700 shadow-sm">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                {competency.form_versions?.name ?? "Formulário"}
              </span>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[340px] lg:grid-cols-1">
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <Badge
                tone={competency.status === "published" ? "success" : "info"}
              >
                {statusLabels[competency.status]}
              </Badge>
              <Badge tone="info">
                {isSummaryStep ? "Final" : `${currentStep + 1}/${totalGroups}`}
              </Badge>
              {errors > 0 ? <Badge tone="danger">{errors} erros</Badge> : null}
              {warnings > 0 ? (
                <Badge tone="warning">{warnings} alertas</Badge>
              ) : null}
              {competency.status === "pending_review" ? (
                <Badge tone="warning">
                  <Send className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  Enviada
                </Badge>
              ) : null}
            </div>

            <div className="rounded-[14px] border border-blue-100 bg-white/86 p-3 shadow-[var(--shadow-card)] backdrop-blur">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                <span>Progresso da competência</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-blue-50 shadow-inner">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#167be7,#12b76a)] shadow-[0_0_14px_rgba(22,123,231,0.28)] transition-all duration-300 ease-out"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {stats.informed + stats.notApplicable} de {stats.total} campos
                informados
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
