-- Fase 2 - competências, valores, observações e validações.

create table if not exists public.competencies (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  form_version_id uuid not null references public.form_versions(id) on delete restrict,
  reference_year integer not null check (reference_year between 2000 and 2100),
  reference_month integer not null check (reference_month between 1 and 12),
  status public.competency_status not null default 'draft',
  completion_percentage numeric(5,2) not null default 0 check (completion_percentage between 0 and 100),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  submitted_by uuid references public.profiles(id),
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  published_by uuid references public.profiles(id),
  published_at timestamptz,
  reopened_by uuid references public.profiles(id),
  reopened_at timestamptz,
  reopen_reason text,
  cancellation_reason text,
  current_publication_version integer,
  general_notes text,
  unique (unit_id, form_version_id, reference_year, reference_month)
);

create table if not exists public.indicator_values (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  indicator_id uuid not null references public.indicators(id) on delete restrict,
  numeric_value numeric,
  text_value text,
  value_status public.value_status not null default 'not_informed',
  notes text,
  informed_by uuid references public.profiles(id),
  informed_at timestamptz,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (competency_id, indicator_id),
  constraint indicator_values_status_shape check (
    (value_status = 'not_informed' and numeric_value is null and text_value is null)
    or (value_status = 'not_applicable' and numeric_value is null and text_value is null)
    or (value_status = 'informed' and ((numeric_value is not null and text_value is null) or (numeric_value is null and text_value is not null)))
  ),
  constraint indicator_values_non_negative check (numeric_value is null or numeric_value >= 0)
);

create table if not exists public.group_observations (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  indicator_group_id uuid not null references public.indicator_groups(id) on delete restrict,
  text text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (competency_id, indicator_group_id)
);

create table if not exists public.special_field_values (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  special_field_definition_id uuid not null references public.special_field_definitions(id) on delete restrict,
  numeric_value numeric,
  text_value text,
  value_status public.value_status not null default 'not_informed',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (competency_id, special_field_definition_id),
  constraint special_field_values_status_shape check (
    (value_status = 'not_informed' and numeric_value is null and text_value is null)
    or (value_status = 'not_applicable' and numeric_value is null and text_value is null)
    or (value_status = 'informed' and ((numeric_value is not null and text_value is null) or (numeric_value is null and text_value is not null)))
  ),
  constraint special_field_values_non_negative check (numeric_value is null or numeric_value >= 0)
);

create table if not exists public.validation_results (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  indicator_id uuid references public.indicators(id) on delete cascade,
  relationship_id uuid references public.indicator_relationships(id) on delete cascade,
  severity public.validation_severity not null,
  code text not null,
  message text not null,
  expected_value numeric,
  actual_value numeric,
  status public.validation_status not null default 'open',
  justification text,
  justified_by uuid references public.profiles(id),
  justified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.competencies is 'Registro mensal único por unidade, formulário, ano e mês.';
comment on table public.indicator_values is 'Valores flexíveis dos indicadores; zero informado é diferente de não informado.';
comment on table public.group_observations is 'Observações textuais por grupo e competência.';
