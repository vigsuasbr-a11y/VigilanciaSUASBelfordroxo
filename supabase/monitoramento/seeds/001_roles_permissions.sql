-- Fase 2 - seed idempotente de papéis e permissões.

insert into public.roles (code, name, description, active)
values
  ('administrator', 'Administrador', 'Administração completa da fundação técnica.', true),
  ('vigilancia', 'Vigilância', 'Operação do monitoramento e preenchimento mensal.', true),
  ('secretario', 'Secretário', 'Consulta executiva e relatórios publicados.', true),
  ('consulta', 'Consulta', 'Leitura autorizada de dados publicados.', true)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    active = excluded.active,
    updated_at = now();

insert into public.permissions (code, name, description, module)
values
  ('dashboard.view', 'Visualizar dashboard', 'Acessa estruturas de dashboard permitidas.', 'dashboard'),
  ('dashboard.executive.view', 'Visualizar dashboard executivo', 'Acessa visão executiva quando liberada.', 'dashboard'),
  ('indicators.view', 'Visualizar indicadores', 'Consulta grupos e catálogo de indicadores.', 'indicators'),
  ('indicators.manage', 'Gerenciar indicadores', 'Cria e altera versões de catálogo.', 'indicators'),
  ('units.view', 'Visualizar unidades', 'Consulta unidades CRAS.', 'units'),
  ('units.manage', 'Gerenciar unidades', 'Cria e altera unidades CRAS.', 'units'),
  ('competencies.view', 'Visualizar competências', 'Consulta competências mensais autorizadas.', 'competencies'),
  ('competencies.create', 'Criar competências', 'Cria competências mensais.', 'competencies'),
  ('competencies.edit_draft', 'Editar rascunhos', 'Edita competências não publicadas.', 'competencies'),
  ('competencies.submit_review', 'Enviar para revisão', 'Submete competências para revisão.', 'competencies'),
  ('competencies.review', 'Revisar competências', 'Aprova ou devolve competências.', 'competencies'),
  ('competencies.publish', 'Publicar competências', 'Publica versões oficiais.', 'competencies'),
  ('competencies.reopen', 'Reabrir competências', 'Reabre competências publicadas com justificativa.', 'competencies'),
  ('competencies.cancel', 'Cancelar competências', 'Cancela competências com justificativa.', 'competencies'),
  ('users.view', 'Visualizar usuários', 'Consulta perfis, papéis e permissões.', 'users'),
  ('users.manage', 'Gerenciar usuários', 'Altera perfis, papéis e permissões.', 'users'),
  ('reports.view', 'Visualizar relatórios', 'Consulta relatórios autorizados.', 'reports'),
  ('reports.export', 'Exportar relatórios', 'Exporta relatórios autorizados.', 'reports'),
  ('audit.view', 'Visualizar auditoria', 'Consulta trilha de auditoria.', 'audit'),
  ('settings.manage', 'Gerenciar configurações', 'Altera configurações administrativas.', 'settings')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    module = excluded.module;

with role_permission_seed (role_code, permission_code) as (
  values
  ('administrator', 'dashboard.view'),
  ('administrator', 'dashboard.executive.view'),
  ('administrator', 'indicators.view'),
  ('administrator', 'indicators.manage'),
  ('administrator', 'units.view'),
  ('administrator', 'units.manage'),
  ('administrator', 'competencies.view'),
  ('administrator', 'competencies.create'),
  ('administrator', 'competencies.edit_draft'),
  ('administrator', 'competencies.submit_review'),
  ('administrator', 'competencies.review'),
  ('administrator', 'competencies.publish'),
  ('administrator', 'competencies.reopen'),
  ('administrator', 'competencies.cancel'),
  ('administrator', 'users.view'),
  ('administrator', 'users.manage'),
  ('administrator', 'reports.view'),
  ('administrator', 'reports.export'),
  ('administrator', 'audit.view'),
  ('administrator', 'settings.manage'),
  ('vigilancia', 'dashboard.view'),
  ('vigilancia', 'indicators.view'),
  ('vigilancia', 'units.view'),
  ('vigilancia', 'competencies.view'),
  ('vigilancia', 'competencies.create'),
  ('vigilancia', 'competencies.edit_draft'),
  ('vigilancia', 'competencies.submit_review'),
  ('vigilancia', 'reports.view'),
  ('vigilancia', 'audit.view'),
  ('secretario', 'dashboard.view'),
  ('secretario', 'dashboard.executive.view'),
  ('secretario', 'indicators.view'),
  ('secretario', 'units.view'),
  ('secretario', 'competencies.view'),
  ('secretario', 'reports.view'),
  ('secretario', 'reports.export'),
  ('consulta', 'dashboard.view'),
  ('consulta', 'indicators.view'),
  ('consulta', 'units.view'),
  ('consulta', 'competencies.view'),
  ('consulta', 'reports.view')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_seed seed
join public.roles r on r.code = seed.role_code
join public.permissions p on p.code = seed.permission_code
on conflict (role_id, permission_id) do nothing;
