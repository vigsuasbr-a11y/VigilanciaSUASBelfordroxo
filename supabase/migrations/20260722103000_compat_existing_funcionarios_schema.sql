-- Compatibilidade para projetos Supabase que ja possuem as tabelas
-- funcionarios/unidades em formato simplificado. Mantem as colunas antigas
-- e acrescenta o contrato usado pelo Portal da Vigilancia.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.unidades
  add column if not exists legacy_id bigint,
  add column if not exists sigla text,
  add column if not exists status text default 'ativa',
  add column if not exists coordenador text,
  add column if not exists telefone text,
  add column if not exists legacy_criado_em timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.unidades
set status = case when ativa then 'ativa' else 'inativa' end
where status is null;

alter table public.unidades
  alter column status set default 'ativa',
  alter column status set not null,
  alter column ativa set default true;

alter table public.funcionarios
  add column if not exists legacy_id bigint,
  add column if not exists cpf_normalized text,
  add column if not exists nascimento date,
  add column if not exists unidade_id uuid references public.unidades(id) on delete set null,
  add column if not exists legacy_unidade_id bigint,
  add column if not exists vinculo text,
  add column if not exists carga_horaria text,
  add column if not exists email text,
  add column if not exists admissao date,
  add column if not exists data_exoneracao date,
  add column if not exists status text default 'Ativo',
  add column if not exists observacoes text,
  add column if not exists legacy_criado_em timestamptz,
  add column if not exists legacy_atualizado_em timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.funcionarios
set
  status = coalesce(status, 'Ativo'),
  nascimento = coalesce(nascimento, data_nascimento),
  admissao = coalesce(admissao, inicio_exercicio),
  vinculo = coalesce(vinculo, vinculo_institucional),
  cpf_normalized = nullif(regexp_replace(coalesce(cpf, ''), '\D', '', 'g'), '')
where
  status is null
  or nascimento is null
  or admissao is null
  or vinculo is null
  or cpf_normalized is null;

alter table public.funcionarios
  alter column status set default 'Ativo',
  alter column status set not null,
  alter column unidade set default 'Sem unidade';

create or replace function public.sync_funcionarios_compat_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.cpf_normalized := nullif(regexp_replace(coalesce(new.cpf, ''), '\D', '', 'g'), '');

  new.nascimento := coalesce(new.nascimento, new.data_nascimento);
  new.data_nascimento := coalesce(new.data_nascimento, new.nascimento);

  new.admissao := coalesce(new.admissao, new.inicio_exercicio);
  new.inicio_exercicio := coalesce(new.inicio_exercicio, new.admissao);

  new.vinculo := coalesce(new.vinculo, new.vinculo_institucional);
  new.vinculo_institucional := coalesce(new.vinculo_institucional, new.vinculo);

  if new.unidade_id is not null and (new.unidade is null or new.unidade = 'Sem unidade') then
    select u.nome
    into new.unidade
    from public.unidades u
    where u.id = new.unidade_id;
  end if;

  new.unidade := coalesce(nullif(btrim(new.unidade), ''), 'Sem unidade');

  return new;
end;
$$;

drop trigger if exists sync_funcionarios_compat_columns on public.funcionarios;
create trigger sync_funcionarios_compat_columns
before insert or update on public.funcionarios
for each row execute function public.sync_funcionarios_compat_columns();

drop trigger if exists set_unidades_updated_at on public.unidades;
create trigger set_unidades_updated_at
before update on public.unidades
for each row execute function public.set_updated_at();

drop trigger if exists set_funcionarios_updated_at on public.funcionarios;
create trigger set_funcionarios_updated_at
before update on public.funcionarios
for each row execute function public.set_updated_at();

create unique index if not exists idx_unidades_legacy_id_unique
on public.unidades(legacy_id)
where legacy_id is not null;

create unique index if not exists idx_funcionarios_legacy_id_unique
on public.funcionarios(legacy_id)
where legacy_id is not null;

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
