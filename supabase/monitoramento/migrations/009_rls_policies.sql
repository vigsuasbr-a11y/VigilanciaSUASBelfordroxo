-- Fase 2 - Row Level Security baseada em permissões.

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.units enable row level security;
alter table public.form_versions enable row level security;
alter table public.indicator_groups enable row level security;
alter table public.indicators enable row level security;
alter table public.indicator_relationships enable row level security;
alter table public.group_observation_definitions enable row level security;
alter table public.special_field_definitions enable row level security;
alter table public.competencies enable row level security;
alter table public.indicator_values enable row level security;
alter table public.group_observations enable row level security;
alter table public.special_field_values enable row level security;
alter table public.validation_results enable row level security;
alter table public.submission_reviews enable row level security;
alter table public.publications enable row level security;
alter table public.publication_snapshots enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_logs enable row level security;
alter table public.system_settings enable row level security;
alter table public.dashboard_definitions enable row level security;
alter table public.dashboard_widgets enable row level security;
alter table public.dashboard_widget_indicators enable row level security;

drop policy if exists "profiles_select_own_or_users_view" on public.profiles;
create policy "profiles_select_own_or_users_view"
on public.profiles for select
to authenticated
using (
  public.current_user_is_active()
  and (id = auth.uid() or public.has_permission('users.view'))
);

drop policy if exists "profiles_manage_users" on public.profiles;
create policy "profiles_manage_users"
on public.profiles for all
to authenticated
using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

drop policy if exists "roles_select_users_view" on public.roles;
create policy "roles_select_users_view"
on public.roles for select
to authenticated
using (public.current_user_is_active() and public.has_permission('users.view'));

drop policy if exists "roles_manage_users" on public.roles;
create policy "roles_manage_users"
on public.roles for all
to authenticated
using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

drop policy if exists "permissions_select_users_view" on public.permissions;
create policy "permissions_select_users_view"
on public.permissions for select
to authenticated
using (public.current_user_is_active() and public.has_permission('users.view'));

drop policy if exists "permissions_manage_users" on public.permissions;
create policy "permissions_manage_users"
on public.permissions for all
to authenticated
using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

drop policy if exists "role_permissions_select_users_view" on public.role_permissions;
create policy "role_permissions_select_users_view"
on public.role_permissions for select
to authenticated
using (public.current_user_is_active() and public.has_permission('users.view'));

drop policy if exists "role_permissions_manage_users" on public.role_permissions;
create policy "role_permissions_manage_users"
on public.role_permissions for all
to authenticated
using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

drop policy if exists "user_roles_select_users_view" on public.user_roles;
create policy "user_roles_select_users_view"
on public.user_roles for select
to authenticated
using (public.current_user_is_active() and public.has_permission('users.view'));

drop policy if exists "user_roles_manage_users" on public.user_roles;
create policy "user_roles_manage_users"
on public.user_roles for all
to authenticated
using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

drop policy if exists "units_select_authorized" on public.units;
create policy "units_select_authorized"
on public.units for select
to authenticated
using (public.current_user_is_active() and public.has_permission('units.view'));

drop policy if exists "units_manage_authorized" on public.units;
create policy "units_manage_authorized"
on public.units for insert
to authenticated
with check (public.has_permission('units.manage'));

drop policy if exists "units_update_authorized" on public.units;
create policy "units_update_authorized"
on public.units for update
to authenticated
using (public.has_permission('units.manage'))
with check (public.has_permission('units.manage'));

drop policy if exists "catalog_select_authorized_form_versions" on public.form_versions;
create policy "catalog_select_authorized_form_versions"
on public.form_versions for select
to authenticated
using (public.current_user_is_active() and public.has_permission('indicators.view'));

drop policy if exists "catalog_manage_authorized_form_versions" on public.form_versions;
create policy "catalog_manage_authorized_form_versions"
on public.form_versions for all
to authenticated
using (public.has_permission('indicators.manage'))
with check (public.has_permission('indicators.manage'));

