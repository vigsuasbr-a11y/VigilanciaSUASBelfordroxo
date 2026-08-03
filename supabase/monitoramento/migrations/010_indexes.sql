-- Fase 2 - índices de consulta, integridade operacional e versionamento.

create index if not exists units_code_idx on public.units (code);
create index if not exists units_active_idx on public.units (active);

create index if not exists form_versions_active_idx on public.form_versions (active);
create index if not exists form_versions_status_idx on public.form_versions (status);

create index if not exists indicator_groups_form_version_id_idx on public.indicator_groups (form_version_id);

create index if not exists indicators_form_version_id_idx on public.indicators (form_version_id);
create index if not exists indicators_group_id_idx on public.indicators (group_id);
create index if not exists indicators_code_idx on public.indicators (code);
create index if not exists indicators_dashboard_featured_idx on public.indicators (is_dashboard_featured);
create index if not exists indicators_source_row_idx on public.indicators (form_version_id, source_row);

create unique index if not exists indicator_relationships_subject_unique_idx
  on public.indicator_relationships (
    form_version_id,
    parent_indicator_id,
    coalesce(child_indicator_id, '00000000-0000-0000-0000-000000000000'::uuid),
    relationship_type
  );

create index if not exists group_observation_definitions_form_version_id_idx
  on public.group_observation_definitions (form_version_id);

create index if not exists special_field_definitions_form_version_id_idx
  on public.special_field_definitions (form_version_id);

create index if not exists competencies_unit_id_idx on public.competencies (unit_id);
create index if not exists competencies_reference_year_idx on public.competencies (reference_year);
create index if not exists competencies_reference_month_idx on public.competencies (reference_month);
create index if not exists competencies_status_idx on public.competencies (status);
create index if not exists competencies_form_version_id_idx on public.competencies (form_version_id);

create index if not exists indicator_values_competency_id_idx on public.indicator_values (competency_id);
create index if not exists indicator_values_indicator_id_idx on public.indicator_values (indicator_id);

create index if not exists group_observations_competency_id_idx on public.group_observations (competency_id);
create index if not exists special_field_values_competency_id_idx on public.special_field_values (competency_id);

create index if not exists validation_results_competency_id_idx on public.validation_results (competency_id);
create index if not exists validation_results_status_idx on public.validation_results (status);

create index if not exists publications_competency_id_idx on public.publications (competency_id);
create index if not exists publications_version_number_idx on public.publications (version_number);
create unique index if not exists publications_one_current_per_competency_idx
  on public.publications (competency_id)
  where status = 'current';

create index if not exists publication_snapshots_publication_id_idx
  on public.publication_snapshots (publication_id);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at);
create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id);
create index if not exists audit_logs_competency_id_idx on public.audit_logs (competency_id);

create index if not exists system_logs_occurred_at_idx on public.system_logs (occurred_at);
create index if not exists system_logs_level_idx on public.system_logs (level);
create index if not exists system_logs_resolved_idx on public.system_logs (resolved);

create index if not exists dashboard_widgets_dashboard_id_idx on public.dashboard_widgets (dashboard_id);

