create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text not null,
  description text not null,
  details text[] not null default '{}',
  icon_name text not null,
  access_type text not null,
  status text not null default 'em_desenvolvimento',
  url text,
  address_label text not null default '',
  authorized_audience text not null,
  restriction_message text not null,
  color text not null default 'blue',
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint systems_slug_not_blank check (length(btrim(slug)) > 0),
  constraint systems_status_valid check (
    status in ('operacional', 'manutencao', 'indisponivel', 'em_desenvolvimento')
  ),
  constraint systems_icon_valid check (icon_name in ('users', 'chart')),
  constraint systems_color_valid check (color in ('blue', 'green'))
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text not null default 'rascunho',
  href text,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notices_title_not_blank check (length(btrim(title)) > 0),
  constraint notices_status_valid check (status in ('ativo', 'rascunho', 'arquivado'))
);

create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  system_slug text not null,
  status text,
  success boolean not null default true,
  user_agent text,
  ip_address text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  constraint access_logs_system_slug_not_blank check (length(btrim(system_slug)) > 0),
  constraint access_logs_status_valid check (
    status is null or status in ('operacional', 'manutencao', 'indisponivel', 'em_desenvolvimento')
  )
);

drop trigger if exists set_systems_updated_at on public.systems;
create trigger set_systems_updated_at
before update on public.systems
for each row execute function public.set_updated_at();

drop trigger if exists set_notices_updated_at on public.notices;
create trigger set_notices_updated_at
before update on public.notices
for each row execute function public.set_updated_at();

create index if not exists idx_systems_slug on public.systems(slug);
create index if not exists idx_systems_status_sort on public.systems(status, sort_order);
create index if not exists idx_notices_status_published on public.notices(status, published_at desc);
create index if not exists idx_access_logs_created_at on public.access_logs(created_at desc);
create index if not exists idx_access_logs_system_slug on public.access_logs(system_slug);
create index if not exists idx_access_logs_user_id on public.access_logs(user_id);

alter table public.systems enable row level security;
alter table public.notices enable row level security;
alter table public.access_logs enable row level security;

grant select on public.systems to anon, authenticated;
grant select on public.notices to anon, authenticated;
grant insert on public.access_logs to anon, authenticated;
grant select on public.access_logs to authenticated;
grant insert, update, delete on public.systems to authenticated;
grant insert, update, delete on public.notices to authenticated;

drop policy if exists systems_public_select on public.systems;
drop policy if exists systems_admin_write on public.systems;
drop policy if exists notices_public_active_select on public.notices;
drop policy if exists notices_admin_select on public.notices;
drop policy if exists notices_admin_write on public.notices;
drop policy if exists access_logs_public_insert on public.access_logs;
drop policy if exists access_logs_admin_select on public.access_logs;

create policy systems_public_select
on public.systems
for select
to anon, authenticated
using (slug is not null);

create policy systems_admin_write
on public.systems
for all
to authenticated
using (public.is_administrador())
with check (public.is_administrador());

create policy notices_public_active_select
on public.notices
for select
to anon, authenticated
using (
  status = 'ativo'
  and published_at <= now()
  and (expires_at is null or expires_at >= now())
);

create policy notices_admin_select
on public.notices
for select
to authenticated
using (public.is_administrador());

create policy notices_admin_write
on public.notices
for all
to authenticated
using (public.is_administrador())
with check (public.is_administrador());

create policy access_logs_public_insert
on public.access_logs
for insert
to anon, authenticated
with check (system_slug is not null);

create policy access_logs_admin_select
on public.access_logs
for select
to authenticated
using (public.is_administrador());

insert into public.systems (
  slug,
  name,
  short_name,
  description,
  details,
  icon_name,
  access_type,
  status,
  url,
  address_label,
  authorized_audience,
  restriction_message,
  color,
  sort_order
)
values
  (
    'gestao-funcionarios',
    'Gestão de Funcionários',
    'Funcionários',
    'Cadastro, lotação, situação funcional, vínculos, afastamentos, exonerações e histórico dos profissionais da SEMASC.',
    array[
      'Cadastro completo dos profissionais',
      'Lotação, vínculos e situação funcional',
      'Histórico de afastamentos e exonerações',
      'Acesso protegido dentro do Portal da Vigilância'
    ],
    'users',
    'Sistema online protegido',
    'operacional',
    '/login?redirectTo=/funcionarios',
    'Login protegido /login',
    'Equipe autorizada Vigilância',
    'Acesso restrito a usuários autenticados e ativos.',
    'blue',
    1
  ),
  (
    'monitoramento-socioassistencial',
    'Monitoramento Socioassistencial',
    'Monitoramento',
    'Acompanhamento de indicadores, metas, atividades, unidades, prazos, pendências e relatórios da rede socioassistencial.',
    array[
      'Indicadores e metas da rede',
      'Acompanhamento de unidades e atividades',
      'Pendências, prazos e relatórios',
      'Módulo preparado para evolução futura'
    ],
    'chart',
    'Módulo web planejado',
    'em_desenvolvimento',
    '/monitoramento',
    'Rota interna /monitoramento',
    'Gestores, técnicos e equipes autorizadas',
    'O módulo está em desenvolvimento e será liberado após validação.',
    'green',
    2
  )
on conflict (slug) do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  details = excluded.details,
  icon_name = excluded.icon_name,
  access_type = excluded.access_type,
  status = excluded.status,
  url = excluded.url,
  address_label = excluded.address_label,
  authorized_audience = excluded.authorized_audience,
  restriction_message = excluded.restriction_message,
  color = excluded.color,
  sort_order = excluded.sort_order;

insert into public.notices (
  title,
  description,
  status,
  href,
  published_at
)
values
  (
    'Reunião de alinhamento - Vigilância e CRAS',
    'Encontro técnico para alinhamento das informações prioritárias da rede.',
    'ativo',
    null,
    '2026-07-18T10:00:00-03:00'
  ),
  (
    'Atualização do Sistema de Monitoramento',
    'Novas melhorias estarão disponíveis após validação da equipe técnica.',
    'ativo',
    null,
    '2026-07-15T09:00:00-03:00'
  )
on conflict do nothing;