drop policy if exists "catalog_select_authorized_groups" on public.indicator_groups;
create policy "catalog_select_authorized_groups"
on public.indicator_groups for select
to authenticated
using (public.current_user_is_active() and public.has_permission('indicators.view'));

drop policy if exists "catalog_manage_authorized_groups" on public.indicator_groups;
create policy "catalog_manage_authorized_groups"
on public.indicator_groups for all
to authenticated
using (public.has_permission('indicators.manage'))
with check (public.has_permission('indicators.manage'));

drop policy if exists "catalog_select_authorized_indicators" on public.indicators;
create policy "catalog_select_authorized_indicators"
on public.indicators for select
to authenticated
using (public.current_user_is_active() and public.has_permission('indicators.view'));

drop policy if exists "catalog_manage_authorized_indicators" on public.indicators;
create policy "catalog_manage_authorized_indicators"
on public.indicators for all
to authenticated
using (public.has_permission('indicators.manage'))
with check (public.has_permission('indicators.manage'));

drop policy if exists "catalog_select_authorized_relationships" on public.indicator_relationships;
create policy "catalog_select_authorized_relationships"
on public.indicator_relationships for select
to authenticated
using (public.current_user_is_active() and public.has_permission('indicators.view'));

drop policy if exists "catalog_manage_authorized_relationships" on public.indicator_relationships;
create policy "catalog_manage_authorized_relationships"
on public.indicator_relationships for all
to authenticated
using (public.has_permission('indicators.manage'))
with check (public.has_permission('indicators.manage'));

drop policy if exists "catalog_select_authorized_observation_definitions" on public.group_observation_definitions;
create policy "catalog_select_authorized_observation_definitions"
on public.group_observation_definitions for select
to authenticated
using (public.current_user_is_active() and public.has_permission('indicators.view'));

drop policy if exists "catalog_manage_authorized_observation_definitions" on public.group_observation_definitions;
create policy "catalog_manage_authorized_observation_definitions"
on public.group_observation_definitions for all
to authenticated
using (public.has_permission('indicators.manage'))
with check (public.has_permission('indicators.manage'));

drop policy if exists "catalog_select_authorized_special_definitions" on public.special_field_definitions;
create policy "catalog_select_authorized_special_definitions"
on public.special_field_definitions for select
to authenticated
using (public.current_user_is_active() and public.has_permission('indicators.view'));

drop policy if exists "catalog_manage_authorized_special_definitions" on public.special_field_definitions;
create policy "catalog_manage_authorized_special_definitions"
on public.special_field_definitions for all
to authenticated
using (public.has_permission('indicators.manage'))
with check (public.has_permission('indicators.manage'));

drop policy if exists "competencies_select_authorized" on public.competencies;
create policy "competencies_select_authorized"
on public.competencies for select
to authenticated
using (
  public.current_user_is_active()
  and public.has_permission('competencies.view')
  and (
    status = 'published'
    or public.has_permission('competencies.edit_draft')
    or public.has_permission('competencies.review')
    or public.has_permission('competencies.publish')
  )
);

drop policy if exists "competencies_insert_authorized" on public.competencies;
create policy "competencies_insert_authorized"
on public.competencies for insert
to authenticated
with check (public.has_permission('competencies.create'));

drop policy if exists "competencies_update_authorized" on public.competencies;
create policy "competencies_update_authorized"
on public.competencies for update
to authenticated
using (
  public.current_user_is_active()
  and (
    (status <> 'published' and public.has_permission('competencies.edit_draft'))
    or public.has_permission('competencies.review')
    or public.has_permission('competencies.publish')
    or public.has_permission('competencies.reopen')
    or public.has_permission('competencies.cancel')
  )
)
with check (
  public.current_user_is_active()
  and (
    (status <> 'published' and public.has_permission('competencies.edit_draft'))
    or public.has_permission('competencies.review')
    or public.has_permission('competencies.publish')
    or public.has_permission('competencies.reopen')
    or public.has_permission('competencies.cancel')
  )
);

