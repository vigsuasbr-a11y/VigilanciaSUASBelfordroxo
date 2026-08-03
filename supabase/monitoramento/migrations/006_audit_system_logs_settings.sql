-- Fase 2 - auditoria, logs técnicos e configurações.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  unit_id uuid references public.units(id),
  competency_id uuid references public.competencies(id),
  indicator_id uuid references public.indicators(id),
  old_value jsonb,
  new_value jsonb,
  reason text,
  session_identifier text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  level public.system_log_level not null,
  source text not null,
  event_code text not null,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  user_id uuid references public.profiles(id),
  competency_id uuid references public.competencies(id),
  request_id text,
  environment text not null default 'unknown',
  occurred_at timestamptz not null default now(),
  resolved boolean not null default false,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz
);

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

comment on table public.audit_logs is 'Histórico append-only de alterações de negócio e segurança.';
comment on table public.system_logs is 'Falhas e eventos técnicos; não registrar senhas, tokens ou chaves.';
comment on table public.system_settings is 'Configurações institucionais e técnicas sem segredos.';
