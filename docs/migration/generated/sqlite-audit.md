# Auditoria Sanitizada do SQLite

Gerado em: 2026-07-21T18:48:32.782Z

Fonte auditada: cópia diagnóstica local ignorada pelo Git.

SHA-256 da cópia auditada: `68799309a60e03f06637fbca002bee02214f9aa4984a279e316939f568e74170`

Tamanho: 266240 bytes

Este relatório não inclui nomes de funcionários, CPFs em texto aberto, senhas,
hashes de senha, telefones, e-mails ou outros dados pessoais. CPFs duplicados
são representados apenas por hash parcial.

## Contagens Principais

| Item | Total |
| --- | ---: |
| Funcionários | 630 |
| Funcionários ativos | 503 |
| Funcionários exonerados | 127 |
| Movimentações | 826 |
| Unidades | 22 |
| Usuários | 2 |

## Tabelas

### funcionarios

Registros: 630

```sql
CREATE TABLE funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT,
      nascimento TEXT,
      cargo TEXT,
      setor TEXT,
      escolaridade TEXT,
      unidade_id INTEGER,
      vinculo TEXT,
      carga_horaria TEXT,
      telefone TEXT,
      email TEXT,
      admissao TEXT,
      status TEXT NOT NULL DEFAULT 'Ativo',
      observacoes TEXT,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unidade_id) REFERENCES unidades(id) ON DELETE SET NULL
    )
```

#### Colunas

| Nome | Tipo | Obrigatório | Padrão | Chave primária |
| --- | --- | --- | --- | --- |
| id | INTEGER | não | - | sim |
| nome | TEXT | sim | - | não |
| cpf | TEXT | não | - | não |
| nascimento | TEXT | não | - | não |
| cargo | TEXT | não | - | não |
| setor | TEXT | não | - | não |
| escolaridade | TEXT | não | - | não |
| unidade_id | INTEGER | não | - | não |
| vinculo | TEXT | não | - | não |
| carga_horaria | TEXT | não | - | não |
| telefone | TEXT | não | - | não |
| email | TEXT | não | - | não |
| admissao | TEXT | não | - | não |
| status | TEXT | sim | 'Ativo' | não |
| observacoes | TEXT | não | - | não |
| criado_em | TEXT | não | CURRENT_TIMESTAMP | não |
| atualizado_em | TEXT | não | CURRENT_TIMESTAMP | não |

#### Relacionamentos

| Coluna | Tabela referenciada | Coluna referenciada | Ao excluir |
| --- | --- | --- | --- |
| unidade_id | unidades | id | SET NULL |

#### Índices

Nenhum índice explícito encontrado.

### historico_movimentacoes

Registros: 826

```sql
CREATE TABLE historico_movimentacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER NOT NULL,
      status_anterior TEXT,
      status_novo TEXT NOT NULL,
      data_movimentacao TEXT DEFAULT CURRENT_TIMESTAMP,
      observacao TEXT,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
    )
```

#### Colunas

| Nome | Tipo | Obrigatório | Padrão | Chave primária |
| --- | --- | --- | --- | --- |
| id | INTEGER | não | - | sim |
| funcionario_id | INTEGER | sim | - | não |
| status_anterior | TEXT | não | - | não |
| status_novo | TEXT | sim | - | não |
| data_movimentacao | TEXT | não | CURRENT_TIMESTAMP | não |
| observacao | TEXT | não | - | não |

#### Relacionamentos

| Coluna | Tabela referenciada | Coluna referenciada | Ao excluir |
| --- | --- | --- | --- |
| funcionario_id | funcionarios | id | CASCADE |

#### Índices

Nenhum índice explícito encontrado.

### unidades

Registros: 22

```sql
CREATE TABLE unidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      endereco TEXT,
      coordenador TEXT,
      telefone TEXT,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )
```

#### Colunas

| Nome | Tipo | Obrigatório | Padrão | Chave primária |
| --- | --- | --- | --- | --- |
| id | INTEGER | não | - | sim |
| nome | TEXT | sim | - | não |
| tipo | TEXT | sim | - | não |
| endereco | TEXT | não | - | não |
| coordenador | TEXT | não | - | não |
| telefone | TEXT | não | - | não |
| criado_em | TEXT | não | CURRENT_TIMESTAMP | não |

#### Relacionamentos

Nenhum relacionamento declarado.

#### Índices

Nenhum índice explícito encontrado.

### usuarios

Registros: 2

