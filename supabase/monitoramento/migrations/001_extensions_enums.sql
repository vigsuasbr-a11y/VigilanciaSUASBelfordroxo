-- Fase 2 - extensões e tipos compartilhados.

create extension if not exists pgcrypto;

do $$
begin
  create type public.form_version_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.indicator_data_type as enum (
    'integer',
    'decimal',
    'percentage',
    'short_text',
    'long_text',
    'boolean'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.indicator_calculation_type as enum (
    'monthly_stock',
    'monthly_flow',
    'annual_accumulative',
    'percentage',
    'average',
    'calculated_total',
    'textual_information',
    'non_accumulative',
    'undefined'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.annual_aggregation_type as enum (
    'sum',
    'last_available',
    'average',
    'minimum',
    'maximum',
    'none',
    'custom'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.competency_status as enum (
    'not_started',
    'draft',
    'in_progress',
    'pending_review',
    'returned_for_correction',
    'reviewed',
    'published',
    'reopened',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.value_status as enum ('informed', 'not_informed', 'not_applicable');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.validation_severity as enum ('error', 'warning', 'information');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.validation_status as enum ('open', 'justified', 'resolved', 'ignored');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_action as enum (
    'submitted_for_review',
    'approved',
    'returned_for_correction',
    'publication_authorized',
    'publication_rejected'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.publication_status as enum ('current', 'superseded', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.system_log_level as enum ('info', 'warning', 'error', 'critical');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.special_model_status as enum ('pending_confirmation', 'confirmed', 'rejected', 'archived');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.dashboard_widget_type as enum (
    'card',
    'line_chart',
    'bar_chart',
    'donut_chart',
    'table',
    'alert',
    'timeline',
    'heatmap',
    'map',
    'gauge'
  );
exception when duplicate_object then null;
end $$;
