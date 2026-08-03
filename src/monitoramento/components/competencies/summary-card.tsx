"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileWarning,
  MessageSquareText,
} from "lucide-react";

import { Badge } from "@/monitoramento/components/ui/badge";
import { TextareaInput } from "@/monitoramento/components/competencies/textarea-input";
import { ValidationMessage } from "@/monitoramento/components/competencies/validation-message";
import type {
  FieldDraft,
  FieldMessage,
  ReviewSubmitResult,
  SpecialFieldDefinition,
  SubmissionReview,
} from "@/monitoramento/features/competencies/wizard/types";
import type { CompletionStats } from "@/monitoramento/features/competencies/wizard/utils";
import { formatDateTime } from "@/monitoramento/lib/format";

export type SummaryGroup = {
  id: string;
  label: string;
  total: number;
  filled: number;
  percent: number;
  errors: number;
  warnings: number;
};

export function SummaryCard({
  stats,
  groups,
  messages,
  observationsFilled,
  observationsTotal,
  specialFieldDefinitions,
  specialDrafts,
  reviewHistory,
  reviewResult,
  comment,
  warningJustification,
  canEditReviewText,
  onCommentChange,
  onWarningJustificationChange,
}: {
  stats: CompletionStats;
  groups: SummaryGroup[];
  messages: FieldMessage[];
  observationsFilled: number;
  observationsTotal: number;
  specialFieldDefinitions: SpecialFieldDefinition[];
  specialDrafts: Record<string, FieldDraft>;
  reviewHistory: SubmissionReview[];
  reviewResult: ReviewSubmitResult | null;
  comment: string;
  warningJustification: string;
  canEditReviewText: boolean;
  onCommentChange: (value: string) => void;
  onWarningJustificationChange: (value: string) => void;
}) {
  const errors = messages.filter((message) => message.severity === "error");
  const warnings = messages.filter((message) => message.severity === "warning");
  const filledSpecialFields = specialFieldDefinitions.filter((definition) => {
    const draft = specialDrafts[definition.id];
    return (
      draft?.valueStatus === "informed" ||
      draft?.valueStatus === "not_applicable"
    );
  });

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
        <div className="h-1 bg-[linear-gradient(90deg,#0066CC,#00A859,#FF9800)]" />
        <div className="p-4">
          <p className="text-sm font-bold uppercase tracking-normal text-blue-800">
            Revisão Final
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Conferência antes do envio
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Valide pendências, alertas, observações e campos especiais antes de
            enviar a competência para revisão.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={CheckCircle2}
          label="Preenchidos"
          value={`${stats.informed + stats.notApplicable}/${stats.total}`}
        />
        <Metric
          icon={Clock}
          label="Não informados"
          value={String(stats.empty)}
        />
        <Metric
          icon={FileWarning}
          label="Erros"
          tone={errors.length > 0 ? "danger" : "success"}
          value={String(errors.length)}
        />
        <Metric
          icon={AlertTriangle}
          label="Alertas"
          tone={warnings.length > 0 ? "warning" : "success"}
          value={String(warnings.length)}
        />
      </div>

      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold">Progresso geral</h3>
          <Badge tone={stats.empty === 0 ? "success" : "info"}>
            {stats.informed + stats.notApplicable} de {stats.total}
          </Badge>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blue-50">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#0066CC,#00A859)]"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {groups.map((group) => (
            <div
              className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm"
              key={group.id}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">
                  {group.label}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {group.filled}/{group.total} preenchidos
                {group.errors > 0 ? ` / ${group.errors} erros` : ""}
                {group.warnings > 0 ? ` / ${group.warnings} alertas` : ""}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-50">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${group.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquareText
              className="h-4 w-4 text-primary"
              aria-hidden="true"
            />
            <h3 className="text-base font-bold">Observações</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {observationsFilled} de {observationsTotal} grupos com observação
            registrada.
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold">Campos especiais</h3>
          {specialFieldDefinitions.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum campo especial confirmado no catálogo para esta versão do
              formulário.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {filledSpecialFields.length} de {specialFieldDefinitions.length}{" "}
              campos especiais habilitados preenchidos ou marcados como N/A.
            </p>
          )}
        </div>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold">Validações abertas</h3>
          <div className="mt-3 space-y-2">
            {[...errors.slice(0, 8), ...warnings.slice(0, 8)].map(
              (message, index) => (
                <ValidationMessage
                  key={`${message.code ?? "summary"}-${index}`}
                  message={message}
                />
              ),
            )}
          </div>
          {errors.length + warnings.length > 16 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Mostrando as primeiras 16 validações abertas.
            </p>
          ) : null}
        </div>
      )}

      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <h3 className="text-base font-bold">Envio para revisão</h3>
        <div className="mt-3 grid gap-3">
          <label className="block text-sm font-medium">
            Comentário para a revisão
            <TextareaInput
              className="mt-1 min-h-24"
              disabled={!canEditReviewText}
              maxLength={4000}
              onChange={(event) => onCommentChange(event.target.value)}
              value={comment}
            />
          </label>
          {warnings.length > 0 ? (
            <label className="block text-sm font-medium">
              Justificativa dos alertas
              <TextareaInput
                className="mt-1 min-h-24"
                disabled={!canEditReviewText}
                maxLength={4000}
                onChange={(event) =>
                  onWarningJustificationChange(event.target.value)
                }
                value={warningJustification}
              />
            </label>
          ) : null}
          {reviewResult && !reviewResult.ok ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
              {reviewResult.message}
            </p>
          ) : null}
          {reviewResult?.ok ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              Competência enviada para revisão em{" "}
              {formatDateTime(reviewResult.submittedAt)}.
            </p>
          ) : null}
        </div>
      </div>

      {reviewHistory.length > 0 ? (
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold">Histórico de revisão</h3>
          <div className="mt-3 space-y-3">
            {reviewHistory.slice(0, 6).map((review) => (
              <div
                className="rounded-lg border border-blue-100 p-3"
                key={review.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">
                    {reviewActionLabel(review.action)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(review.created_at)}
                  </span>
                </div>
                {review.comment ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    neutral: "border-blue-100 bg-white text-foreground",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-800",
  } satisfies Record<string, string>;

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function reviewActionLabel(action: SubmissionReview["action"]): string {
  const labels: Record<SubmissionReview["action"], string> = {
    submitted_for_review: "Enviada para revisão",
    approved: "Aprovada",
    returned_for_correction: "Devolvida para correção",
    publication_authorized: "Publicação autorizada",
    publication_rejected: "Publicação rejeitada",
  };

  return labels[action];
}