```sql
CREATE TABLE usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      perfil TEXT NOT NULL DEFAULT 'operador',
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    )
```

#### Colunas

| Nome | Tipo | Obrigatório | Padrão | Chave primária |
| --- | --- | --- | --- | --- |
| id | INTEGER | não | - | sim |
| nome | TEXT | sim | - | não |
| usuario | TEXT | sim | - | não |
| senha_hash | TEXT | sim | - | não |
| perfil | TEXT | sim | 'operador' | não |
| ativo | INTEGER | sim | 1 | não |
| criado_em | TEXT | não | CURRENT_TIMESTAMP | não |

#### Relacionamentos

Nenhum relacionamento declarado.

#### Índices

| Índice | Único | Colunas |
| --- | --- | --- |
| sqlite_autoindex_usuarios_1 | sim | usuario |

## Valores Distintos

### Status

| Valor | Total |
| --- | ---: |
| Ativo | 503 |
| Exonerado | 127 |

### Vínculos

| Valor | Total |
| --- | ---: |
| Comissionado | 324 |
| <<vazio>> | 196 |
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

### Cargos

| Valor | Total |
| --- | ---: |
| Adm / Cadunico | 140 |
| <<vazio>> | 136 |
| Assistente Social | 81 |
| Educador/Orientador Social | 53 |
| ASG | 25 |
| Psicólogo | 24 |
| Psicóloga | 18 |
| OUTROS | 17 |
| Educador / Orientador | 15 |
| Pedagogo | 13 |
| Advogado | 8 |
| Coordenadora | 7 |
| Pedagoga | 7 |
| Educação Física | 6 |
| Coordenador | 5 |
| Administrador | 3 |
| Administração | 3 |
| Educadora Social | 3 |
| Oficineiro | 3 |
| Outro | 3 |
| ADM | 2 |
| Advogada | 2 |
| API | 2 |
| APOIO ADMINISTRATIVO | 2 |
| Assessor Técnico | 2 |
| Assistente social | 2 |
| Assuntos de Familia | 2 |
| Cozinheira | 2 |
| Gestão de Recursos Humanos | 2 |
| Nutricionista | 2 |
| Subsecretaria | 2 |
| ADM / Cadunico | 1 |
| ADM Cad Unico | 1 |
| Administradora | 1 |
| Administrativo | 1 |
| ADVOGADA | 1 |
| API/ASG | 1 |
| Assessor Regional | 1 |
| ASSESSOR TECNICO | 1 |
| Cedida | 1 |
| Coordenador CadUnico | 1 |
| Coordenador Vigilância | 1 |
| Coordenadora / Pedagoga | 1 |
| COZINHEIRA | 1 |
| DIRETOR CADUNICO | 1 |
| Diretor PSB | 1 |
| Educador | 1 |
| Educador Social | 1 |
| Educadora / Orientadora | 1 |
| Jurídico | 1 |
| Motorista | 1 |
| Orientador | 1 |
| Orientadora Social | 1 |
| Pedagoga / API | 1 |
| Professor de educação física | 1 |
| Professora de Ed Fisica | 1 |
| Professora/Educadora Física | 1 |
| Programador | 1 |
| PSB | 1 |
| Psicologa | 1 |
| Psicológa | 1 |
| Sociologo | 1 |
| Socióloga | 1 |
| Superintendente Fundo | 1 |
| Superintendente PSB | 1 |
| Superintendente PSE | 1 |
| TECNICO DE NIVEL MEDIO | 1 |
| TI | 1 |
| Técnico de Referência SCFV | 1 |

### Unidades

| Unidade | Tipo | Total |
| --- | --- | ---: |
| ABRIGO LAR DA ESPERANÇA | Abrigo | 1 |
| Casa Lar | Abrigo | 1 |
| Centro POP | Centro POP | 1 |
| CRAS BABI | CRAS | 1 |
| CRAS BOM PASTOR | CRAS | 1 |
| CRAS CENTRO | CRAS | 1 |
| CRAS JARDIM DO IPÊ | CRAS | 1 |
| CRAS JARDIM REDENTOR | CRAS | 1 |
| CRAS LOTE XV | CRAS | 1 |
| CRAS NOVA AURORA | CRAS | 1 |
| CRAS PARQUE SUÉCIA | CRAS | 1 |
| CRAS PARQUE SÃO JOSÉ | CRAS | 1 |
| CRAS RONCALLI | CRAS | 1 |
| CRAS SANTA MARTA | CRAS | 1 |
| CRAS SANTA TEREZA | CRAS | 1 |
| CRAS SHANGRILÁ | CRAS | 1 |
| CRAS WONA | CRAS | 1 |
| CRAS XAVANTES | CRAS | 1 |
| CREAS I | CREAS | 1 |
| CREAS II | CREAS | 1 |
| CREAS III | CREAS | 1 |
| SEDE | Secretaria | 1 |

