create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  create type public.app_role as enum ('administrador', 'operador', 'consulta');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.migration_status as enum ('dry_run', 'running', 'completed', 'failed', 'validated');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.migration_issue_severity as enum (
    'bloqueia_migracao',
    'pode_migrar_com_alerta',
    'pode_ser_corrigido_depois'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.app_role not null default 'consulta',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  legacy_id bigint unique,
  nome text not null,
  sigla text,
  tipo text not null,
  status text not null default 'ativa',
  endereco text,
  coordenador text,
  telefone text,
  legacy_criado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint unidades_nome_not_blank check (length(btrim(nome)) > 0),
  constraint unidades_tipo_not_blank check (length(btrim(tipo)) > 0)
);

create table if not exists public.funcionarios (
  id uuid primary key default gen_random_uuid(),
  legacy_id bigint unique,
  nome text not null,
  cpf text,
  cpf_normalized text,
  nascimento date,
  cargo text,
  setor text,
  escolaridade text,
  unidade_id uuid references public.unidades(id) on delete set null,
  legacy_unidade_id bigint,
  vinculo text,
  carga_horaria text,
  telefone text,
  email text,
  admissao date,
  data_exoneracao date,
  status text not null default 'Ativo',
  observacoes text,
  legacy_criado_em timestamptz,
  legacy_atualizado_em timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  constraint funcionarios_nome_not_blank check (length(btrim(nome)) > 0),
  constraint funcionarios_status_not_blank check (length(btrim(status)) > 0),
  constraint funcionarios_cpf_normalized_digits check (
    cpf_normalized is null or cpf_normalized ~ '^[0-9]+$'
  )
);

create table if not exists public.historico_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  legacy_id bigint unique,
  funcionario_id uuid not null references public.funcionarios(id) on delete restrict,
  funcionario_legacy_id bigint,
  status_anterior text,
  status_novo text not null,
  data_movimentacao timestamptz not null,
  observacao text,
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint historico_status_novo_not_blank check (length(btrim(status_novo)) > 0)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_legacy_id bigint,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_not_blank check (length(btrim(action)) > 0),
  constraint audit_logs_entity_type_not_blank check (length(btrim(entity_type)) > 0)
);

create table if not exists public.migration_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status public.migration_status not null default 'running',
  source_hash text not null,
  total_source_records integer not null default 0,
  total_imported_records integer not null default 0,
  total_failed_records integer not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  constraint migration_runs_source_hash_not_blank check (length(btrim(source_hash)) > 0)
);

create table if not exists public.migration_issues (
  id uuid primary key default gen_random_uuid(),
  migration_run_id uuid references public.migration_runs(id) on delete cascade,
  entity_type text not null,
  legacy_id bigint,
  issue_type text not null,
  severity public.migration_issue_severity not null,
  description text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint migration_issues_entity_type_not_blank check (length(btrim(entity_type)) > 0),
  constraint migration_issues_issue_type_not_blank check (length(btrim(issue_type)) > 0),
  constraint migration_issues_description_not_blank check (length(btrim(description)) > 0)
);

alter table public.migration_runs
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists finished_at timestamptz,
  add column if not exists status public.migration_status not null default 'running',
  add column if not exists source_hash text not null default 'manual-bootstrap',
  add column if not exists total_source_records integer not null default 0,
  add column if not exists total_imported_records integer not null default 0,
  add column if not exists total_failed_records integer not null default 0,
  add column if not exists notes text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.migration_issues
  add column if not exists migration_run_id uuid references public.migration_runs(id) on delete cascade,
  add column if not exists entity_type text not null default 'unknown',
  add column if not exists legacy_id bigint,
  add column if not exists issue_type text not null default 'unknown',
  add column if not exists severity public.migration_issue_severity not null default 'pode_ser_corrigido_depois',
  add column if not exists description text not null default 'Pendencia registrada durante bootstrap',
  add column if not exists resolved boolean not null default false,
  add column if not exists resolved_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_unidades_updated_at on public.unidades;
create trigger set_unidades_updated_at
before update on public.unidades
for each row execute function public.set_updated_at();

drop trigger if exists set_funcionarios_updated_at on public.funcionarios;
create trigger set_funcionarios_updated_at
before update on public.funcionarios
for each row execute function public.set_updated_at();

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_is_active on public.profiles(is_active);
create unique index if not exists idx_profiles_email_lower on public.profiles(lower(email));

create index if not exists idx_unidades_nome_trgm on public.unidades using gin (lower(nome) gin_trgm_ops);
create index if not exists idx_unidades_tipo on public.unidades(tipo);
create index if not exists idx_unidades_status on public.unidades(status);

create index if not exists idx_funcionarios_nome_trgm on public.funcionarios using gin (lower(nome) gin_trgm_ops);
create index if not exists idx_funcionarios_cpf_normalized on public.funcionarios(cpf_normalized);
create index if not exists idx_funcionarios_status on public.funcionarios(status);
create index if not exists idx_funcionarios_unidade_id on public.funcionarios(unidade_id);
create index if not exists idx_funcionarios_cargo_trgm on public.funcionarios using gin (lower(cargo) gin_trgm_ops);
create index if not exists idx_funcionarios_vinculo on public.funcionarios(vinculo);
create index if not exists idx_funcionarios_admissao on public.funcionarios(admissao);
create index if not exists idx_funcionarios_data_exoneracao on public.funcionarios(data_exoneracao);
create index if not exists idx_funcionarios_deleted_at on public.funcionarios(deleted_at);

create index if not exists idx_historico_funcionario_id on public.historico_movimentacoes(funcionario_id);
create index if not exists idx_historico_funcionario_legacy_id on public.historico_movimentacoes(funcionario_legacy_id);
create index if not exists idx_historico_data_movimentacao on public.historico_movimentacoes(data_movimentacao desc);

create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_entity_legacy on public.audit_logs(entity_type, entity_legacy_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

create index if not exists idx_migration_runs_source_hash on public.migration_runs(source_hash);
create index if not exists idx_migration_runs_status on public.migration_runs(status);
create index if not exists idx_migration_issues_run on public.migration_issues(migration_run_id);
create index if not exists idx_migration_issues_entity on public.migration_issues(entity_type, legacy_id);
create index if not exists idx_migration_issues_severity on public.migration_issues(severity);
create index if not exists idx_migration_issues_resolved on public.migration_issues(resolved);
