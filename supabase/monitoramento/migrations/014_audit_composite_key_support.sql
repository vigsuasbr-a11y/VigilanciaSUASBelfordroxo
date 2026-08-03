-- Fase 2.1 - Auditoria compativel com tabelas sem coluna id.

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

grant execute on function public.audit_row_changes() to service_role;
