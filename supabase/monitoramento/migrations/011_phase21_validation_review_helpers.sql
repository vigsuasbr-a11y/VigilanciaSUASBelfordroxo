-- Fase 2.1 - validações de tipo e funções auxiliares para homologação real.

create or replace function public.validate_indicator_value_type()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_type public.indicator_data_type;
  minimum numeric;
  maximum numeric;
begin
  select i.data_type, i.minimum_value, i.maximum_value
    into target_type, minimum, maximum
  from public.indicators i
  where i.id = new.indicator_id;

  if target_type is null then
    raise exception 'Indicador não encontrado'
      using errcode = '23503';
  end if;

  if new.value_status in ('not_informed', 'not_applicable') then
    if new.numeric_value is not null or new.text_value is not null then
      raise exception 'Valor % não deve conter numeric_value nem text_value', new.value_status
        using errcode = '23514';
    end if;

    return new;
  end if;

  if target_type in ('integer', 'decimal', 'percentage', 'boolean') then
    if new.numeric_value is null or new.text_value is not null then
      raise exception 'Indicador % exige numeric_value informado', target_type
        using errcode = '23514';
    end if;
  end if;

  if target_type in ('short_text', 'long_text') then
    if new.text_value is null or new.numeric_value is not null then
      raise exception 'Indicador % exige text_value informado', target_type
        using errcode = '23514';
    end if;
  end if;

  if target_type = 'integer' and new.numeric_value <> trunc(new.numeric_value) then
    raise exception 'Indicador inteiro não aceita casas decimais'
      using errcode = '23514';
  end if;

  if target_type = 'boolean' and new.numeric_value not in (0, 1) then
    raise exception 'Indicador booleano aceita apenas 0 ou 1'
      using errcode = '23514';
  end if;

  if target_type = 'percentage' and (new.numeric_value < 0 or new.numeric_value > 100) then
    raise exception 'Indicador percentual deve estar entre 0 e 100'
      using errcode = '23514';
  end if;

  if minimum is not null and new.numeric_value is not null and new.numeric_value < minimum then
    raise exception 'Valor menor que o mínimo permitido'
      using errcode = '23514';
  end if;

  if maximum is not null and new.numeric_value is not null and new.numeric_value > maximum then
    raise exception 'Valor maior que o máximo permitido'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function public.validate_special_field_value_type()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_type public.indicator_data_type;
begin
  select sfd.proposed_data_type
    into target_type
  from public.special_field_definitions sfd
  where sfd.id = new.special_field_definition_id;

  if target_type is null then
    raise exception 'Campo especial não encontrado'
      using errcode = '23503';
  end if;

  if new.value_status in ('not_informed', 'not_applicable') then
    if new.numeric_value is not null or new.text_value is not null then
      raise exception 'Valor % não deve conter numeric_value nem text_value', new.value_status
        using errcode = '23514';
    end if;

    return new;
  end if;

  if target_type in ('integer', 'decimal', 'percentage', 'boolean') then
    if new.numeric_value is null or new.text_value is not null then
      raise exception 'Campo especial % exige numeric_value informado', target_type
        using errcode = '23514';
    end if;
  end if;

  if target_type in ('short_text', 'long_text') then
    if new.text_value is null or new.numeric_value is not null then
      raise exception 'Campo especial % exige text_value informado', target_type
        using errcode = '23514';
    end if;
  end if;

  if target_type = 'integer' and new.numeric_value <> trunc(new.numeric_value) then
    raise exception 'Campo especial inteiro não aceita casas decimais'
      using errcode = '23514';
  end if;

  if target_type = 'boolean' and new.numeric_value not in (0, 1) then
    raise exception 'Campo especial booleano aceita apenas 0 ou 1'
      using errcode = '23514';
  end if;

  if target_type = 'percentage' and (new.numeric_value < 0 or new.numeric_value > 100) then
    raise exception 'Campo especial percentual deve estar entre 0 e 100'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_indicator_value_type on public.indicator_values;
create trigger validate_indicator_value_type before insert or update on public.indicator_values
for each row execute function public.validate_indicator_value_type();

drop trigger if exists validate_special_field_value_type on public.special_field_values;
create trigger validate_special_field_value_type before insert or update on public.special_field_values
for each row execute function public.validate_special_field_value_type();

create or replace function public.submit_competency_for_review(target_competency_id uuid, review_comment text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_permission('competencies.submit_review') then
    raise exception 'Permissão insuficiente para enviar revisão'
      using errcode = '42501';
  end if;

  update public.competencies
  set status = 'pending_review',
      submitted_by = auth.uid(),
      submitted_at = now(),
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_competency_id
    and status in ('draft', 'in_progress', 'returned_for_correction', 'reopened');

  if not found then
    raise exception 'Competência não pode ser enviada para revisão no status atual'
      using errcode = '23514';
  end if;

  insert into public.submission_reviews (competency_id, action, reviewer_id, comment)
  values (target_competency_id, 'submitted_for_review', auth.uid(), review_comment);
end;
$$;

create or replace function public.review_competency(target_competency_id uuid, approve boolean, review_comment text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_status public.competency_status;
  review_action public.review_action;
begin
  if not public.has_permission('competencies.review') then
    raise exception 'Permissão insuficiente para revisar'
      using errcode = '42501';
  end if;

  next_status := case when approve then 'reviewed'::public.competency_status else 'returned_for_correction'::public.competency_status end;
  review_action := case when approve then 'approved'::public.review_action else 'returned_for_correction'::public.review_action end;

  update public.competencies
  set status = next_status,
      reviewed_by = case when approve then auth.uid() else reviewed_by end,
      reviewed_at = case when approve then now() else reviewed_at end,
      updated_by = auth.uid(),
      updated_at = now()
  where id = target_competency_id
    and status = 'pending_review';

  if not found then
    raise exception 'Somente competências em revisão podem ser aprovadas ou devolvidas'
      using errcode = '23514';
  end if;

  insert into public.submission_reviews (competency_id, action, reviewer_id, comment)
  values (target_competency_id, review_action, auth.uid(), review_comment);
end;
$$;

create or replace function public.log_system_event(
  event_level public.system_log_level,
  event_source text,
  event_code text,
  event_message text,
  event_details jsonb default '{}'::jsonb,
  target_competency_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  insert into public.system_logs (
    level,
    source,
    event_code,
    message,
    details,
    user_id,
    competency_id,
    environment
  )
  values (
    event_level,
    event_source,
    event_code,
    event_message,
    coalesce(event_details, '{}'::jsonb),
    auth.uid(),
    target_competency_id,
    coalesce(current_setting('app.environment', true), 'unknown')
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

