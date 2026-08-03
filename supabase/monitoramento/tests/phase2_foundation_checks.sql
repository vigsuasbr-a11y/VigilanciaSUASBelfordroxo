-- Fase 2 - consultas de verificação pós-migration/seed.
-- Execute no SQL Editor do Supabase depois de aplicar migrations e seeds oficiais.

select 'units' as check_name, count(*) as actual, 15 as expected from public.units;
select 'groups' as check_name, count(*) as actual, 13 as expected from public.indicator_groups;
select 'indicators' as check_name, count(*) as actual, 256 as expected from public.indicators;
select 'featured_indicators' as check_name, count(*) as actual, 25 as expected
from public.indicators
where is_dashboard_featured = true;
select 'special_fields_pending' as check_name, count(*) as actual, 7 as expected
from public.special_field_definitions
where model_status = 'pending_confirmation';
select 'observations' as check_name, count(*) as actual, 13 as expected
from public.group_observation_definitions;
select 'e297_e304_sources' as check_name, count(*) as actual, 8 as expected
from public.indicators
where source_cell in ('E297', 'E298', 'E299', 'E300', 'E301', 'E302', 'E303', 'E304');
select 'a297_not_primary_indicator' as check_name, count(*) as actual, 0 as expected
from public.indicators
where source_cell = 'A297';
select 'value_type_trigger' as check_name, count(*) as actual, 1 as expected
from pg_trigger
where tgname = 'validate_indicator_value_type';
select 'special_value_type_trigger' as check_name, count(*) as actual, 1 as expected
from pg_trigger
where tgname = 'validate_special_field_value_type';
