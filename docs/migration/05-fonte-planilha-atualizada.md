# Etapa 6 - Fonte Atualizada de Funcionarios

Esta etapa incorpora a planilha `relatorio-funcionarios.xlsx`, recebida em
21/07/2026, como fonte atualizada para funcionarios e unidades.

A planilha original em `Downloads` nao deve ser alterada. Para auditoria foi
criada uma copia diagnostica em `local-data/xlsx-diagnostics/`, pasta ignorada
pelo Git.

## Fonte de Dados

| Domínio | Fonte nesta etapa | Observacao |
| --- | --- | --- |
| Funcionarios | Planilha atualizada | Fonte mais recente informada pela SEMASC. |
| Unidades | Aba `Unidades` da planilha | Mesma contagem do SQLite diagnosticado. |
| Historicos | SQLite diagnosticado | A planilha nao traz IDs legados nem historico de movimentacoes. |
| Usuarios | Supabase Auth + `profiles` | Senhas antigas nao serao migradas. |
| Pendencias | `migration_issues` | Inconsistencias devem ser registradas sem bloquear a primeira homologacao quando possivel. |

## Auditoria Gerada

- Relatorio sanitizado: `docs/migration/generated/xlsx-audit.md`
- Dados estruturados sanitizados: `docs/migration/generated/xlsx-audit.json`
- Revisao privada: `local-data/private-review/xlsx-review.*.json`

O relatorio versionado nao contem nomes, CPFs em texto aberto, telefones,
e-mails, coordenadores ou observacoes.

## Resultado da Auditoria

| Item | Total |
| --- | ---: |
| Funcionarios na planilha | 638 |
| Funcionarios ativos | 510 |
| Funcionarios exonerados | 128 |
| Unidades | 22 |
| Diferenca contra SQLite diagnosticado | +8 funcionarios |

## Pendencias Encontradas

| Pendencia | Total | Estrategia |
| --- | ---: | --- |
| CPFs vazios | 13 | Migrar como `null` e registrar alerta. |
| CPFs invalidos nao vazios | 6 | Preservar valor original e registrar alerta. |
| CPFs duplicados normalizados | 31 grupos, 75 registros | Nao aplicar unicidade nesta primeira carga; registrar grupos em `migration_issues`. |
| Funcionarios sem unidade | 5 | Migrar sem unidade vinculada e registrar alerta. |
| Unidades nao cadastradas | 0 | Sem acao necessaria nesta auditoria. |
| Status fora do padrao | 0 | Sem acao necessaria nesta auditoria. |

## Regra para a Proxima Carga

A importacao de funcionarios deve partir da planilha atualizada, nao do SQLite.
Como a planilha nao contem `legacy_id`, os funcionarios importados deverao
receber `legacy_source` no formato de origem da planilha, por exemplo:

```text
xlsx:Funcionarios:linha-2
```

A migracao de historicos do SQLite exige uma etapa posterior de conciliacao,
pois os historicos apontam para IDs do banco antigo. Essa conciliacao nao deve
ser feita apenas por nome.

## Comando

No PowerShell, rode sempre contra uma copia diagnostica:

```powershell
$env:FUNCIONARIOS_XLSX_PATH = "local-data\xlsx-diagnostics\relatorio-funcionarios.diagnostic.20260721-162336.xlsx"
$env:MIGRATION_WRITE_PRIVATE_REVIEW = "1"
npm run migrate:inspect-xlsx
```

Sem `MIGRATION_WRITE_PRIVATE_REVIEW=1`, apenas os relatorios sanitizados em
`docs/migration/generated/` serao atualizados.
