create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1
$$;

create or replace function public.has_active_role(allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = any(allowed_roles), false)
$$;

create or replace function public.is_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_role(array['administrador']::public.app_role[])
$$;

create or replace function public.is_operador_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_role(array['administrador', 'operador']::public.app_role[])
$$;

create or replace function public.can_read_funcionarios()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_active_role(array['administrador', 'operador', 'consulta']::public.app_role[])
$$;

create or replace function public.mask_cpf(value text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when value is null or btrim(value) = '' then null
    when length(regexp_replace(value, '\D', '', 'g')) = 11 then
      '***.' ||
      substring(regexp_replace(value, '\D', '', 'g') from 4 for 3) ||
      '.***-' ||
      substring(regexp_replace(value, '\D', '', 'g') from 10 for 2)
    else '***'
  end
$$;

revoke all on function public.current_profile_role() from public;
revoke all on function public.has_active_role(public.app_role[]) from public;
revoke all on function public.is_administrador() from public;
revoke all on function public.is_operador_or_admin() from public;
revoke all on function public.can_read_funcionarios() from public;
revoke all on function public.mask_cpf(text) from public;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.has_active_role(public.app_role[]) to authenticated;
grant execute on function public.is_administrador() to authenticated;
grant execute on function public.is_operador_or_admin() to authenticated;
grant execute on function public.can_read_funcionarios() to authenticated;
grant execute on function public.mask_cpf(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.unidades enable row level security;
alter table public.funcionarios enable row level security;
alter table public.historico_movimentacoes enable row level security;
alter table public.audit_logs enable row level security;
alter table public.migration_runs enable row level security;
alter table public.migration_issues enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.unidades to authenticated;
grant select, insert, update, delete on public.funcionarios to authenticated;
grant select, insert on public.historico_movimentacoes to authenticated;
grant select on public.audit_logs to authenticated;
grant select, insert, update on public.migration_runs to authenticated;
grant select, insert, update on public.migration_issues to authenticated;

drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_insert_admin_only on public.profiles;
drop policy if exists profiles_update_admin_only on public.profiles;
drop policy if exists profiles_delete_admin_only on public.profiles;

create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_administrador());

create policy profiles_insert_admin_only
on public.profiles
for insert
to authenticated
with check (public.is_administrador());

create policy profiles_update_admin_only
on public.profiles
for update
to authenticated
using (public.is_administrador())
with check (public.is_administrador());

create policy profiles_delete_admin_only
on public.profiles
for delete
to authenticated
using (public.is_administrador());

drop policy if exists unidades_select_active_profiles on public.unidades;
drop policy if exists unidades_insert_admin_only on public.unidades;
drop policy if exists unidades_update_admin_only on public.unidades;
drop policy if exists unidades_delete_admin_only on public.unidades;

create policy unidades_select_active_profiles
on public.unidades
for select
to authenticated
using (public.can_read_funcionarios());

create policy unidades_insert_admin_only
on public.unidades
for insert
to authenticated
with check (public.is_administrador());

create policy unidades_update_admin_only
on public.unidades
for update
to authenticated
using (public.is_administrador())
with check (public.is_administrador());

create policy unidades_delete_admin_only
on public.unidades
for delete
to authenticated
using (public.is_administrador());

drop policy if exists funcionarios_select_active_profiles on public.funcionarios;
drop policy if exists funcionarios_insert_operator_admin on public.funcionarios;
drop policy if exists funcionarios_update_operator_admin on public.funcionarios;

create policy funcionarios_select_active_profiles
on public.funcionarios
for select
to authenticated
using (public.can_read_funcionarios());

create policy funcionarios_insert_operator_admin
on public.funcionarios
for insert
to authenticated
with check (public.is_operador_or_admin());

create policy funcionarios_update_operator_admin
on public.funcionarios
for update
to authenticated
using (public.is_operador_or_admin())
with check (public.is_operador_or_admin());

drop policy if exists historico_select_active_profiles on public.historico_movimentacoes;
drop policy if exists historico_insert_operator_admin on public.historico_movimentacoes;

create policy historico_select_active_profiles
on public.historico_movimentacoes
for select
to authenticated
using (public.can_read_funcionarios());

create policy historico_insert_operator_admin
on public.historico_movimentacoes
for insert
to authenticated
with check (public.is_operador_or_admin());

drop policy if exists audit_logs_select_admin_only on public.audit_logs;

create policy audit_logs_select_admin_only
on public.audit_logs
for select
to authenticated
using (public.is_administrador());

drop policy if exists migration_runs_select_admin_only on public.migration_runs;
drop policy if exists migration_runs_insert_admin_only on public.migration_runs;
drop policy if exists migration_runs_update_admin_only on public.migration_runs;

create policy migration_runs_select_admin_only
on public.migration_runs
for select
to authenticated
using (public.is_administrador());

create policy migration_runs_insert_admin_only
on public.migration_runs
for insert
to authenticated
with check (public.is_administrador());

create policy migration_runs_update_admin_only
on public.migration_runs
for update
to authenticated
using (public.is_administrador())
with check (public.is_administrador());

drop policy if exists migration_issues_select_admin_only on public.migration_issues;
drop policy if exists migration_issues_insert_admin_only on public.migration_issues;
drop policy if exists migration_issues_update_admin_only on public.migration_issues;

create policy migration_issues_select_admin_only
on public.migration_issues
for select
to authenticated
using (public.is_administrador());

create policy migration_issues_insert_admin_only
on public.migration_issues
for insert
to authenticated
with check (public.is_administrador());

create policy migration_issues_update_admin_only
on public.migration_issues
for update
to authenticated
using (public.is_administrador())
with check (public.is_administrador());

create or replace function public.insert_audit_log(
  action_value text,
  entity_type_value text,
  entity_id_value uuid,
  entity_legacy_id_value bigint,
  old_values_value jsonb,
  new_values_value jsonb,
  metadata_value jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_id uuid;
begin
  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    entity_legacy_id,
    old_values,
    new_values,
    metadata
  )
  values (
    auth.uid(),
    action_value,
    entity_type_value,
    entity_id_value,
    entity_legacy_id_value,
    old_values_value,
    new_values_value,
    coalesce(metadata_value, '{}'::jsonb)
  )
  returning id into audit_id;

  return audit_id;
end;
$$;

revoke all on function public.insert_audit_log(text, text, uuid, bigint, jsonb, jsonb, jsonb) from public;

create or replace function public.funcionario_audit_snapshot(record public.funcionarios)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'legacy_id', record.legacy_id,
    'cpf_masked', public.mask_cpf(record.cpf),
    'status', record.status,
    'unidade_id', record.unidade_id,
    'legacy_unidade_id', record.legacy_unidade_id,
    'cargo', record.cargo,
    'vinculo', record.vinculo,
    'deleted_at', record.deleted_at
  )
