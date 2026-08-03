-- Fase 2 - funções e triggers de integridade.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
  );
$$;

create or replace function public.has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
    join public.roles r on r.id = ur.role_id and r.active = true
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions perm on perm.id = rp.permission_id
    where p.id = auth.uid()
      and p.active = true
      and perm.code = permission_code
  );
$$;

create or replace function public.can_edit_competency(target_competency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.competencies c
    where c.id = target_competency_id
      and c.status in ('draft', 'in_progress', 'pending_review', 'returned_for_correction', 'reviewed', 'reopened')
      and public.has_permission('competencies.edit_draft')
  );
$$;

create or replace function public.validate_competency_status_transition()
returns trigger
language plpgsql
as $$
declare
  allowed boolean;
begin
  if tg_op <> 'UPDATE' or old.status = new.status then
    return new;
  end if;

  allowed :=
    (old.status = 'not_started' and new.status = 'draft')
    or (old.status = 'draft' and new.status in ('in_progress', 'pending_review', 'cancelled'))
    or (old.status = 'in_progress' and new.status in ('pending_review', 'cancelled'))
    or (old.status = 'pending_review' and new.status in ('reviewed', 'returned_for_correction'))
    or (old.status = 'returned_for_correction' and new.status in ('in_progress', 'pending_review'))
    or (old.status = 'reviewed' and new.status in ('published', 'returned_for_correction'))
    or (old.status = 'published' and new.status = 'reopened')
    or (old.status = 'reopened' and new.status in ('in_progress', 'pending_review', 'reviewed', 'published'));

  if not allowed then
    raise exception 'Transição de status inválida: % -> %', old.status, new.status
      using errcode = '23514';
  end if;

  if new.status = 'reopened' and coalesce(new.reopen_reason, '') = '' then
    raise exception 'Reabertura exige justificativa'
      using errcode = '23514';
  end if;

  if new.status = 'cancelled' and coalesce(new.cancellation_reason, '') = '' then
    raise exception 'Cancelamento exige justificativa'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.block_published_competency_children()
returns trigger
language plpgsql
as $$
declare
  target_competency_id uuid;
  current_status public.competency_status;
begin
  target_competency_id := coalesce(new.competency_id, old.competency_id);

  select c.status
    into current_status
  from public.competencies c
  where c.id = target_competency_id;

  if current_status = 'published' then
    raise exception 'Competência publicada não pode ser editada diretamente'
      using errcode = '42501';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.ensure_indicator_matches_competency()
returns trigger
language plpgsql
as $$
declare
  competency_form uuid;
  indicator_form uuid;
begin
  select form_version_id into competency_form
  from public.competencies
  where id = new.competency_id;

  select form_version_id into indicator_form
  from public.indicators
  where id = new.indicator_id;

  if competency_form is null or indicator_form is null or competency_form <> indicator_form then
    raise exception 'Indicador não pertence à versão de formulário da competência'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_special_field_matches_competency()
returns trigger
language plpgsql
as $$
declare
  competency_form uuid;
  field_form uuid;
begin
  select form_version_id into competency_form
  from public.competencies
  where id = new.competency_id;

  select form_version_id into field_form
  from public.special_field_definitions
  where id = new.special_field_definition_id;

  if competency_form is null or field_form is null or competency_form <> field_form then
    raise exception 'Campo especial não pertence à versão de formulário da competência'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_observation_group_matches_competency()
returns trigger
language plpgsql
as $$
declare
  competency_form uuid;
  group_form uuid;
