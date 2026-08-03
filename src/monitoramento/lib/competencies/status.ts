import type { CompetencyStatus } from "@/monitoramento/types/domain";

export const ALLOWED_COMPETENCY_TRANSITIONS: Record<CompetencyStatus, CompetencyStatus[]> = {
  not_started: ["draft"],
  draft: ["in_progress", "pending_review", "cancelled"],
  in_progress: ["pending_review", "cancelled"],
  pending_review: ["reviewed", "returned_for_correction"],
  returned_for_correction: ["in_progress", "pending_review"],
  reviewed: ["published", "returned_for_correction"],
  published: ["reopened"],
  reopened: ["in_progress", "pending_review", "reviewed", "published"],
  cancelled: [],
};

export function canTransitionCompetencyStatus(from: CompetencyStatus, to: CompetencyStatus): boolean {
  if (from === to) {
    return true;
  }

  return ALLOWED_COMPETENCY_TRANSITIONS[from].includes(to);
}

