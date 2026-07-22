import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";

const defaultOutputDir = path.resolve("docs/migration/generated");
const dbPath = process.env.FUNCIONARIOS_SQLITE_PATH
  ? path.resolve(process.env.FUNCIONARIOS_SQLITE_PATH)
  : "";
const outputDir = process.env.MIGRATION_AUDIT_OUTPUT_DIR
  ? path.resolve(process.env.MIGRATION_AUDIT_OUTPUT_DIR)
  : defaultOutputDir;

if (!dbPath) {
  console.error(
    "Informe FUNCIONARIOS_SQLITE_PATH apontando para a cópia diagnóstica do SQLite.",
  );
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error(`Arquivo SQLite não encontrado: ${dbPath}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const SQL = await initSqlJs();
const dbBuffer = fs.readFileSync(dbPath);
const db = new SQL.Database(dbBuffer);
const sourceHash = crypto.createHash("sha256").update(dbBuffer).digest("hex");
const auditedAt = new Date().toISOString();

function selectAll(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];

  try {
    stmt.bind(params);
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
  } finally {
    stmt.free();
  }

  return rows;
}

function selectOne(sql, params = []) {
  return selectAll(sql, params)[0] ?? null;
}

function tableExists(table) {
  return Boolean(
    selectOne(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      [table],
    ),
  );
}

function quoteIdent(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function distinctWithCount(table, column) {
  if (!tableExists(table)) return [];

  return selectAll(
    `
      SELECT
        COALESCE(NULLIF(TRIM(${quoteIdent(column)}), ''), '<<vazio>>') AS value,
        COUNT(*) AS total
      FROM ${quoteIdent(table)}
      GROUP BY COALESCE(NULLIF(TRIM(${quoteIdent(column)}), ''), '<<vazio>>')
      ORDER BY total DESC, value COLLATE NOCASE
    `,
  );
}

function normalizeCpf(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function isValidCpf(value) {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);
  const first = digits
    .slice(0, 9)
    .reduce((sum, digit, index) => sum + digit * (10 - index), 0);
  const firstCheck = (first * 10) % 11;
  if ((firstCheck === 10 ? 0 : firstCheck) !== digits[9]) return false;

  const second = digits
    .slice(0, 10)
    .reduce((sum, digit, index) => sum + digit * (11 - index), 0);
  const secondCheck = (second * 10) % 11;
  return (secondCheck === 10 ? 0 : secondCheck) === digits[10];
}

function anonymize(value) {
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest("hex")
    .slice(0, 16);
}

function classifyDateValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "vazio";
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return "yyyy-mm-dd";
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return "sqlite_timestamp";
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) return "dd/mm/yyyy";
  return "outro";
}

function dateFormatSummary(table, column) {
  if (!tableExists(table)) return [];
  const rows = selectAll(`SELECT ${quoteIdent(column)} AS value FROM ${quoteIdent(table)}`);
  const counts = new Map();

  for (const row of rows) {
    const classification = classifyDateValue(row.value);
    counts.set(classification, (counts.get(classification) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([format, total]) => ({ format, total }))
    .sort((a, b) => b.total - a.total || a.format.localeCompare(b.format));
}

function emptyFieldSummary() {
  if (!tableExists("funcionarios")) return {};

  return selectOne(`
    SELECT
      SUM(CASE WHEN cpf IS NULL OR TRIM(cpf) = '' THEN 1 ELSE 0 END) AS cpf_vazio,
      SUM(CASE WHEN nascimento IS NULL OR TRIM(nascimento) = '' THEN 1 ELSE 0 END) AS nascimento_vazio,
      SUM(CASE WHEN cargo IS NULL OR TRIM(cargo) = '' THEN 1 ELSE 0 END) AS cargo_vazio,
      SUM(CASE WHEN setor IS NULL OR TRIM(setor) = '' THEN 1 ELSE 0 END) AS setor_vazio,
      SUM(CASE WHEN escolaridade IS NULL OR TRIM(escolaridade) = '' THEN 1 ELSE 0 END) AS escolaridade_vazio,
      SUM(CASE WHEN unidade_id IS NULL THEN 1 ELSE 0 END) AS unidade_vazia,
      SUM(CASE WHEN vinculo IS NULL OR TRIM(vinculo) = '' THEN 1 ELSE 0 END) AS vinculo_vazio,
      SUM(CASE WHEN carga_horaria IS NULL OR TRIM(carga_horaria) = '' THEN 1 ELSE 0 END) AS carga_horaria_vazia,
      SUM(CASE WHEN telefone IS NULL OR TRIM(telefone) = '' THEN 1 ELSE 0 END) AS telefone_vazio,
      SUM(CASE WHEN email IS NULL OR TRIM(email) = '' THEN 1 ELSE 0 END) AS email_vazio,
      SUM(CASE WHEN admissao IS NULL OR TRIM(admissao) = '' THEN 1 ELSE 0 END) AS admissao_vazio
    FROM funcionarios
  `);
}

function cpfSummary() {
  if (!tableExists("funcionarios")) {
    return {
      emptyCount: 0,
      invalidCount: 0,
      duplicateNormalizedCount: 0,
      duplicateGroups: [],
    };
  }

  const rows = selectAll("SELECT id, cpf FROM funcionarios");
  const nonEmpty = rows
    .map((row) => ({
      legacyId: row.id,
      normalized: normalizeCpf(row.cpf),
    }))
    .filter((row) => row.normalized);
  const invalid = nonEmpty.filter((row) => !isValidCpf(row.normalized));
  const groups = new Map();

  for (const row of nonEmpty) {
    groups.set(row.normalized, (groups.get(row.normalized) ?? 0) + 1);
  }

  const duplicateGroups = Array.from(groups.entries())
    .filter(([, total]) => total > 1)
    .map(([cpf, total]) => ({ cpf_hash: anonymize(cpf), total }))
    .sort((a, b) => b.total - a.total || a.cpf_hash.localeCompare(b.cpf_hash));

  return {
    emptyCount: rows.length - nonEmpty.length,
    invalidCount: invalid.length,
    duplicateNormalizedCount: duplicateGroups.reduce(
      (sum, group) => sum + group.total,
      0,
    ),
    duplicateGroupCount: duplicateGroups.length,
    duplicateGroups,
  };
}

function orphanSummary() {
  const summary = {};

  if (tableExists("funcionarios") && tableExists("unidades")) {
    summary.funcionarios_sem_unidade = selectOne(
      "SELECT COUNT(*) AS total FROM funcionarios WHERE unidade_id IS NULL",
    ).total;
    summary.funcionarios_com_unidade_inexistente = selectOne(`
      SELECT COUNT(*) AS total
      FROM funcionarios f
      LEFT JOIN unidades u ON u.id = f.unidade_id
      WHERE f.unidade_id IS NOT NULL AND u.id IS NULL
    `).total;
  }

  if (tableExists("historico_movimentacoes") && tableExists("funcionarios")) {
    summary.historicos_sem_funcionario = selectOne(`
      SELECT COUNT(*) AS total
      FROM historico_movimentacoes h
      LEFT JOIN funcionarios f ON f.id = h.funcionario_id
      WHERE f.id IS NULL
    `).total;
  }

  return summary;
}

function tableAudit() {
  const tables = selectAll(
    "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );

  return Object.fromEntries(
    tables.map((table) => [
      table.name,
      {
        createSql: table.sql,
        columns: selectAll(`PRAGMA table_info(${quoteIdent(table.name)})`),
        foreignKeys: selectAll(`PRAGMA foreign_key_list(${quoteIdent(table.name)})`),
        indexes: selectAll(`PRAGMA index_list(${quoteIdent(table.name)})`).map(
          (index) => ({
            ...index,
            columns: selectAll(`PRAGMA index_info(${quoteIdent(index.name)})`),
          }),
        ),
        count: selectOne(`SELECT COUNT(*) AS total FROM ${quoteIdent(table.name)}`)
          .total,
      },
    ]),
  );
}

const audit = {
  auditedAt,
  source: {
    path: dbPath,
    sizeBytes: dbBuffer.byteLength,
    sha256: sourceHash,
  },
  tables: tableAudit(),
  counts: {
    funcionarios: tableExists("funcionarios")
      ? selectOne("SELECT COUNT(*) AS total FROM funcionarios").total
      : 0,
    funcionarios_ativos: tableExists("funcionarios")
      ? selectOne("SELECT COUNT(*) AS total FROM funcionarios WHERE status = 'Ativo'")
          .total
      : 0,
    funcionarios_exonerados: tableExists("funcionarios")
      ? selectOne(
          "SELECT COUNT(*) AS total FROM funcionarios WHERE status = 'Exonerado'",
        ).total
      : 0,
    historico_movimentacoes: tableExists("historico_movimentacoes")
      ? selectOne("SELECT COUNT(*) AS total FROM historico_movimentacoes").total
      : 0,
    unidades: tableExists("unidades")
      ? selectOne("SELECT COUNT(*) AS total FROM unidades").total
      : 0,
    usuarios: tableExists("usuarios")
      ? selectOne("SELECT COUNT(*) AS total FROM usuarios").total
      : 0,
  },
  distinctValues: {
    status: distinctWithCount("funcionarios", "status"),
    vinculos: distinctWithCount("funcionarios", "vinculo"),
    cargos: distinctWithCount("funcionarios", "cargo"),
    unidades: tableExists("unidades")
      ? selectAll(`
          SELECT nome AS value, tipo, COUNT(*) AS total
          FROM unidades
          GROUP BY nome, tipo
          ORDER BY tipo COLLATE NOCASE, nome COLLATE NOCASE
        `)
      : [],
    setores: distinctWithCount("funcionarios", "setor"),
  },
  dateFormats: {
    funcionarios_nascimento: dateFormatSummary("funcionarios", "nascimento"),
    funcionarios_admissao: dateFormatSummary("funcionarios", "admissao"),
    funcionarios_criado_em: dateFormatSummary("funcionarios", "criado_em"),
    funcionarios_atualizado_em: dateFormatSummary("funcionarios", "atualizado_em"),
    historico_data_movimentacao: dateFormatSummary(
      "historico_movimentacoes",
      "data_movimentacao",
    ),
  },
  cpf: cpfSummary(),
  emptyFields: emptyFieldSummary(),
  orphanRecords: orphanSummary(),
  users: tableExists("usuarios")
    ? {
        total: selectOne("SELECT COUNT(*) AS total FROM usuarios").total,
        active: selectOne("SELECT COUNT(*) AS total FROM usuarios WHERE ativo = 1")
          .total,
        byPerfil: distinctWithCount("usuarios", "perfil"),
      }
    : { total: 0, active: 0, byPerfil: [] },
};

const jsonPath = path.join(outputDir, "sqlite-audit.json");
const markdownPath = path.join(outputDir, "sqlite-audit.md");

fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
fs.writeFileSync(markdownPath, renderMarkdown(audit), "utf8");

console.log(`Auditoria JSON: ${jsonPath}`);
console.log(`Auditoria Markdown: ${markdownPath}`);

function renderMarkdown(data) {
  return `# Auditoria Sanitizada do SQLite

Gerado em: ${data.auditedAt}

Fonte auditada: cópia diagnóstica local ignorada pelo Git.

SHA-256 da cópia auditada: \`${data.source.sha256}\`

Tamanho: ${data.source.sizeBytes} bytes

Este relatório não inclui nomes de funcionários, CPFs em texto aberto, senhas,
hashes de senha, telefones, e-mails ou outros dados pessoais. CPFs duplicados
são representados apenas por hash parcial.

## Contagens Principais

| Item | Total |
| --- | ---: |
| Funcionários | ${data.counts.funcionarios} |
| Funcionários ativos | ${data.counts.funcionarios_ativos} |
| Funcionários exonerados | ${data.counts.funcionarios_exonerados} |
| Movimentações | ${data.counts.historico_movimentacoes} |
| Unidades | ${data.counts.unidades} |
| Usuários | ${data.counts.usuarios} |

## Tabelas

${Object.entries(data.tables)
  .map(([tableName, table]) => renderTable(tableName, table))
  .join("\n\n")}

## Valores Distintos

### Status

${renderSimpleValueTable(data.distinctValues.status)}

### Vínculos

${renderSimpleValueTable(data.distinctValues.vinculos)}

### Cargos

${renderSimpleValueTable(data.distinctValues.cargos)}

### Unidades

${renderUnitTable(data.distinctValues.unidades)}

### Setores

${renderSimpleValueTable(data.distinctValues.setores)}

## Formatos de Data

${Object.entries(data.dateFormats)
  .map(
    ([field, rows]) => `### ${field}\n\n${renderFormatTable(rows)}`,
  )
  .join("\n\n")}

