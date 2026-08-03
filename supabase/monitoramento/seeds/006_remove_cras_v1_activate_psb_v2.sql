-- Final seed state: CRAS v1 is retired and CRAS v2 is the active PSB form.

do $$
declare
  legacy_form_id uuid;
begin
  select id
    into legacy_form_id
  from public.form_versions
  where code = 'cras-2026-v1';

  if legacy_form_id is not null then
    update public.audit_logs
       set competency_id = null
     where competency_id in (
       select id from public.competencies where form_version_id = legacy_form_id
     );

    update public.system_logs
       set competency_id = null
     where competency_id in (
       select id from public.competencies where form_version_id = legacy_form_id
     );

    update public.audit_logs
       set indicator_id = null
     where indicator_id in (
       select id from public.indicators where form_version_id = legacy_form_id
     );

    delete from public.competencies
     where form_version_id = legacy_form_id;

    delete from public.form_versions
     where id = legacy_form_id;
  end if;

  update public.form_versions
     set status = 'active',
         active = true,
         published_at = coalesce(published_at, now()),
         archived_at = null,
         source_metadata = jsonb_set(
           coalesce(source_metadata, '{}'::jsonb),
           '{service_label}',
           to_jsonb('PSB'::text),
           true
         )
   where code = 'cras-2026-v2';

  update public.form_versions
     set status = 'active',
         active = true,
         published_at = coalesce(published_at, now()),
         archived_at = null,
         source_metadata = jsonb_set(
           coalesce(source_metadata, '{}'::jsonb),
           '{service_label}',
           to_jsonb('PSE'::text),
           true
         )
   where code = 'creas-2026-v1';

  update public.form_versions
     set status = 'active',
         active = true,
         published_at = coalesce(published_at, now()),
         archived_at = null
   where code = 'centro-pop-2026-v1';
end $$;
