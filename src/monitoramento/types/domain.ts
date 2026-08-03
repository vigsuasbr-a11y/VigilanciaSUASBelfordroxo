export type UUID = string;

export type CompetencyStatus =
  | "not_started"
  | "draft"
  | "in_progress"
  | "pending_review"
  | "returned_for_correction"
  | "reviewed"
  | "published"
  | "reopened"
  | "cancelled";

export type ValueStatus = "informed" | "not_informed" | "not_applicable";

export type IndicatorDataType = "integer" | "decimal" | "percentage" | "short_text" | "long_text" | "boolean";

export type IndicatorCalculationType =
  | "monthly_stock"
  | "monthly_flow"
  | "annual_accumulative"
  | "percentage"
  | "average"
  | "calculated_total"
  | "textual_information"
  | "non_accumulative"
  | "undefined";

export type AnnualAggregationType = "sum" | "last_available" | "average" | "minimum" | "maximum" | "none" | "custom";

export type Profile = {
  id: UUID;
  full_name: string;
  email: string;
  display_name: string;
  active: boolean;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: UUID;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Permission = {
  id: UUID;
  code: string;
  name: string;
  description: string | null;
  module: string;
  created_at: string;
};

export type Unit = {
  id: UUID;
  code: string;
  roman_number: string | null;
  name: string;
  full_name: string;
  acronym: string;
  unit_type: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
};

export type FormVersion = {
  id: UUID;
  code: string;
  name: string;
  year: number;
  version: number;
  status: "draft" | "active" | "archived";
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  published_at: string | null;
  archived_at: string | null;
  service_type?: string | null;
  source_metadata?: Record<string, unknown>;
};

export type IndicatorGroup = {
  id: UUID;
  form_version_id: UUID;
  code: string;
  name: string;
  source_name: string | null;
  inferred_name: boolean;
  description: string | null;
  display_order: number;
  source_start_row: number | null;
  source_end_row: number | null;
  observation_source_range: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Indicator = {
  id: UUID;
  form_version_id: UUID;
  group_id: UUID;
  code: string;
  original_name: string;
  display_name: string;
  description: string | null;
  subgroup: string | null;
  source_sheet: string | null;
  source_cell: string | null;
  source_row: number | null;
  source_column: string | null;
  source_cells: string | null;
  source_metadata: Record<string, unknown>;
  data_type: IndicatorDataType;
  unit_of_measure: string;
  calculation_type: IndicatorCalculationType;
  annual_aggregation_type: AnnualAggregationType;
  required: boolean;
  accepts_zero: boolean;
  allows_empty: boolean;
  allows_not_applicable: boolean;
  minimum_value: number | null;
  maximum_value: number | null;
  display_order: number;
  active: boolean;
  is_dashboard_featured: boolean;
  dashboard_default_presentation: string | null;
  dashboard_card_enabled: boolean;
  dashboard_chart_enabled: boolean;
  created_at: string;
  updated_at: string;
  indicator_groups?: Pick<IndicatorGroup, "code" | "name" | "display_order"> | null;
};

export type Competency = {
  id: UUID;
  unit_id: UUID;
  form_version_id: UUID;
  reference_year: number;
  reference_month: number;
  status: CompetencyStatus;
  completion_percentage: number;
  created_by: UUID | null;
  created_at: string;
  updated_by: UUID | null;
  updated_at: string;
  submitted_by: UUID | null;
  submitted_at: string | null;
  reviewed_by: UUID | null;
  reviewed_at: string | null;
  published_by: UUID | null;
  published_at: string | null;
  reopened_by: UUID | null;
  reopened_at: string | null;
  reopen_reason: string | null;
  cancellation_reason: string | null;
  current_publication_version: number | null;
  general_notes: string | null;
  units?: Pick<Unit, "code" | "full_name" | "acronym"> | null;
  form_versions?: Pick<FormVersion, "code" | "name"> | null;
};

export type IndicatorValue = {
  id: UUID;
  competency_id: UUID;
  indicator_id: UUID;
  numeric_value: number | null;
  text_value: string | null;
  value_status: ValueStatus;
  notes: string | null;
  informed_by: UUID | null;
  informed_at: string | null;
  updated_by: UUID | null;
  updated_at: string;
};

export type Publication = {
  id: UUID;
  competency_id: UUID;
  version_number: number;
  status: "current" | "superseded" | "cancelled";
  published_by: UUID | null;
  published_at: string;
  publication_reason: string | null;
  correction_reason: string | null;
  supersedes_publication_id: UUID | null;
  created_at: string;
};

export type AuditLog = {
  id: UUID;
  user_id: UUID | null;
  action: string;
  entity_type: string;
  entity_id: UUID | null;
  unit_id: UUID | null;
  competency_id: UUID | null;
  indicator_id: UUID | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  session_identifier: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};
