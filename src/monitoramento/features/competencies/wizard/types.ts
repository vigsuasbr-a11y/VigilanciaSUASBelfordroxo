import type {
  Competency,
  FormVersion,
  Indicator,
  IndicatorDataType,
  IndicatorGroup,
  IndicatorValue,
  Unit,
  UUID,
  ValueStatus,
} from "@/monitoramento/types/domain";

export type GroupObservationDefinition = {
  id: UUID;
  form_version_id: UUID;
  group_id: UUID;
  code: string;
  label: string;
  source_range: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type GroupObservation = {
  id: UUID;
  competency_id: UUID;
  indicator_group_id: UUID;
  text: string;
  created_by: UUID | null;
  created_at: string;
  updated_by: UUID | null;
  updated_at: string;
};

export type SpecialFieldDefinition = {
  id: UUID;
  form_version_id: UUID;
  group_id: UUID;
  code: string;
  label: string;
  parent_label: string | null;
  source_cell: string;
  proposed_value_cell_or_range: string | null;
  proposed_data_type: IndicatorDataType;
  model_status: "pending_confirmation" | "confirmed" | "rejected" | "archived";
  requires_confirmation: boolean;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type SpecialFieldValue = {
  id: UUID;
  competency_id: UUID;
  special_field_definition_id: UUID;
  numeric_value: number | null;
  text_value: string | null;
  value_status: ValueStatus;
  notes: string | null;
  created_by: UUID | null;
  created_at: string;
  updated_by: UUID | null;
  updated_at: string;
};

export type IndicatorRelationship = {
  id: UUID;
  form_version_id: UUID;
  parent_indicator_id: UUID | null;
  child_indicator_id: UUID | null;
  relationship_type:
    | "parent_equals_sum_children"
    | "distribution_matches_denominator"
    | "child_values_not_necessarily_exclusive"
    | "special_breakdown_matches_total"
    | "related_but_different_unit";
  display_order: number;
  validation_severity: "error" | "warning" | "information";
  tolerance_value: number | null;
  related_source_rows: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ValidationResult = {
  id: UUID;
  competency_id: UUID;
  indicator_id: UUID | null;
  relationship_id: UUID | null;
  severity: "error" | "warning" | "information";
  code: string;
  message: string;
  expected_value: number | null;
  actual_value: number | null;
  status: "open" | "justified" | "resolved" | "ignored";
  justification: string | null;
  justified_by: UUID | null;
  justified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionReview = {
  id: UUID;
  competency_id: UUID;
  action:
    | "submitted_for_review"
    | "approved"
    | "returned_for_correction"
    | "publication_authorized"
    | "publication_rejected";
  reviewer_id: UUID | null;
  comment: string | null;
  created_at: string;
};

export type CompetencyWizardData = {
  competency: Competency & {
    units?: Pick<Unit, "code" | "full_name" | "acronym"> | null;
    form_versions?: Pick<FormVersion, "code" | "name"> | null;
  };
  groups: IndicatorGroup[];
  indicators: Indicator[];
  indicatorValues: IndicatorValue[];
  observationDefinitions: GroupObservationDefinition[];
  groupObservations: GroupObservation[];
  specialFieldDefinitions: SpecialFieldDefinition[];
  specialFieldValues: SpecialFieldValue[];
  relationships: IndicatorRelationship[];
  validationResults: ValidationResult[];
  reviewHistory: SubmissionReview[];
};

export type FieldDraft = {
  valueStatus: ValueStatus;
  numericValue: number | null;
  textValue: string | null;
};

export type FieldMessage = {
  severity: "error" | "warning" | "information";
  message: string;
  code?: string;
  indicatorId?: UUID;
  relationshipId?: UUID;
};

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export type FieldVisualStatus = "never_filled" | "edited" | "saved" | "error" | "warning" | "not_applicable";

export type FieldSaveResult =
  | {
      ok: true;
      savedAt: string;
      record: IndicatorValue | SpecialFieldValue | GroupObservation;
    }
  | {
      ok: false;
      message: string;
      issues?: FieldMessage[];
    };

export type ReviewSubmitResult =
  | {
      ok: true;
      submittedAt: string;
    }
  | {
      ok: false;
      status: "blocked" | "needs_justification" | "error";
      message: string;
      issues?: FieldMessage[];
    };
