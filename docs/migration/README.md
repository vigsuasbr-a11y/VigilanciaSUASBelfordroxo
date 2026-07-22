# Migração do Sistema de Funcionários

Este diretório documenta a migração técnica do Sistema de Gestão de Funcionários local para Supabase/Vercel.

## Arquivos

- `01-protecao-base-original.md`: cópia diagnóstica, hash, contagens e restauração.
- `generated/sqlite-audit.md`: auditoria sanitizada gerada por script.
- `generated/sqlite-audit.json`: versão estruturada da auditoria sanitizada.
- `02-estrategia-limpeza-dados.md`: tratamento das inconsistências.
- `03-modelagem-supabase.md`: decisões de schema para Supabase.
- `04-rls-autenticacao.md`: políticas RLS, auditoria e bootstrap do primeiro administrador.
- `05-fonte-planilha-atualizada.md`: uso da planilha atualizada como fonte de funcionários.
- `generated/xlsx-audit.md`: auditoria sanitizada da planilha atualizada.
- `generated/xlsx-audit.json`: versão estruturada da auditoria sanitizada da planilha.

## Comando de Auditoria

Use sempre uma cópia diagnóstica do SQLite:

```bash
FUNCIONARIOS_SQLITE_PATH="local-data/sqlite-diagnostics/sistema_social.diagnostic.20260721-154606.db" npm run migrate:inspect
```

No PowerShell:

```powershell
$env:FUNCIONARIOS_SQLITE_PATH = "local-data\sqlite-diagnostics\sistema_social.diagnostic.20260721-154606.db"
npm run migrate:inspect
```

Nunca aponte o script para o banco de produção local enquanto o sistema estiver em uso.

## Comando de Auditoria da Planilha Atualizada

Use sempre uma cópia diagnóstica da planilha em `local-data/xlsx-diagnostics/`:

```powershell
$env:FUNCIONARIOS_XLSX_PATH = "local-data\xlsx-diagnostics\relatorio-funcionarios.diagnostic.20260721-162336.xlsx"
$env:MIGRATION_WRITE_PRIVATE_REVIEW = "1"
npm run migrate:inspect-xlsx
```

O relatório versionado e sanitizado é salvo em `docs/migration/generated/`.
Quando `MIGRATION_WRITE_PRIVATE_REVIEW=1`, os detalhes com dados pessoais para
revisão interna são salvos em `local-data/private-review/`, pasta ignorada pelo
Git.

## Exportação Privada de Históricos Órfãos

```powershell
$env:FUNCIONARIOS_SQLITE_PATH = "local-data\sqlite-diagnostics\sistema_social.diagnostic.20260721-154606.db"
npm run migrate:export-orphans
```

O arquivo é salvo em `local-data/private-review/`, pasta ignorada pelo Git.
