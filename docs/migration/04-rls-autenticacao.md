# Etapa 5 - RLS e Autenticacao

Migration principal: `supabase/migrations/20260721162000_rls_auth_audit_policies.sql`

Esta etapa protege as tabelas de negocio e prepara a autenticacao online do Sistema de Gestao de Funcionarios. O Portal da Vigilancia permanece publico nas rotas `/`, `/sistemas` e `/monitoramento`.

## Rotas Protegidas

Rotas protegidas nesta etapa:

- `/funcionarios`
- `/funcionarios/*`

Fluxo:

- usuario sem sessao vai para `/login`;
- apos login valido, o usuario vai para `/funcionarios`;
- usuario sem profile ativo vai para `/acesso-negado`;
- a Home, Sistemas e Monitoramento nao exigem login.

## Perfis

Perfis iniciais:

- `administrador`
- `operador`
- `consulta`

Permissoes:

| Recurso | Administrador | Operador | Consulta |
| --- | --- | --- | --- |
| Visualizar funcionarios | sim | sim | sim |
| Cadastrar funcionarios | sim | sim | nao |
| Editar funcionarios | sim | sim | nao |
| Alterar status, exonerar e reativar | sim | sim | nao |
| Visualizar historicos | sim | sim | sim |
| Visualizar unidades | sim | sim | sim |
| Gerenciar unidades | sim | nao | nao |
| Gerenciar usuarios e perfis | sim | nao | nao |
| Visualizar auditoria | sim | nao | nao |
| Gerar relatorios | sim | sim | nao nesta etapa |
| Ver tabelas de migracao | sim | nao | nao |

## Funcoes Auxiliares

Foram criadas funcoes `security definer` com `set search_path`:

- `public.current_profile_role()`
- `public.has_active_role(public.app_role[])`
- `public.is_administrador()`
- `public.is_operador_or_admin()`
- `public.can_read_funcionarios()`
- `public.mask_cpf(text)`

As politicas chamam essas funcoes para evitar repeticao de consultas e para impedir que usuarios sem profile ativo acessem dados de negocio.

## Tabelas com RLS Ativado

- `profiles`
- `unidades`
- `funcionarios`
- `historico_movimentacoes`
- `audit_logs`
- `migration_runs`
- `migration_issues`

Nao foram criadas politicas permissivas do tipo `using (true)`.

## Politicas

### profiles

- usuario autenticado pode ler o proprio profile;
- administrador pode ler, criar, editar e excluir profiles;
- usuario comum nao pode alterar o proprio perfil;
- apenas administrador pode ativar, desativar ou trocar role.

### unidades

- administrador, operador e consulta podem visualizar;
- apenas administrador pode criar, editar e excluir.

### funcionarios

- administrador, operador e consulta podem visualizar;
- administrador e operador podem criar e editar;
- nao ha politica de exclusao fisica;
- exclusao futura devera ser logica via `deleted_at`.

### historico_movimentacoes

- administrador, operador e consulta podem visualizar;
- administrador e operador podem inserir;
- nao ha update/delete para historico.

### audit_logs

- apenas administrador pode visualizar;
- usuarios nao podem inserir, editar ou excluir diretamente.

### migration_runs e migration_issues

- apenas administrador pode visualizar, inserir e atualizar;
- scripts com service role poderao operar fora do frontend, sem expor a chave no navegador.

## Auditoria

Triggers gravam auditoria para:

- `employee_created`
- `employee_updated`
- `employee_status_changed`
- `employee_exonerated`
- `employee_reactivated`
- `employee_unit_changed`
- `employee_soft_deleted`
- `unit_created`
- `unit_updated`
- `unit_deleted`
- `user_profile_created`
- `user_profile_updated`

Tambem foi criada a funcao:

- `public.record_report_export(report_type text, filters_summary jsonb)`

Ela registra `report_exported` para administrador e operador. A funcao remove chaves sensiveis comuns do resumo de filtros antes de gravar auditoria.

## Historicos Orfaos

Os 69 historicos sem funcionario correspondente nao foram descartados.

Foi criado um exportador privado:

```powershell
$env:FUNCIONARIOS_SQLITE_PATH = "local-data\sqlite-diagnostics\sistema_social.diagnostic.20260721-154606.db"
npm run migrate:export-orphans
```

O arquivo gerado fica em:

`local-data/private-review/`

Essa pasta e ignorada pelo Git. Na importacao futura, esses registros devem ser cadastrados em `migration_issues` com severidade `bloqueia_migracao` e nao devem aparecer como historico valido de outro funcionario.

## Bootstrap do Primeiro Administrador

Nao ha usuario padrao e nenhuma senha deve ser registrada em migration.

Procedimento recomendado:

1. Criar o usuario inicial pelo painel do Supabase Auth.
2. Copiar o UUID do usuario criado em `auth.users`.
3. Inserir manualmente o profile correspondente no SQL Editor do Supabase:

```sql
insert into public.profiles (id, full_name, email, role, is_active)
values (
  'UUID_DO_AUTH_USER',
  'Nome do administrador',
  'email.institucional@dominio.gov.br',
  'administrador',
  true
);
```

4. Fazer login em `/login`.
5. Validar acesso a `/funcionarios`.
6. Criar os demais usuarios e profiles pela area administrativa futura.

Esse bootstrap deve ser feito por operador autorizado do projeto Supabase. Nao usar senha fixa, nao versionar credenciais e nao expor `service_role_key`.

## Testes por Perfil

Administrador:

- deve acessar `/funcionarios`;
- deve selecionar funcionarios, unidades, historicos e auditoria;
- deve criar/editar funcionarios;
- deve criar/editar/excluir unidades;
- deve criar/editar profiles;
- deve consultar `migration_runs` e `migration_issues`.

Operador:

- deve acessar `/funcionarios`;
- deve selecionar funcionarios, unidades e historicos;
- deve criar/editar funcionarios;
- deve inserir historico;
- nao deve gerenciar profiles;
- nao deve excluir unidades;
- nao deve consultar auditoria.

Consulta:

- deve acessar `/funcionarios`;
- deve selecionar funcionarios, unidades e historicos;
- nao deve criar nem editar funcionarios;
- nao deve alterar status;
- nao deve gerenciar unidades ou profiles;
- nao deve consultar auditoria.

Usuario inativo ou sem profile:

- nao deve acessar `/funcionarios`;
- deve ser direcionado a `/acesso-negado`.

## Riscos Pendentes

- As politicas ainda precisam ser testadas em um ambiente Supabase real ou local.
- A area administrativa visual ainda nao existe.
- A importacao real dos 630 funcionarios nao foi iniciada.
- Relatorios PDF/Excel ainda serao adaptados em etapa propria.
- Consulta nao gera relatorios nesta etapa; isso pode ser liberado depois com politica explicita.
