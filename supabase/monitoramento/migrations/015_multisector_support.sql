-- Fase 4C - suporte multissetorial para CRAS, CREAS e Centro POP.

alter table public.units drop constraint if exists units_code_format;

alter table public.units
  alter column roman_number drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'units_unit_type_valid'
      and conrelid = 'public.units'::regclass
  ) then
    alter table public.units
      add constraint units_unit_type_valid
      check (unit_type in ('cras', 'creas', 'centro_pop'));
  end if;
end;
$$;

alter table public.units
  add constraint units_code_format
  check (code ~ '^(cras|creas|centro-pop)-[a-z0-9-]+$');

alter table public.form_versions
  add column if not exists service_type text not null default 'cras',
  add column if not exists source_metadata jsonb not null default '{}'::jsonb;

update public.form_versions
set service_type = 'cras'
where service_type is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'form_versions_service_type_valid'
      and conrelid = 'public.form_versions'::regclass
  ) then
    alter table public.form_versions
      add constraint form_versions_service_type_valid
      check (service_type in ('cras', 'creas', 'centro_pop'));
  end if;
end;
$$;

alter table public.form_versions
  drop constraint if exists form_versions_year_version_key;

create unique index if not exists form_versions_service_type_year_version_idx
  on public.form_versions (service_type, year, version);

comment on column public.units.unit_type is 'Tipo de servico socioassistencial: cras, creas ou centro_pop.';
comment on column public.form_versions.service_type is 'Tipo de servico ao qual o formulario versionado pertence.';
comment on column public.form_versions.source_metadata is 'Metadados tecnicos do arquivo-fonte e da extracao do catalogo.';
