# Etapa 4 - Modelagem Inicial do Supabase

Migration principal: `supabase/migrations/20260721155500_initial_funcionarios_schema.sql`

Esta modelagem preserva os dados atuais e cria espaco para evolucao futura. A migration ainda nao ativa Row Level Security; as politicas RLS fazem parte da Etapa 5.

## Decisoes de Modelagem

- IDs novos usam `uuid`.
- IDs antigos sao preservados em `legacy_id`.
- Funcionarios nao terao exclusao fisica no novo sistema; o campo `deleted_at` suporta exclusao logica.
- `cpf_normalized` existe para busca e reconciliacao, mas sem `unique` inicial.
- Senhas e hashes antigos nao serao migrados.
- Perfis online usam `administrador`, `operador` e `consulta`.
- Auditoria de operacoes sera gravada em `audit_logs`.
- Toda execucao de migracao sera registrada em `migration_runs`.
- Problemas de dados serao registrados em `migration_issues`.

## Tabelas

### profiles

Relacionada a `auth.users`.

Campos principais:

- `id`
- `full_name`
- `email`
- `role`
- `is_active`
- `created_at`
- `updated_at`

### unidades

Preserva:

- identificador legado;
- nome;
- tipo;
- sigla, se existir no futuro;
- endereco;
- coordenador;
- telefone;
- status;
- data legada de criacao;
- metadados.

### funcionarios

Preserva todos os campos atuais e adiciona:

- `id uuid`;
- `legacy_id`;
- `cpf_normalized`;
- `legacy_unidade_id`;
- `data_exoneracao`;
- `deleted_at`;
- `created_by`;
- `updated_by`;
- `metadata jsonb`.

### historico_movimentacoes

Preserva os historicos atuais e adiciona:

- `legacy_id`;
- `funcionario_legacy_id`;
- `performed_by`;
- `created_at`;
- `metadata jsonb`.

### audit_logs

Registra eventos de negocio:

- criacao;
- edicao;
- alteracao de status;
- exoneracao;
- reativacao;
- mudanca de lotacao;
- exclusao logica;
- exportacao de relatorio;
- administracao.

### migration_runs

Registra cada tentativa de importacao:

- inicio e fim;
- status;
- hash de origem;
- totais importados e falhos;
- observacoes.

### migration_issues

Registra inconsistencias:

- entidade;
- ID legado;
- tipo;
- severidade;
- descricao;
- resolucao.

## Indices

A migration cria indices para:

- nome;
- CPF normalizado;
- status;
- unidade;
- cargo;
- vinculo;
- data de admissao;
- data de exoneracao;
- historico por funcionario;
- auditoria por entidade e data;
- issues por severidade e resolucao.

## Proximo Passo

Depois desta modelagem, a Etapa 5 devera ativar RLS e criar politicas separadas para:

- administrador;
- operador;
- consulta.