begin
  select form_version_id into competency_form
  from public.competencies
  where id = new.competency_id;

  select form_version_id into group_form
  from public.indicator_groups
  where id = new.indicator_group_id;

  if competency_form is null or group_form is null or competency_form <> group_form then
    raise exception 'Grupo de observação não pertence à versão de formulário da competência'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.refresh_completion_percentage(target_competency_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  required_total integer;
  informed_total integer;
  computed_percentage numeric(5,2);
begin
  select count(*)
    into required_total
  from public.indicators i
  join public.competencies c on c.form_version_id = i.form_version_id
  where c.id = target_competency_id
    and i.active = true
    and i.required = true;

  select count(*)
    into informed_total
  from public.indicator_values iv
  join public.indicators i on i.id = iv.indicator_id
  where iv.competency_id = target_competency_id
    and i.required = true
    and iv.value_status in ('informed', 'not_applicable');

  computed_percentage := case
    when required_total = 0 then 0
    else round((informed_total::numeric / required_total::numeric) * 100, 2)
  end;

  update public.competencies
  set completion_percentage = computed_percentage,
      updated_at = now()
  where id = target_competency_id;
end;
$$;

create or replace function public.refresh_completion_percentage_trigger()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_completion_percentage(coalesce(new.competency_id, old.competency_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.audit_row_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
  old_payload jsonb;
  new_payload jsonb;
begin
  old_payload := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  new_payload := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  row_id := nullif(
    coalesce(
      new_payload ->> 'id',
      old_payload ->> 'id',
      new_payload ->> 'user_id',
      old_payload ->> 'user_id'
    ),
    ''
  )::uuid;

  insert into public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value
  )
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    row_id,
    old_payload,
    new_payload
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs é append-only'
    using errcode = '42501';
end;
$$;

create or replace function public.prevent_system_log_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'system_logs não podem ser excluídos'
    using errcode = '42501';
end;
$$;

create or replace function public.prevent_sensitive_system_log_details()
returns trigger
language plpgsql
as $$
begin
  if new.details::text ~* '(password|token|secret|service_role|supabase_service_role_key)' then
    raise exception 'system_logs não devem registrar segredos'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function public.run_foundation_validations(target_competency_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  affected_rows integer := 0;
begin
  delete from public.validation_results
  where competency_id = target_competency_id
    and code in ('required_indicator_missing', 'relationship_total_mismatch');

  insert into public.validation_results (competency_id, indicator_id, severity, code, message, status)
  select
    c.id,
    i.id,
    'error',
    'required_indicator_missing',
    'Indicador obrigatório não preenchido.',
    'open'
  from public.competencies c
  join public.indicators i on i.form_version_id = c.form_version_id
  left join public.indicator_values iv on iv.competency_id = c.id and iv.indicator_id = i.id
  where c.id = target_competency_id
    and i.active = true
    and i.required = true
    and (iv.id is null or iv.value_status = 'not_informed');

  get diagnostics affected_rows = row_count;
  inserted_count := inserted_count + affected_rows;

  insert into public.validation_results (
    competency_id,
    indicator_id,
    relationship_id,
    severity,
    code,
    message,
    expected_value,
    actual_value,
    status
  )
  select
    c.id,
    parent.id,
    rel.id,
    'warning',
    'relationship_total_mismatch',
    'Total informado diverge da soma das subcategorias.',
    coalesce(sum(child_values.numeric_value), 0),
    parent_value.numeric_value,
    'open'
  from public.competencies c
  join public.indicator_relationships rel on rel.form_version_id = c.form_version_id
  join public.indicators parent on parent.id = rel.parent_indicator_id
  join public.indicator_values parent_value on parent_value.competency_id = c.id and parent_value.indicator_id = parent.id
  join public.indicators child on child.id = rel.child_indicator_id
  join public.indicator_values child_values on child_values.competency_id = c.id and child_values.indicator_id = child.id
  where c.id = target_competency_id
    and rel.relationship_type = 'parent_equals_sum_children'
    and rel.validation_severity = 'warning'
    and parent_value.value_status = 'informed'
    and child_values.value_status = 'informed'
  group by c.id, parent.id, rel.id, parent_value.numeric_value
  having parent_value.numeric_value <> coalesce(sum(child_values.numeric_value), 0);

  get diagnostics affected_rows = row_count;
  inserted_count := inserted_count + affected_rows;
  return inserted_count;
end;
$$;

create or replace function public.publish_competency(target_competency_id uuid, publication_reason text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  next_version integer;
  previous_publication uuid;
  new_publication uuid;
begin
  if not public.has_permission('competencies.publish') then
    raise exception 'Permissão insuficiente para publicar'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.validation_results
    where competency_id = target_competency_id
      and severity = 'error'
      and status = 'open'
  ) then
    raise exception 'Competência possui erros impeditivos abertos'
      using errcode = '23514';
  end if;

  select max(version_number) + 1
    into next_version
  from public.publications
  where competency_id = target_competency_id;

  next_version := coalesce(next_version, 1);

  select id
    into previous_publication
  from public.publications
  where competency_id = target_competency_id
    and status = 'current'
  order by version_number desc
  limit 1;

  update public.publications
  set status = 'superseded'
  where id = previous_publication;

  insert into public.publications (
    competency_id,
    version_number,
    status,
    published_by,
    publication_reason,
    supersedes_publication_id
  )
  values (
    target_competency_id,
    next_version,
    'current',
    auth.uid(),
    publication_reason,
    previous_publication
  )
  returning id into new_publication;

  insert into public.publication_snapshots (
    publication_id,
    competency_id,
    indicator_id,
    snapshot_kind,
    numeric_value,
    text_value,
    value_status,
    notes,
    source_record_id
  )
  select
    new_publication,
    iv.competency_id,
    iv.indicator_id,
    'indicator_value',
    iv.numeric_value,
    iv.text_value,
    iv.value_status,
    iv.notes,
    iv.id
  from public.indicator_values iv
  where iv.competency_id = target_competency_id;

  insert into public.publication_snapshots (
    publication_id,
    competency_id,
    special_field_definition_id,
    snapshot_kind,
    numeric_value,
    text_value,
    value_status,
    notes,
    source_record_id
  )
  select
    new_publication,
    sfv.competency_id,
    sfv.special_field_definition_id,
    'special_field_value',
    sfv.numeric_value,
    sfv.text_value,
    sfv.value_status,
    sfv.notes,
    sfv.id
  from public.special_field_values sfv
  where sfv.competency_id = target_competency_id;

  insert into public.publication_snapshots (
    publication_id,
    competency_id,
    indicator_group_id,
    snapshot_kind,
    text_value,
    value_status,
    source_record_id
  )
  select
    new_publication,
    go.competency_id,
    go.indicator_group_id,
    'group_observation',
    go.text,
    'informed',
    go.id
  from public.group_observations go
  where go.competency_id = target_competency_id;

  update public.competencies
  set status = 'published',
      published_by = auth.uid(),
      published_at = now(),
      current_publication_version = next_version,
      updated_at = now()
  where id = target_competency_id;

  insert into public.submission_reviews (competency_id, action, reviewer_id, comment)
  values (target_competency_id, 'publication_authorized', auth.uid(), publication_reason);

  return new_publication;
end;
$$;

create or replace function public.reopen_competency(target_competency_id uuid, reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission('competencies.reopen') then
    raise exception 'Permissão insuficiente para reabrir'
      using errcode = '42501';
  end if;

  if coalesce(reason, '') = '' then
    raise exception 'Reabertura exige justificativa'
      using errcode = '23514';
  end if;

  update public.competencies
  set status = 'reopened',
      reopened_by = auth.uid(),
      reopened_at = now(),
      reopen_reason = reason,
      updated_at = now()
  where id = target_competency_id
    and status = 'published';

  if not found then
    raise exception 'Somente competências publicadas podem ser reabertas'
      using errcode = '23514';
  end if;

  insert into public.submission_reviews (competency_id, action, reviewer_id, comment)
  values (target_competency_id, 'returned_for_correction', auth.uid(), reason);
end;
$$;

-- Triggers de updated_at.
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_roles_updated_at on public.roles;
create trigger set_roles_updated_at before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists set_units_updated_at on public.units;
create trigger set_units_updated_at before update on public.units
for each row execute function public.set_updated_at();

drop trigger if exists set_indicator_groups_updated_at on public.indicator_groups;
create trigger set_indicator_groups_updated_at before update on public.indicator_groups
for each row execute function public.set_updated_at();

drop trigger if exists set_indicators_updated_at on public.indicators;
create trigger set_indicators_updated_at before update on public.indicators
for each row execute function public.set_updated_at();

drop trigger if exists set_competencies_updated_at on public.competencies;
create trigger set_competencies_updated_at before update on public.competencies
for each row execute function public.set_updated_at();

drop trigger if exists set_indicator_values_updated_at on public.indicator_values;
create trigger set_indicator_values_updated_at before update on public.indicator_values
for each row execute function public.set_updated_at();

drop trigger if exists set_group_observations_updated_at on public.group_observations;
create trigger set_group_observations_updated_at before update on public.group_observations
for each row execute function public.set_updated_at();

drop trigger if exists set_special_field_values_updated_at on public.special_field_values;
create trigger set_special_field_values_updated_at before update on public.special_field_values
for each row execute function public.set_updated_at();

drop trigger if exists set_validation_results_updated_at on public.validation_results;
create trigger set_validation_results_updated_at before update on public.validation_results
for each row execute function public.set_updated_at();

drop trigger if exists set_dashboard_definitions_updated_at on public.dashboard_definitions;
create trigger set_dashboard_definitions_updated_at before update on public.dashboard_definitions
for each row execute function public.set_updated_at();

drop trigger if exists set_dashboard_widgets_updated_at on public.dashboard_widgets;
create trigger set_dashboard_widgets_updated_at before update on public.dashboard_widgets
for each row execute function public.set_updated_at();

-- Triggers de status e integridade.
drop trigger if exists validate_competency_status_transition on public.competencies;
create trigger validate_competency_status_transition before update on public.competencies
for each row execute function public.validate_competency_status_transition();

drop trigger if exists ensure_indicator_matches_competency on public.indicator_values;
create trigger ensure_indicator_matches_competency before insert or update on public.indicator_values
for each row execute function public.ensure_indicator_matches_competency();

drop trigger if exists ensure_special_field_matches_competency on public.special_field_values;
create trigger ensure_special_field_matches_competency before insert or update on public.special_field_values
for each row execute function public.ensure_special_field_matches_competency();

drop trigger if exists ensure_observation_group_matches_competency on public.group_observations;
create trigger ensure_observation_group_matches_competency before insert or update on public.group_observations
for each row execute function public.ensure_observation_group_matches_competency();

drop trigger if exists block_published_indicator_values on public.indicator_values;
create trigger block_published_indicator_values before insert or update or delete on public.indicator_values
for each row execute function public.block_published_competency_children();

drop trigger if exists block_published_group_observations on public.group_observations;
create trigger block_published_group_observations before insert or update or delete on public.group_observations
for each row execute function public.block_published_competency_children();

drop trigger if exists block_published_special_field_values on public.special_field_values;
create trigger block_published_special_field_values before insert or update or delete on public.special_field_values
for each row execute function public.block_published_competency_children();

drop trigger if exists refresh_completion_after_indicator_values on public.indicator_values;
create trigger refresh_completion_after_indicator_values after insert or update or delete on public.indicator_values
for each row execute function public.refresh_completion_percentage_trigger();

-- Triggers append-only e proteção de segredos.
drop trigger if exists prevent_audit_log_update on public.audit_logs;
create trigger prevent_audit_log_update before update on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

drop trigger if exists prevent_audit_log_delete on public.audit_logs;
create trigger prevent_audit_log_delete before delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

drop trigger if exists prevent_system_log_delete on public.system_logs;
create trigger prevent_system_log_delete before delete on public.system_logs
for each row execute function public.prevent_system_log_delete();

drop trigger if exists prevent_sensitive_system_log_details on public.system_logs;
create trigger prevent_sensitive_system_log_details before insert or update on public.system_logs
for each row execute function public.prevent_sensitive_system_log_details();

-- Auditoria de tabelas de negócio centrais.
drop trigger if exists audit_units on public.units;
create trigger audit_units after insert or update or delete on public.units
for each row execute function public.audit_row_changes();

drop trigger if exists audit_indicators on public.indicators;
create trigger audit_indicators after insert or update or delete on public.indicators
for each row execute function public.audit_row_changes();

drop trigger if exists audit_competencies on public.competencies;
create trigger audit_competencies after insert or update or delete on public.competencies
for each row execute function public.audit_row_changes();

drop trigger if exists audit_indicator_values on public.indicator_values;
create trigger audit_indicator_values after insert or update or delete on public.indicator_values
for each row execute function public.audit_row_changes();

drop trigger if exists audit_publications on public.publications;
create trigger audit_publications after insert or update or delete on public.publications
for each row execute function public.audit_row_changes();

drop trigger if exists audit_user_roles on public.user_roles;
create trigger audit_user_roles after insert or update or delete on public.user_roles
for each row execute function public.audit_row_changes();
