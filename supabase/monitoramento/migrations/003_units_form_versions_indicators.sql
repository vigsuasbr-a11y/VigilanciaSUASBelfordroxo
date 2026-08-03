-- Fase 2 - unidades, versionamento do formulário e catálogo de indicadores.

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  roman_number text not null unique,
  name text not null,
  full_name text not null,
  acronym text not null unique,
  unit_type text not null default 'cras',
  display_order integer not null unique check (display_order > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deactivated_at timestamptz,
  constraint units_code_format check (code ~ '^cras-[0-9]{2}-[a-z0-9-]+$')
);

create table if not exists public.form_versions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  year integer not null check (year between 2000 and 2100),
  version integer not null check (version > 0),
  status public.form_version_status not null default 'draft',
  source_file_name text,
  source_file_hash text,
  valid_from date,
  valid_until date,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz,
  unique (year, version)
);

create table if not exists public.indicator_groups (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id) on delete cascade,
  code text not null,
  name text not null,
  source_name text,
  inferred_name boolean not null default false,
  description text,
  display_order integer not null check (display_order > 0),
  source_start_row integer,
  source_end_row integer,
  observation_source_range text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_version_id, code),
  unique (form_version_id, display_order)
);

create table if not exists public.indicators (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id) on delete cascade,
  group_id uuid not null references public.indicator_groups(id) on delete restrict,
  code text not null,
  original_name text not null,
  display_name text not null,
  description text,
  subgroup text,
  source_sheet text,
  source_cell text,
  source_row integer,
  source_column text,
  source_cells text,
  source_metadata jsonb not null default '{}'::jsonb,
  data_type public.indicator_data_type not null,
  unit_of_measure text not null default 'quantidade',
  calculation_type public.indicator_calculation_type not null default 'undefined',
  annual_aggregation_type public.annual_aggregation_type not null default 'none',
  required boolean not null default true,
  accepts_zero boolean not null default true,
  allows_empty boolean not null default true,
  allows_not_applicable boolean not null default false,
  minimum_value numeric,
  maximum_value numeric,
  display_order integer not null check (display_order > 0),
  active boolean not null default true,
  is_dashboard_featured boolean not null default false,
  dashboard_default_presentation text,
  dashboard_card_enabled boolean not null default false,
  dashboard_chart_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_version_id, code)
);

create table if not exists public.indicator_relationships (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id) on delete cascade,
  parent_indicator_id uuid references public.indicators(id) on delete cascade,
  child_indicator_id uuid references public.indicators(id) on delete cascade,
  relationship_type text not null,
  display_order integer not null default 1,
  validation_severity public.validation_severity not null default 'warning',
  tolerance_value numeric,
  related_source_rows text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint indicator_relationships_type check (
    relationship_type in (
      'parent_equals_sum_children',
      'distribution_matches_denominator',
      'child_values_not_necessarily_exclusive',
      'special_breakdown_matches_total',
      'related_but_different_unit'
    )
  )
);

create table if not exists public.group_observation_definitions (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id) on delete cascade,
  group_id uuid not null references public.indicator_groups(id) on delete cascade,
  code text not null,
  label text not null,
  source_range text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_version_id, code),
  unique (form_version_id, group_id)
);

create table if not exists public.special_field_definitions (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id) on delete cascade,
  group_id uuid not null references public.indicator_groups(id) on delete restrict,
  code text not null,
  label text not null,
  parent_label text,
  source_cell text not null,
  proposed_value_cell_or_range text,
  proposed_data_type public.indicator_data_type not null,
  model_status public.special_model_status not null default 'pending_confirmation',
  requires_confirmation boolean not null default true,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_version_id, code)
);

comment on table public.indicators is 'Catálogo versionado dos 256 indicadores oficiais da Fase 1.';
comment on table public.special_field_definitions is 'Sete campos fora da grade mensal, mantidos pendentes até validação humana.';