$$;

revoke all on function public.funcionario_audit_snapshot(public.funcionarios) from public;

create or replace function public.audit_funcionarios_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_action text;
begin
  if tg_op = 'INSERT' then
    audit_action := 'employee_created';
    perform public.insert_audit_log(
      audit_action,
      'funcionario',
      new.id,
      new.legacy_id,
      null,
      public.funcionario_audit_snapshot(new),
      jsonb_build_object('source', 'trigger')
    );
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.deleted_at is null and new.deleted_at is not null then
      audit_action := 'employee_soft_deleted';
    elsif old.status is distinct from new.status and new.status = 'Exonerado' then
      audit_action := 'employee_exonerated';
    elsif old.status = 'Exonerado' and new.status is distinct from old.status then
      audit_action := 'employee_reactivated';
    elsif old.status is distinct from new.status then
      audit_action := 'employee_status_changed';
    elsif old.unidade_id is distinct from new.unidade_id then
      audit_action := 'employee_unit_changed';
    else
      audit_action := 'employee_updated';
    end if;

    perform public.insert_audit_log(
      audit_action,
      'funcionario',
      new.id,
      new.legacy_id,
      public.funcionario_audit_snapshot(old),
      public.funcionario_audit_snapshot(new),
      jsonb_build_object('source', 'trigger')
    );
    return new;
  end if;

  return new;
