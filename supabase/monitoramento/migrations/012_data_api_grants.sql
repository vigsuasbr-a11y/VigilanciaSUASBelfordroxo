-- Fase 2.1 - Grants explicitos para uso do Data API com RLS.
-- O projeto de homologacao foi criado com "Automatically expose new tables" desligado.

grant usage on schema public to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.roles,
  public.permissions,
  public.role_permissions,
  public.user_roles,
  public.units,
  public.form_versions,
  public.indicator_groups,
  public.indicators,
  public.indicator_relationships,
  public.group_observation_definitions,
  public.special_field_definitions,
  public.competencies,
  public.indicator_values,
  public.group_observations,
  public.special_field_values,
  public.validation_results,
  public.submission_reviews,
  public.publications,
  public.publication_snapshots,
  public.audit_logs,
  public.system_logs,
  public.system_settings,
  public.dashboard_definitions,
  public.dashboard_widgets,
  public.dashboard_widget_indicators
to authenticated;

grant execute on function public.current_user_is_active() to authenticated;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.can_edit_competency(uuid) to authenticated;
grant execute on function public.run_foundation_validations(uuid) to authenticated;
grant execute on function public.publish_competency(uuid, text) to authenticated;
grant execute on function public.reopen_competency(uuid, text) to authenticated;
grant execute on function public.submit_competency_for_review(uuid, text) to authenticated;
grant execute on function public.review_competency(uuid, boolean, text) to authenticated;