## CPF

| Métrica | Total |
| --- | ---: |
| CPFs vazios | ${data.cpf.emptyCount} |
| CPFs inválidos não vazios | ${data.cpf.invalidCount} |
| Grupos de CPF duplicado normalizado | ${data.cpf.duplicateGroupCount} |
| Registros dentro de grupos duplicados | ${data.cpf.duplicateNormalizedCount} |

### CPFs duplicados anonimizados

${renderDuplicateCpfTable(data.cpf.duplicateGroups)}

## Campos Vazios

${renderKeyValueTable(data.emptyFields)}

## Registros Órfãos

${renderKeyValueTable(data.orphanRecords)}

## Usuários e Perfis

| Métrica | Total |
| --- | ---: |
| Usuários | ${data.users.total} |
| Usuários ativos | ${data.users.active} |

### Usuários por perfil

${renderSimpleValueTable(data.users.byPerfil)}
`;
}

function renderTable(tableName, table) {
  return `### ${tableName}

Registros: ${table.count}

\`\`\`sql
${table.createSql}
\`\`\`

#### Colunas

| Nome | Tipo | Obrigatório | Padrão | Chave primária |
| --- | --- | --- | --- | --- |
${table.columns
  .map(
    (column) =>
      `| ${column.name} | ${column.type || "-"} | ${
        column.notnull ? "sim" : "não"
      } | ${column.dflt_value ?? "-"} | ${column.pk ? "sim" : "não"} |`,
  )
  .join("\n")}

#### Relacionamentos

${table.foreignKeys.length ? renderForeignKeyTable(table.foreignKeys) : "Nenhum relacionamento declarado."}

#### Índices

${table.indexes.length ? renderIndexTable(table.indexes) : "Nenhum índice explícito encontrado."}`;
}

