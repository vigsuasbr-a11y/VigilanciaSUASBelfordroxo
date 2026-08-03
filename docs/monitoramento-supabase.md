# Sistema de Monitoramento no Supabase

O modulo de Monitoramento Socioassistencial foi integrado ao portal em rotas
com prefixo `/monitoramento`.

## Projeto configurado

- Supabase: `[SEMASC] Sistema de Monitoramento`
- Project ref: `lwggzewhowgackaxvoce`
- URL publica: `https://lwggzewhowgackaxvoce.supabase.co`
- Usuario inicial: `vigsuasbr@gmail.com`, perfil `SEMASC`, papel `administrator`

## Variaveis de ambiente

Use um projeto Supabase separado do Sistema de Funcionarios:

```env
NEXT_PUBLIC_MONITORAMENTO_SUPABASE_URL=
NEXT_PUBLIC_MONITORAMENTO_SUPABASE_ANON_KEY=
MONITORAMENTO_SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MONITORAMENTO_APP_NAME=Sistema de Monitoramento Socioassistencial
NEXT_PUBLIC_MONITORAMENTO_APP_URL=http://localhost:3000
```

As variaveis antigas `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` continuam
reservadas para o Sistema de Funcionarios.

## Banco de dados

As migrations e seeds originais do projeto foram preservadas em:

```text
supabase/monitoramento/migrations
supabase/monitoramento/seeds
```

Para uma base nova do Supabase, aplique primeiro as migrations em ordem
numerica e depois os seeds em ordem numerica. Se houver objetos antigos nesse
projeto novo, remova somente depois de confirmar que o projeto selecionado e o
`[SEMASC] Sistema de Monitoramento`.

Base aplicada e verificada em 03/08/2026:

- 26 tabelas publicas
- 17 unidades
- 4 papeis
- 20 permissoes
- 41 associacoes papel/permissao
- 3 versoes de formulario
- 39 grupos de indicadores
- 641 indicadores
- 2 dashboards configuraveis

## Rotas principais

```text
/monitoramento/login
/monitoramento/inicio
/monitoramento/operacional
/monitoramento/competencias
/monitoramento/executivo
/monitoramento/usuarios
/monitoramento/unidades
/monitoramento/sobre
```
