# Auditoria Sanitizada da Planilha de Funcionarios

Gerado em: 2026-07-21T19:26:37.930Z

Fonte auditada: copia diagnostica local ignorada pelo Git.

Arquivo: `relatorio-funcionarios.diagnostic.20260721-162336.xlsx`

SHA-256 da copia auditada: `d0a9707813c20d0fb2058ba59f2de6f47d6d37d0df8b87db927a34e81788e39f`

Tamanho: 63407 bytes

Ultima modificacao do arquivo auditado: 2026-07-21T19:15:24.178Z

Este relatorio nao inclui nomes de funcionarios, CPFs em texto aberto, telefones,
e-mails, coordenadores ou observacoes. CPFs e unidades divergentes aparecem
apenas como hashes parciais quando necessario.

## Abas

| Aba | Linhas | Linhas com conteudo | Colunas | Colunas com conteudo |
| --- | ---: | ---: | ---: | ---: |
| Funcionários | 639 | 639 | 14 | 14 |
| Unidades | 23 | 23 | 5 | 5 |

## Funcionarios

| Item | Valor |
| --- | ---: |
| Aba | Funcionários |
| Linha de cabecalho detectada | 1 |
| Linhas de dados | 638 |

### Cabecalhos detectados

- Nome
- CPF
- Nascimento
- Cargo
- Setor
- Escolaridade
- Unidade
- Vinculo
- Carga horaria
- Telefone
- E-mail
- Admissao
- Status
- Observações

### Colunas esperadas ausentes

Nenhuma coluna ausente.

### Status

| Valor | Total |
| --- | ---: |
| Ativo | 510 |
| Exonerado | 128 |

### Vinculos

| Valor | Total |
| --- | ---: |
| Comissionado | 331 |
| <<vazio>> | 197 |
| INADH | 47 |
| Efetivo | 33 |
| Servidor/Estatutário | 11 |
| comissionada | 3 |
| Estatutária | 3 |
| Terceirizado | 3 |
| Estatutário | 2 |
| Outro Vínculo não permanente | 2 |
| Assistente Social | 1 |
| Comissionada | 1 |
| COMISSIONADO | 1 |
| Contrato | 1 |
| Coordenador | 1 |
| Trabalhador de Empresa/Cooperativa/Entidade prestadora de serviços | 1 |

### Campos vazios

| Item | Total |
| --- | ---: |
| nome_vazio | 0 |
| cpf_vazio | 13 |
| nascimento_vazio | 246 |
| cargo_vazio | 136 |
| setor_vazio | 514 |
| escolaridade_vazio | 35 |
| unidade_vazio | 5 |
| vinculo_vazio | 197 |
| carga_horaria_vazio | 635 |
| telefone_vazio | 88 |
| email_vazio | 522 |
| admissao_vazio | 190 |
| status_vazio | 0 |
| observacoes_vazio | 41 |

### Datas

#### Nascimento

| Formato | Total |
| --- | ---: |
| dd/mm/yyyy | 392 |
| vazio | 246 |

#### Admissao

| Formato | Total |
| --- | ---: |
| dd/mm/yyyy | 448 |
| vazio | 190 |

### CPF

| Metrica | Total |
| --- | ---: |
| Linhas analisadas | 638 |
| CPFs vazios | 13 |
| CPFs validos | 619 |
| CPFs invalidos nao vazios | 6 |
| Grupos de CPF duplicado normalizado | 31 |
| Registros dentro de grupos duplicados | 75 |

#### CPFs duplicados anonimizados

| CPF anonimizado | Registros |
| --- | ---: |
| fa69e23208a626f1 | 7 |
| 8ae0d660d87bd590 | 4 |
| e194732bfe0823da | 4 |
| 4439d29d71b12512 | 3 |
| 44491de92eb6aab4 | 3 |
| 44b04212551b090a | 3 |
| 540bb9576cbc85f2 | 3 |
| 002cdce9f66dddc5 | 2 |
| 0d5b752d9b3c7755 | 2 |
| 12107c41f18cba51 | 2 |
| 2e54683c94685f1a | 2 |
| 309d98785f440de6 | 2 |
| 4e8c840f2f7d2dd9 | 2 |
| 615691d7b4a4b127 | 2 |
| 636f8f2b5361f7bd | 2 |
| 680a9a11c5da19cb | 2 |
| 6fcc2893ffe1c042 | 2 |
| 960313f2b33e7ed7 | 2 |
| b78058d015e7821e | 2 |
| c7ccb8577adb7859 | 2 |
| c8076d8a8266a3c1 | 2 |
| c96ffd0a8fa29725 | 2 |
| cad167edea3aae23 | 2 |
| cb624c9c038ecd36 | 2 |
| cfb3d08d68d25ad5 | 2 |
| d237182af479aade | 2 |
| e0eb9d32b219bd49 | 2 |
| ec92c9aa00fef724 | 2 |
| ee91f65cb4d97b72 | 2 |
| f3450b354b87398b | 2 |
| fd74732fa1e98fd3 | 2 |

### Consistencia de unidades

| Item | Total |
| --- | ---: |
| funcionarios_sem_unidade | 5 |
| funcionarios_com_unidade_nao_listada | 0 |
| grupos_de_unidade_nao_listada | 0 |
| unidades_sem_funcionarios | 0 |
| unidades_duplicadas_por_nome_normalizado | 0 |

## Unidades

| Item | Valor |
| --- | ---: |
| Aba | Unidades |
| Linha de cabecalho detectada | 1 |
| Linhas de dados | 22 |
| Grupos de nomes duplicados | 0 |

### Cabecalhos detectados

- Nome
- Tipo
- Endereco
- Coordenador
- Telefone

### Colunas esperadas ausentes

Nenhuma coluna ausente.

### Tipos de unidade

| Valor | Total |
| --- | ---: |
| CRAS | 15 |
| CREAS | 3 |
| Abrigo | 2 |
| Centro POP | 1 |
| Secretaria | 1 |

## Comparacao com SQLite diagnosticado

| Item | SQLite | Planilha | Diferenca |
| --- | ---: | ---: | ---: |
| Funcionarios | 630 | 638 | 8 |
| Unidades | 22 | 22 | 0 |

## Resumo de pendencias

| Codigo | Severidade | Total |
| --- | --- | ---: |
| colunas_funcionarios_ausentes | ok | 0 |
| colunas_unidades_ausentes | ok | 0 |
| cpf_vazio | warning | 13 |
| cpf_invalido | warning | 6 |
| cpf_duplicado | warning | 75 |
| unidade_vazia | warning | 5 |
| unidade_nao_listada | ok | 0 |
| status_vazio | ok | 0 |
| status_fora_do_padrao | ok | 0 |
| nascimento_formato_desconhecido | ok | 0 |
| admissao_formato_desconhecido | ok | 0 |
