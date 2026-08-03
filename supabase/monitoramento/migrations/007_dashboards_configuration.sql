-- Fase 2 - estrutura configurável de dashboards.

create table if not exists public.dashboard_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  target_role text,
  active boolean not null default true,
  display_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.dashboard_definitions(id) on delete cascade,
  code text not null,
  title text not null,
  widget_type public.dashboard_widget_type not null,
  position_x integer not null default 0,
  position_y integer not null default 0,
  width integer not null default 4 check (width > 0),
  height integer not null default 3 check (height > 0),
  display_order integer not null default 1,
  settings jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dashboard_id, code)
);

create table if not exists public.dashboard_widget_indicators (
  widget_id uuid not null references public.dashboard_widgets(id) on delete cascade,
  indicator_id uuid not null references public.indicators(id) on delete cascade,
  display_order integer not null default 1,
  configuration jsonb not null default '{}'::jsonb,
  primary key (widget_id, indicator_id)
);

comment on table public.dashboard_definitions is 'Definições de dashboards futuros; Fase 2 não implementa o dashboard executivo final.';
