-- Fase 2 - seed técnico mínimo de dashboards configuráveis.

insert into public.dashboard_definitions (code, name, description, target_role, active, display_order)
values
  ('technical_overview', 'Início técnico', 'Resumo técnico usado para validar a fundação da Fase 2.', null, true, 1),
  ('executive', 'Executivo', 'Estrutura futura para indicadores executivos publicados.', 'secretario', true, 2)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    target_role = excluded.target_role,
    active = excluded.active,
    display_order = excluded.display_order,
    updated_at = now();

with dashboard_seed as (
  select id from public.dashboard_definitions where code = 'technical_overview'
),
widget_seed (code, title, widget_type, position_x, position_y, width, height, display_order, settings) as (
  values
    ('foundation_counts', 'Contadores da fundação', 'card'::public.dashboard_widget_type, 0, 0, 4, 2, 1, '{"source":"system_counts"}'::jsonb),
    ('featured_indicators_table', 'Indicadores estratégicos elegíveis', 'table'::public.dashboard_widget_type, 0, 2, 8, 4, 2, '{"source":"featured_indicators"}'::jsonb)
)
insert into public.dashboard_widgets (
  dashboard_id,
  code,
  title,
  widget_type,
  position_x,
  position_y,
  width,
  height,
  display_order,
  settings
)
select
  dashboard_seed.id,
  widget_seed.code,
  widget_seed.title,
  widget_seed.widget_type,
  widget_seed.position_x,
  widget_seed.position_y,
  widget_seed.width,
  widget_seed.height,
  widget_seed.display_order,
  widget_seed.settings
from dashboard_seed
cross join widget_seed
on conflict (dashboard_id, code) do update
set title = excluded.title,
    widget_type = excluded.widget_type,
    position_x = excluded.position_x,
    position_y = excluded.position_y,
    width = excluded.width,
    height = excluded.height,
    display_order = excluded.display_order,
    settings = excluded.settings,
    active = true,
    updated_at = now();

with widget as (
  select dashboard_widgets.id
  from public.dashboard_widgets
  join public.dashboard_definitions on dashboard_definitions.id = dashboard_widgets.dashboard_id
  where dashboard_definitions.code = 'technical_overview'
    and dashboard_widgets.code = 'featured_indicators_table'
),
featured as (
  select id, row_number() over (order by display_order) as display_order
  from public.indicators
  where is_dashboard_featured = true
  order by display_order
  limit 5
)
insert into public.dashboard_widget_indicators (widget_id, indicator_id, display_order, configuration)
select widget.id, featured.id, featured.display_order, '{}'::jsonb
from widget
cross join featured
on conflict (widget_id, indicator_id) do update
set display_order = excluded.display_order,
    configuration = excluded.configuration;