drop policy if exists "indicator_values_select_authorized" on public.indicator_values;
create policy "indicator_values_select_authorized"
on public.indicator_values for select
to authenticated
using (
  public.current_user_is_active()
  and public.has_permission('competencies.view')
  and exists (
    select 1
    from public.competencies c
    where c.id = competency_id
      and (
        c.status = 'published'
        or public.has_permission('competencies.edit_draft')
        or public.has_permission('competencies.review')
        or public.has_permission('competencies.publish')
      )
  )
);

drop policy if exists "indicator_values_insert_authorized" on public.indicator_values;
create policy "indicator_values_insert_authorized"
on public.indicator_values for insert
to authenticated
with check (public.can_edit_competency(competency_id));

drop policy if exists "indicator_values_update_authorized" on public.indicator_values;
create policy "indicator_values_update_authorized"
on public.indicator_values for update
to authenticated
using (public.can_edit_competency(competency_id))
with check (public.can_edit_competency(competency_id));

drop policy if exists "indicator_values_delete_authorized" on public.indicator_values;
create policy "indicator_values_delete_authorized"
on public.indicator_values for delete
to authenticated
using (public.can_edit_competency(competency_id));

drop policy if exists "group_observations_select_authorized" on public.group_observations;
create policy "group_observations_select_authorized"
on public.group_observations for select
to authenticated
using (
  public.current_user_is_active()
  and public.has_permission('competencies.view')
  and exists (
    select 1
    from public.competencies c
    where c.id = competency_id
      and (
        c.status = 'published'
        or public.has_permission('competencies.edit_draft')
        or public.has_permission('competencies.review')
        or public.has_permission('competencies.publish')
      )
  )
);

drop policy if exists "group_observations_insert_authorized" on public.group_observations;
create policy "group_observations_insert_authorized"
on public.group_observations for insert
to authenticated
with check (public.can_edit_competency(competency_id));

drop policy if exists "group_observations_update_authorized" on public.group_observations;
create policy "group_observations_update_authorized"
on public.group_observations for update
to authenticated
using (public.can_edit_competency(competency_id))
with check (public.can_edit_competency(competency_id));

drop policy if exists "group_observations_delete_authorized" on public.group_observations;
create policy "group_observations_delete_authorized"
on public.group_observations for delete
to authenticated
using (public.can_edit_competency(competency_id));

drop policy if exists "special_field_values_select_authorized" on public.special_field_values;
create policy "special_field_values_select_authorized"
on public.special_field_values for select
to authenticated
using (
  public.current_user_is_active()
  and public.has_permission('competencies.view')
  and exists (
    select 1
    from public.competencies c
    where c.id = competency_id
      and (
        c.status = 'published'
        or public.has_permission('competencies.edit_draft')
        or public.has_permission('competencies.review')
        or public.has_permission('competencies.publish')
      )
  )
);

drop policy if exists "special_field_values_insert_authorized" on public.special_field_values;
create policy "special_field_values_insert_authorized"
on public.special_field_values for insert
to authenticated
with check (public.can_edit_competency(competency_id));

drop policy if exists "special_field_values_update_authorized" on public.special_field_values;
create policy "special_field_values_update_authorized"
on public.special_field_values for update
to authenticated
using (public.can_edit_competency(competency_id))
with check (public.can_edit_competency(competency_id));

drop policy if exists "special_field_values_delete_authorized" on public.special_field_values;
create policy "special_field_values_delete_authorized"
on public.special_field_values for delete
to authenticated
using (public.can_edit_competency(competency_id));

drop policy if exists "validation_results_select_authorized" on public.validation_results;
create policy "validation_results_select_authorized"
on public.validation_results for select
to authenticated
using (public.current_user_is_active() and public.has_permission('competencies.view'));

drop policy if exists "validation_results_manage_authorized" on public.validation_results;
create policy "validation_results_manage_authorized"
on public.validation_results for all
to authenticated
using (
  public.has_permission('competencies.edit_draft')
  or public.has_permission('competencies.review')
)
with check (
  public.has_permission('competencies.edit_draft')
  or public.has_permission('competencies.review')
);