### Setores

| Valor | Total |
| --- | ---: |
| <<vazio>> | 506 |
| Complexo da Cidadania | 12 |
| Coordenadora | 12 |
| PSB | 10 |
| Gabinete | 7 |
| PSE | 7 |
| Almoxarifado | 5 |
| CadUnico | 5 |
| Fundo | 5 |
| GABINETE (F) | 5 |
| Motorista | 5 |
| Segurança Alimentar | 5 |
| Coordenador | 4 |
| Jurídico | 4 |
| ASG | 3 |
| Conselho | 3 |
| Oficineiro | 3 |
| RH | 3 |
| Sede | 3 |
| Vigilância Socioassistencial | 3 |
| Comunicação | 2 |
| Família Acolhedora | 2 |
| TI | 2 |
| CADUNICO | 1 |
| COMPLEXO DA CIDADANIA | 1 |
| Contabilidade | 1 |
| Educação Permanente | 1 |
| Familia acolhedora | 1 |
| GABINETE | 1 |
| Gestão SUAS | 1 |
| PADARIA ESCOLA | 1 |
| Padaria Escola | 1 |
| Padaria escola | 1 |
| SEMASC | 1 |
| Superintendente SUAS | 1 |
| TECNICO NIVEL SUPERIOR | 1 |
| VIgilância Socioassitencial | 1 |

## Formatos de Data

### funcionarios_nascimento

| Formato | Total |
| --- | ---: |
| yyyy-mm-dd | 384 |
| vazio | 246 |

### funcionarios_admissao

| Formato | Total |
| --- | ---: |
| yyyy-mm-dd | 439 |
| vazio | 191 |

### funcionarios_criado_em

| Formato | Total |
| --- | ---: |
| sqlite_timestamp | 630 |

### funcionarios_atualizado_em

| Formato | Total |
| --- | ---: |
| sqlite_timestamp | 630 |

### historico_data_movimentacao

| Formato | Total |
| --- | ---: |
| sqlite_timestamp | 826 |

## CPF

| Métrica | Total |
| --- | ---: |
| CPFs vazios | 13 |
| CPFs inválidos não vazios | 6 |
| Grupos de CPF duplicado normalizado | 27 |
| Registros dentro de grupos duplicados | 68 |

### CPFs duplicados anonimizados

| CPF anonimizado | Registros |
| --- | ---: |
| fa69e23208a626f1 | 7 |
| 8ae0d660d87bd590 | 4 |
| e194732bfe0823da | 4 |
| 002cdce9f66dddc5 | 3 |
| 4439d29d71b12512 | 3 |
| 44491de92eb6aab4 | 3 |
| 44b04212551b090a | 3 |
| 540bb9576cbc85f2 | 3 |
| 0d5b752d9b3c7755 | 2 |
| 12107c41f18cba51 | 2 |
| 2e54683c94685f1a | 2 |
| 309d98785f440de6 | 2 |
| 4e8c840f2f7d2dd9 | 2 |
| 680a9a11c5da19cb | 2 |
| 6fcc2893ffe1c042 | 2 |
| b78058d015e7821e | 2 |
| c7ccb8577adb7859 | 2 |
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

## Campos Vazios

| Item | Total |
| --- | ---: |
| cpf_vazio | 13 |
| nascimento_vazio | 246 |
| cargo_vazio | 136 |
| setor_vazio | 506 |
| escolaridade_vazio | 35 |
| unidade_vazia | 4 |
| vinculo_vazio | 196 |
| carga_horaria_vazia | 627 |
| telefone_vazio | 88 |
| email_vazio | 517 |
| admissao_vazio | 191 |

## Registros Órfãos

| Item | Total |
| --- | ---: |
| funcionarios_sem_unidade | 4 |
| funcionarios_com_unidade_inexistente | 0 |
| historicos_sem_funcionario | 69 |

## Usuários e Perfis

| Métrica | Total |
| --- | ---: |
| Usuários | 2 |
| Usuários ativos | 2 |

### Usuários por perfil

| Valor | Total |
| --- | ---: |
| administrador | 2 |