function renderForeignKeyTable(rows) {
  return `| Coluna | Tabela referenciada | Coluna referenciada | Ao excluir |
| --- | --- | --- | --- |
${rows
  .map((row) => `| ${row.from} | ${row.table} | ${row.to} | ${row.on_delete} |`)
  .join("\n")}`;
}

function renderIndexTable(rows) {
  return `| Índice | Único | Colunas |
| --- | --- | --- |
${rows
  .map(
    (row) =>
      `| ${row.name} | ${row.unique ? "sim" : "não"} | ${row.columns
        .map((column) => column.name)
        .join(", ")} |`,
  )
  .join("\n")}`;
}

function renderSimpleValueTable(rows) {
  if (!rows.length) return "Nenhum valor encontrado.";
  return `| Valor | Total |
| --- | ---: |
${rows.map((row) => `| ${String(row.value).replaceAll("|", "\\|")} | ${row.total} |`).join("\n")}`;
}

function renderUnitTable(rows) {
  if (!rows.length) return "Nenhuma unidade encontrada.";
  return `| Unidade | Tipo | Total |
| --- | --- | ---: |
${rows
  .map(
    (row) =>
      `| ${String(row.value).replaceAll("|", "\\|")} | ${String(row.tipo ?? "-").replaceAll("|", "\\|")} | ${row.total} |`,
  )
  .join("\n")}`;
}

function renderFormatTable(rows) {
  if (!rows.length) return "Nenhum valor encontrado.";
  return `| Formato | Total |
| --- | ---: |
${rows.map((row) => `| ${row.format} | ${row.total} |`).join("\n")}`;
}

function renderDuplicateCpfTable(rows) {
  if (!rows.length) return "Nenhum CPF duplicado encontrado.";
  return `| CPF anonimizado | Registros |
| --- | ---: |
${rows.map((row) => `| ${row.cpf_hash} | ${row.total} |`).join("\n")}`;
}

function renderKeyValueTable(record) {
  const entries = Object.entries(record ?? {});
  if (!entries.length) return "Nenhum item encontrado.";

  return `| Item | Total |
| --- | ---: |
${entries.map(([key, value]) => `| ${key} | ${value} |`).join("\n")}`;
}