drop policy if exists "submission_reviews_select_authorized" on public.submission_reviews;
create policy "submission_reviews_select_authorized"
on public.submission_reviews for select
to authenticated
using (public.current_user_is_active() and public.has_permission('competencies.view'));

drop policy if exists "submission_reviews_insert_authorized" on public.submission_reviews;
create policy "submission_reviews_insert_authorized"
on public.submission_reviews for insert
to authenticated
with check (
  public.has_permission('competencies.submit_review')
  or public.has_permission('competencies.review')
  or public.has_permission('competencies.publish')
);

drop policy if exists "publications_select_authorized" on public.publications;
create policy "publications_select_authorized"
on public.publications for select
to authenticated
using (public.current_user_is_active() and public.has_permission('competencies.view'));

drop policy if exists "publication_snapshots_select_authorized" on public.publication_snapshots;
create policy "publication_snapshots_select_authorized"
on public.publication_snapshots for select
to authenticated
using (public.current_user_is_active() and public.has_permission('competencies.view'));

drop policy if exists "audit_logs_select_authorized" on public.audit_logs;
create policy "audit_logs_select_authorized"
on public.audit_logs for select
to authenticated
using (public.current_user_is_active() and public.has_permission('audit.view'));

drop policy if exists "system_logs_select_authorized" on public.system_logs;
create policy "system_logs_select_authorized"
on public.system_logs for select
to authenticated
using (
  public.current_user_is_active()
  and (
    public.has_permission('audit.view')
    or public.has_permission('settings.manage')
  )
);

drop policy if exists "system_settings_select_authorized" on public.system_settings;
create policy "system_settings_select_authorized"
on public.system_settings for select
to authenticated
using (
  public.current_user_is_active()
  and (is_public = true or public.has_permission('settings.manage'))
);

drop policy if exists "system_settings_manage_authorized" on public.system_settings;
create policy "system_settings_manage_authorized"
on public.system_settings for all
to authenticated
using (public.has_permission('settings.manage'))
with check (public.has_permission('settings.manage'));

drop policy if exists "dashboard_definitions_select_authorized" on public.dashboard_definitions;
create policy "dashboard_definitions_select_authorized"
on public.dashboard_definitions for select
to authenticated
using (
  public.current_user_is_active()
  and active = true
  and public.has_permission('dashboard.view')
);

drop policy if exists "dashboard_definitions_manage_authorized" on public.dashboard_definitions;
create policy "dashboard_definitions_manage_authorized"
on public.dashboard_definitions for all
to authenticated
using (public.has_permission('settings.manage'))
with check (public.has_permission('settings.manage'));

drop policy if exists "dashboard_widgets_select_authorized" on public.dashboard_widgets;
create policy "dashboard_widgets_select_authorized"
on public.dashboard_widgets for select
to authenticated
using (
  public.current_user_is_active()
  and active = true
  and public.has_permission('dashboard.view')
);

drop policy if exists "dashboard_widgets_manage_authorized" on public.dashboard_widgets;
create policy "dashboard_widgets_manage_authorized"
on public.dashboard_widgets for all
to authenticated
using (public.has_permission('settings.manage'))
with check (public.has_permission('settings.manage'));

drop policy if exists "dashboard_widget_indicators_select_authorized" on public.dashboard_widget_indicators;
create policy "dashboard_widget_indicators_select_authorized"
on public.dashboard_widget_indicators for select
to authenticated
using (public.current_user_is_active() and public.has_permission('dashboard.view'));

drop policy if exists "dashboard_widget_indicators_manage_authorized" on public.dashboard_widget_indicators;
create policy "dashboard_widget_indicators_manage_authorized"
on public.dashboard_widget_indicators for all
to authenticated
using (public.has_permission('settings.manage'))
with check (public.has_permission('settings.manage'));

