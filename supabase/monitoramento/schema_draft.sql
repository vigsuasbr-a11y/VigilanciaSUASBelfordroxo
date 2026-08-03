-- Rascunho técnico da Fase 1. Não aplicar em produção antes da validação do catálogo.
-- Projeto: Sistema de Monitoramento Mensal dos Indicadores Socioassistenciais dos CRAS

create extension if not exists pgcrypto;

create type public.user_role as enum ('administrador', 'vigilancia', 'gestor', 'consulta');
create type public.competencia_status as enum (
  'nao_iniciado',
  'rascunho',
  'em_preenchimento',
  'aguardando_revisao',
  'devolvido_para_correcao',
  'revisado',
  'publicado',
  'reaberto',
  'cancelado'
);
create type public.indicator_data_type as enum ('inteiro', 'decimal', 'percentual', 'texto_curto', 'texto_longo', 'sim_nao');
create type public.indicator_calculation_type as enum (
  'fluxo_mensal',
  'estoque_mensal',
  'acumulativo_anual',
  'media',
  'percentual',
  'total_calculado',
  'informacao_textual',
  'nao_acumulavel'
);
create type public.validation_severity as enum ('erro_impeditivo', 'alerta', 'informacao');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null unique,
  role public.user_role not null default 'consulta',
  active boolean not null default true,
  last_access_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  roman_number text not null unique,
  name text not null,
  display_name text not null,
  acronym text not null unique,
  active boolean not null default true,
  display_order integer not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_versions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  source_file_name text,
  source_file_hash text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.indicator_groups (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id),
  name text not null,
  description text,
  display_order integer not null,
  active boolean not null default true,
  unique (form_version_id, display_order),
  unique (form_version_id, name)
);

create table public.indicators (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id),
  group_id uuid not null references public.indicator_groups(id),
  parent_indicator_id uuid references public.indicators(id),
  code text not null,
  name text not null,
  description text,
  subgroup text,
  source_sheet text,
  source_row integer,
  source_cells text,
  unit_of_measure text not null default 'quantidade',
  data_type public.indicator_data_type not null,
  calculation_type public.indicator_calculation_type not null,
  display_order integer not null,
  required boolean not null default true,
  accepts_zero boolean not null default true,
  allows_empty boolean not null default true,
  min_value numeric,
  max_value numeric,
  active boolean not null default true,
  display_in_dashboard boolean not null default false,
  display_in_summary boolean not null default false,
  display_in_reports boolean not null default true,
  is_dashboard_featured boolean not null default false,
  dashboard_display_type text,
  dashboard_order integer,
  dashboard_group text,
  dashboard_chart_enabled boolean not null default false,
  dashboard_card_enabled boolean not null default false,
  version text not null default '2026.1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_version_id, code)
);

create table public.indicator_relationships (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id),
  parent_indicator_id uuid not null references public.indicators(id),
  child_indicator_id uuid not null references public.indicators(id),
  relationship_type text not null,
  validation_severity public.validation_severity not null default 'alerta',
  active boolean not null default true,
  unique (parent_indicator_id, child_indicator_id, relationship_type)
);

create table public.competencies (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id),
  form_version_id uuid not null references public.form_versions(id),
  year integer not null check (year between 2000 and 2100),
  month integer not null check (month between 1 and 12),
  status public.competencia_status not null default 'rascunho',
  completion_percentage numeric(5,2) not null default 0 check (completion_percentage between 0 and 100),
  general_notes text,
  correction_justification text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  submitted_for_review_by uuid references public.profiles(id),
  submitted_for_review_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  published_by uuid references public.profiles(id),
  published_at timestamptz,
  unique (unit_id, year, month)
);

create table public.indicator_values (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  indicator_id uuid not null references public.indicators(id),
  numeric_value numeric,
  text_value text,
  not_applicable boolean not null default false,
  observation text,
  origin text not null default 'manual',
  informed_by uuid references public.profiles(id),
  informed_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (competency_id, indicator_id),
  check (
    (numeric_value is not null and text_value is null)
    or (numeric_value is null and text_value is not null)
    or (numeric_value is null and text_value is null)
  ),
  check (numeric_value is null or numeric_value >= 0)
);

create table public.validation_results (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  indicator_id uuid references public.indicators(id),
  severity public.validation_severity not null,
  code text not null,
  message text not null,
  expected_value numeric,
  actual_value numeric,
  justification text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  competency_id uuid references public.competencies(id),
  unit_id uuid references public.units(id),
  indicator_id uuid references public.indicators(id),
  old_value jsonb,
  new_value jsonb,
  reason text,
  ip_address inet,
  session_id text,
  created_at timestamptz not null default now()
);

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.units enable row level security;
alter table public.form_versions enable row level security;
alter table public.indicator_groups enable row level security;
alter table public.indicators enable row level security;
alter table public.indicator_relationships enable row level security;
alter table public.competencies enable row level security;
alter table public.indicator_values enable row level security;
alter table public.validation_results enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;

-- Função auxiliar esperada nas policies.
create or replace function public.current_role()
returns public.user_role
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true
$$;

-- Exemplos de policies; devem ser revisadas em implantação.
create policy "authenticated can read active catalog"
on public.indicators for select
to authenticated
using (active = true);

create policy "only admins manage catalog"
on public.indicators for all
to authenticated
using (public.current_role() = 'administrador')
with check (public.current_role() = 'administrador');

create policy "published competencies visible to authorized users"
on public.competencies for select
to authenticated
using (
  public.current_role() in ('administrador', 'vigilancia', 'gestor', 'consulta')
  and (status = 'publicado' or public.current_role() in ('administrador', 'vigilancia'))
);

create policy "vigilancia drafts and admins can insert competencies"
on public.competencies for insert
to authenticated
with check (public.current_role() in ('administrador', 'vigilancia'));

create policy "block published edits except admin reabertura flow"
on public.indicator_values for update
to authenticated
using (
  exists (
    select 1 from public.competencies c
    where c.id = competency_id
      and c.status <> 'publicado'
      and public.current_role() in ('administrador', 'vigilancia')
  )
)
with check (
  exists (
    select 1 from public.competencies c
    where c.id = competency_id
      and c.status <> 'publicado'
      and public.current_role() in ('administrador', 'vigilancia')
  )
);
