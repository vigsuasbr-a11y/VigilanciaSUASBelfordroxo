# Etapa 3 - Estrategia de Limpeza dos Dados

Esta estrategia parte da auditoria sanitizada em `docs/migration/generated/sqlite-audit.md`.

Nenhuma correcao automatica deve ser feita sem validacao humana. O objetivo inicial e preservar o conteudo original, migrar com rastreabilidade e registrar inconsistencias em `migration_issues`.

## Atualizacao da Fonte de Funcionarios

Em 21/07/2026 foi recebida a planilha `relatorio-funcionarios.xlsx` como fonte
atualizada de funcionarios. Para a carga de funcionarios e unidades, a estrategia
deve usar `docs/migration/generated/xlsx-audit.md` e
`05-fonte-planilha-atualizada.md`.

A auditoria abaixo continua valida como diagnostico do SQLite legado,
principalmente para historicos, estrutura local e conciliacao posterior.

## Classificacao Inicial

| Inconsistencia | Total | Classificacao | Estrategia |
| --- | ---: | --- | --- |
| CPFs duplicados normalizados | 27 grupos, 68 registros | `pode_migrar_com_alerta` | Criar `cpf_normalized`, nao aplicar `unique` agora, registrar cada grupo duplicado em `migration_issues`. |
| CPFs vazios | 13 | `pode_migrar_com_alerta` | Migrar como `null`, nao inventar CPF, solicitar revisao posterior. |
| CPFs invalidos nao vazios | 6 | `pode_migrar_com_alerta` | Preservar CPF original, preencher `cpf_normalized`, registrar alerta para revisao. |
| Datas de nascimento vazias | 246 | `pode_migrar_com_alerta` | Migrar como `null`, nao inventar data. |
| Datas de admissao vazias | 191 | `pode_migrar_com_alerta` | Migrar como `null`, nao inventar data. |
| Cargos vazios | 136 | `pode_migrar_com_alerta` | Migrar como `null`, criar pendencia de revisao. |
| Setores vazios | 506 | `pode_ser_corrigido_depois` | Migrar como `null`; campo parece opcional no modelo atual. |
| Vinculos vazios | 196 | `pode_migrar_com_alerta` | Migrar como `null`, manter regras sem bloquear cadastro existente. |
| Carga horaria vazia | 627 | `pode_ser_corrigido_depois` | Migrar como `null`; campo pouco preenchido no legado. |
| E-mail vazio | 517 | `pode_ser_corrigido_depois` | Migrar como `null`; nao e requisito para todos os funcionarios. |
| Telefone vazio | 88 | `pode_ser_corrigido_depois` | Migrar como `null`; nao bloquear. |
| Funcionarios sem unidade | 4 | `pode_migrar_com_alerta` | Migrar sem unidade vinculada e registrar alerta. |
| Historicos sem funcionario | 69 | `bloqueia_migracao` para esses historicos | Nao descartar; registrar como issue e importar apenas se for definida uma estrategia de preservacao sem violar FK. |

## Regras de Tratamento

- Nao inventar CPF.
- Nao inventar data de nascimento.
- Nao inventar cargo.
- Nao excluir duplicidades automaticamente.
- Nao fundir funcionarios apenas com base no nome.
- Nao migrar senhas antigas.
- Preservar o valor original em campos textuais.
- Converter strings vazias para `null` apenas em campos opcionais.
- Registrar toda inconsistencia em `migration_issues`.
- Criar restricoes fortes apenas depois da reconciliacao.

## CPF

O novo schema tera:

- `cpf`: valor original preservado.
- `cpf_normalized`: apenas digitos.

Nao sera criado indice unico em `cpf_normalized` na primeira migration, porque a base atual possui duplicidades.

## Datas

Formatos encontrados:

- `yyyy-mm-dd` em nascimento e admissao preenchidos.
- `sqlite_timestamp` em campos de criacao, atualizacao e historico.
- Campos vazios em nascimento e admissao.

Conversao proposta:

- `yyyy-mm-dd` para `date`.
- `sqlite_timestamp` para `timestamptz`, assumindo horario local registrado pelo sistema legado.
- vazio para `null`.
- formato desconhecido deve gerar `migration_issues` e manter metadado original.

## Historicos Orfaos

Foram encontrados 69 historicos sem funcionario correspondente. Como o novo schema deve relacionar historico a funcionario, esses registros nao podem entrar diretamente em `historico_movimentacoes` sem decisao.

Opcoes para homologacao:

- registrar em `migration_issues` e manter o conteudo original em `metadata`;
- criar uma tabela de quarentena em etapa futura, se for necessario preservar historicos orfaos fora da FK;
- revisar manualmente a causa antes da importacao definitiva.

## Padronizacao Posterior

As padronizacoes abaixo devem ser feitas depois da primeira importacao validada:

- Vinculos com variacoes de caixa, genero e grafia.
- Cargos com grafias equivalentes.
- Setores com acentos, caixa e erros de digitacao.
- Unidades vindas de planilhas com prefixos numericos.

A primeira migracao deve priorizar fidelidade ao legado e rastreabilidade.