end;
$$;

revoke all on function public.audit_funcionarios_changes() from public;

drop trigger if exists audit_funcionarios_insert_update on public.funcionarios;
create trigger audit_funcionarios_insert_update
after insert or update on public.funcionarios
for each row execute function public.audit_funcionarios_changes();

create or replace function public.unidade_audit_snapshot(record public.unidades)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'legacy_id', record.legacy_id,
    'nome', record.nome,
    'tipo', record.tipo,
    'status', record.status
  )
$$;

revoke all on function public.unidade_audit_snapshot(public.unidades) from public;

create or replace function public.audit_unidades_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.insert_audit_log(
      'unit_created',
      'unidade',
      new.id,
      new.legacy_id,
      null,
      public.unidade_audit_snapshot(new),
      jsonb_build_object('source', 'trigger')
    );
    return new;
  elsif tg_op = 'UPDATE' then
    perform public.insert_audit_log(
      'unit_updated',
      'unidade',
      new.id,
      new.legacy_id,
      public.unidade_audit_snapshot(old),
      public.unidade_audit_snapshot(new),
      jsonb_build_object('source', 'trigger')
    );
    return new;
  elsif tg_op = 'DELETE' then
    perform public.insert_audit_log(
      'unit_deleted',
      'unidade',
      old.id,
      old.legacy_id,
      public.unidade_audit_snapshot(old),
      null,
      jsonb_build_object('source', 'trigger')
    );
    return old;
  end if;

  return null;
end;
$$;

revoke all on function public.audit_unidades_changes() from public;

drop trigger if exists audit_unidades_insert_update_delete on public.unidades;
create trigger audit_unidades_insert_update_delete
after insert or update or delete on public.unidades
for each row execute function public.audit_unidades_changes();

create or replace function public.profile_audit_snapshot(record public.profiles)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'role', record.role,
    'is_active', record.is_active
  )
$$;

revoke all on function public.profile_audit_snapshot(public.profiles) from public;

create or replace function public.audit_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.insert_audit_log(
      'user_profile_created',
      'profile',
      new.id,
      null,
      null,
      public.profile_audit_snapshot(new),
      jsonb_build_object('source', 'trigger')
    );
    return new;
  elsif tg_op = 'UPDATE' then
    perform public.insert_audit_log(
      'user_profile_updated',
      'profile',
      new.id,
      null,
      public.profile_audit_snapshot(old),
      public.profile_audit_snapshot(new),
      jsonb_build_object('source', 'trigger')
    );
    return new;
  end if;

  return new;
end;
$$;

revoke all on function public.audit_profile_changes() from public;

drop trigger if exists audit_profiles_insert_update on public.profiles;
create trigger audit_profiles_insert_update
after insert or update on public.profiles
for each row execute function public.audit_profile_changes();

create or replace function public.record_report_export(
  report_type text,
  filters_summary jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_id uuid;
  sanitized_filters jsonb;
begin
  if not public.is_operador_or_admin() then
    raise exception 'permission_denied' using errcode = '42501';
  end if;

  sanitized_filters :=
    coalesce(filters_summary, '{}'::jsonb)
    - 'cpf'
    - 'cpf_normalized'
    - 'nome'
    - 'email'
    - 'telefone'
    - 'search'
    - 'senha'
    - 'password'
    - 'token';

  audit_id := public.insert_audit_log(
    'report_exported',
    'report',
    null,
    null,
    null,
    null,
    jsonb_build_object(
      'report_type', report_type,
      'filters_summary', sanitized_filters,
      'filters_sanitized', true
    )
  );

  return audit_id;
end;
$$;

revoke all on function public.record_report_export(text, jsonb) from public;
grant execute on function public.record_report_export(text, jsonb) to authenticated;
