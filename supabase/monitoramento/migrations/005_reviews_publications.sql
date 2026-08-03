-- Fase 2 - revisões, publicações e snapshots oficiais.

create table if not exists public.submission_reviews (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  action public.review_action not null,
  reviewer_id uuid references public.profiles(id),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  status public.publication_status not null default 'current',
  published_by uuid references public.profiles(id),
  published_at timestamptz not null default now(),
  publication_reason text,
  correction_reason text,
  supersedes_publication_id uuid references public.publications(id),
  created_at timestamptz not null default now(),
  unique (competency_id, version_number)
);

create table if not exists public.publication_snapshots (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete cascade,
  indicator_id uuid references public.indicators(id) on delete restrict,
  special_field_definition_id uuid references public.special_field_definitions(id) on delete restrict,
  indicator_group_id uuid references public.indicator_groups(id) on delete restrict,
  snapshot_kind text not null,
  numeric_value numeric,
  text_value text,
  value_status public.value_status,
  notes text,
  source_record_id uuid,
  created_at timestamptz not null default now(),
  constraint publication_snapshots_kind check (snapshot_kind in ('indicator_value', 'special_field_value', 'group_observation')),
  constraint publication_snapshots_one_subject check (
    (snapshot_kind = 'indicator_value' and indicator_id is not null and special_field_definition_id is null and indicator_group_id is null)
    or (snapshot_kind = 'special_field_value' and indicator_id is null and special_field_definition_id is not null and indicator_group_id is null)
    or (snapshot_kind = 'group_observation' and indicator_id is null and special_field_definition_id is null and indicator_group_id is not null)
  )
);

create unique index if not exists publication_snapshots_indicator_once
  on public.publication_snapshots (publication_id, indicator_id)
  where snapshot_kind = 'indicator_value';

create unique index if not exists publication_snapshots_special_once
  on public.publication_snapshots (publication_id, special_field_definition_id)
  where snapshot_kind = 'special_field_value';

create unique index if not exists publication_snapshots_observation_once
  on public.publication_snapshots (publication_id, indicator_group_id)
  where snapshot_kind = 'group_observation';

comment on table public.publication_snapshots is 'Snapshot oficial dos dados publicados; audit_logs não substituem esta tabela.';
