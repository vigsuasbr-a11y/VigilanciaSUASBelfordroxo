import type { CompetencyStatus } from "@/monitoramento/types/domain";

export type OperationalStage =
  | "not_started"
  | "filling"
  | "pending_review"
  | "returned"
  | "reviewed"
  | "published"
  | "cancelled";

export type OperationalAttention = "ok" | "warning" | "critical";

export type OperationalStatusFilter =
  | "all"
  | "not_started"
  | "filling"
  | "pending_review"
  | "returned"
  | "reviewed"
  | "published"
  | "late"
  | "errors"
  | "warnings";

export type OperationalRowLike = {
  stage: OperationalStage;
  late: boolean;
  openErrors: number;
  openWarnings: number;
};

export const OPERATIONAL_STATUS_FILTERS: Array<{ value: OperationalStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "not_started", label: "Não iniciadas" },
  { value: "filling", label: "Em preenchimento" },
  { value: "pending_review", label: "Em revisão" },
  { value: "returned", label: "Devolvidas" },
  { value: "reviewed", label: "Revisadas" },
  { value: "published", label: "Publicadas" },
  { value: "late", label: "Atrasadas" },
  { value: "errors", label: "Com erros" },
  { value: "warnings", label: "Com alertas" },
];

export function operationalStageFromStatus(status: CompetencyStatus | "not_started" | null | undefined): OperationalStage {
  if (!status || status === "not_started") {
    return "not_started";
  }

  if (status === "draft" || status === "in_progress" || status === "reopened") {
    return "filling";
  }

  if (status === "pending_review") {
    return "pending_review";
  }

  if (status === "returned_for_correction") {
    return "returned";
  }

  if (status === "reviewed") {
    return "reviewed";
  }

  if (status === "published") {
    return "published";
  }

  return "cancelled";
}

export function operationalStageLabel(stage: OperationalStage): string {
  const labels: Record<OperationalStage, string> = {
    not_started: "Não iniciada",
    filling: "Em preenchimento",
    pending_review: "Em revisão",
    returned: "Devolvida",
    reviewed: "Revisada",
    published: "Publicada",
    cancelled: "Cancelada",
  };

  return labels[stage];
}

export function isDeliveredStage(stage: OperationalStage): boolean {
  return stage === "pending_review" || stage === "reviewed" || stage === "published" || stage === "cancelled";
}

export function computeOperationalDueDate(referenceYear: number, referenceMonth: number, dueDay = 10): Date {
  return new Date(referenceYear, referenceMonth, dueDay, 23, 59, 59, 999);
}

export function daysBetweenDates(start: Date, end: Date): number {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.max(Math.floor((endUtc - startUtc) / 86_400_000), 0);
}

export function isOperationallyLate(stage: OperationalStage, dueDate: Date, today = new Date()): boolean {
  if (isDeliveredStage(stage)) {
    return false;
  }

  return today.getTime() > dueDate.getTime();
}

export function operationalAttention(row: OperationalRowLike): OperationalAttention {
  if (row.late || row.openErrors > 0 || row.stage === "returned") {
    return "critical";
  }

  if (row.openWarnings > 0 || row.stage === "filling" || row.stage === "not_started") {
    return "warning";
  }

  return "ok";
}

export function rowMatchesOperationalFilter(row: OperationalRowLike, filter: OperationalStatusFilter): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "late") {
    return row.late;
  }

  if (filter === "errors") {
    return row.openErrors > 0;
  }

  if (filter === "warnings") {
    return row.openWarnings > 0;
  }

  return row.stage === filter;
}
