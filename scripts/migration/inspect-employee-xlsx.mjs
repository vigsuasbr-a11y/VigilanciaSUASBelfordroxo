import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";

const xlsxPath = process.env.FUNCIONARIOS_XLSX_PATH
  ? path.resolve(process.env.FUNCIONARIOS_XLSX_PATH)
  : "";
const outputDir = process.env.MIGRATION_AUDIT_OUTPUT_DIR
  ? path.resolve(process.env.MIGRATION_AUDIT_OUTPUT_DIR)
  : path.resolve("docs/migration/generated");
const privateOutputDir = process.env.MIGRATION_PRIVATE_OUTPUT_DIR
  ? path.resolve(process.env.MIGRATION_PRIVATE_OUTPUT_DIR)
  : path.resolve("local-data/private-review");
const shouldWritePrivateReview = process.env.MIGRATION_WRITE_PRIVATE_REVIEW === "1";

if (!xlsxPath) {
  console.error(
    "Informe FUNCIONARIOS_XLSX_PATH apontando para a copia diagnostica da planilha.",
  );
  process.exit(1);
}

if (!fs.existsSync(xlsxPath)) {
  console.error(`Planilha nao encontrada: ${xlsxPath}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
if (shouldWritePrivateReview) {
  fs.mkdirSync(privateOutputDir, { recursive: true });
}

const sourceBuffer = fs.readFileSync(xlsxPath);
const sourceHash = crypto.createHash("sha256").update(sourceBuffer).digest("hex");
const sourceStat = fs.statSync(xlsxPath);
const auditedAt = new Date().toISOString();

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(xlsxPath);

const employeeSheet =
  findSheetByName(workbook, ["funcionarios", "funcionarias", "servidores"]) ??
  workbook.worksheets[0];
const unitSheet = findSheetByName(workbook, ["unidades"]);

if (!employeeSheet) {
  console.error("Nenhuma aba encontrada na planilha.");
  process.exit(1);
}

const employeeTable = readTable(employeeSheet, employeeHeaderAliases());
const unitTable = unitSheet ? readTable(unitSheet, unitHeaderAliases()) : null;

const employeeRows = employeeTable.rows;
const unitRows = unitTable?.rows ?? [];
const privateIssues = [];

const employeeExpectedColumns = [
  "nome",
  "cpf",
  "nascimento",
  "cargo",
  "setor",
  "escolaridade",
  "unidade",
  "vinculo",
  "carga_horaria",
  "telefone",
  "email",
  "admissao",
  "status",
  "observacoes",
];
const unitExpectedColumns = ["nome", "tipo", "endereco", "coordenador", "telefone"];

const employeeMissingColumns = missingColumns(
  employeeExpectedColumns,
  employeeTable.mapping,
);
const unitMissingColumns = unitTable
  ? missingColumns(unitExpectedColumns, unitTable.mapping)
  : unitExpectedColumns;

const cpfAudit = auditCpf(employeeRows);
const unitAudit = auditUnitConsistency(employeeRows, unitRows);
const dateAudits = {
  nascimento: auditDateField(employeeRows, "nascimento"),
  admissao: auditDateField(employeeRows, "admissao"),
};
const statusAudit = auditStatus(employeeRows);

collectPrivateIssues({
  rows: employeeRows,
  cpfAudit,
  unitAudit,
  statusAudit,
  dateAudits,
  issues: privateIssues,
});

const audit = {
  auditedAt,
  source: {
    fileName: path.basename(xlsxPath),
    sizeBytes: sourceBuffer.byteLength,
    sha256: sourceHash,
    lastModified: sourceStat.mtime.toISOString(),
  },
  workbook: {
    sheets: workbook.worksheets.map((sheet) => ({
      name: sheet.name,
      rowCount: sheet.rowCount,
      actualRowCount: sheet.actualRowCount,
      columnCount: sheet.columnCount,
      actualColumnCount: sheet.actualColumnCount,
    })),
  },
  funcionarios: {
    sheet: employeeSheet.name,
    detectedHeaderRow: employeeTable.headerRowNumber,
    headers: employeeTable.headers.filter(Boolean),
    missingExpectedColumns: employeeMissingColumns,
    totalRows: employeeRows.length,
    countsByStatus: countByField(employeeRows, "status"),
    countsByVinculo: countByField(employeeRows, "vinculo"),
    emptyFields: emptyFieldSummary(employeeRows, employeeExpectedColumns),
    dateFormats: dateAudits,
    cpf: {
      totalRows: cpfAudit.totalRows,
      emptyCount: cpfAudit.emptyCount,
      validCount: cpfAudit.validCount,
      invalidCount: cpfAudit.invalidRows.length,
      duplicateGroupCount: cpfAudit.duplicateGroups.length,
      duplicateNormalizedCount: cpfAudit.duplicateGroups.reduce(
        (sum, group) => sum + group.total,
        0,
      ),
      duplicateGroups: cpfAudit.duplicateGroups.map((group) => ({
        cpf_hash: group.cpfHash,
        total: group.total,
      })),
    },
    units: unitAudit.publicSummary,
    status: statusAudit.publicSummary,
  },
  unidades: {
    sheet: unitSheet?.name ?? null,
    detectedHeaderRow: unitTable?.headerRowNumber ?? null,
    headers: unitTable?.headers.filter(Boolean) ?? [],
    missingExpectedColumns: unitMissingColumns,
    totalRows: unitRows.length,
    countsByTipo: countByField(unitRows, "tipo"),
    duplicateNameGroupCount: duplicateNormalizedGroups(unitRows, "nome").length,
  },
  comparisonWithSqlite: compareWithSqlite(employeeRows.length, unitRows.length),
  issueSummary: summarizeIssues({
    employeeMissingColumns,
    unitMissingColumns,
    cpfAudit,
    unitAudit,
    statusAudit,
    dateAudits,
  }),
};

const jsonPath = path.join(outputDir, "xlsx-audit.json");
const markdownPath = path.join(outputDir, "xlsx-audit.md");

fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
fs.writeFileSync(markdownPath, renderMarkdown(audit), "utf8");

let privatePath = null;
if (shouldWritePrivateReview) {
  privatePath = path.join(
    privateOutputDir,
    `xlsx-review.${auditedAt.replace(/[:.]/g, "-")}.json`,
  );
  fs.writeFileSync(
    privatePath,
    `${JSON.stringify(
      {
        exportedAt: auditedAt,
        sourceHash,
        notes:
          "Arquivo privado para revisao. Nao versionar. Contem dados pessoais usados apenas para reconciliacao.",
        totalIssues: privateIssues.length,
        issues: privateIssues,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

console.log(`Auditoria JSON: ${jsonPath}`);
console.log(`Auditoria Markdown: ${markdownPath}`);
if (privatePath) {
  console.log(`Revisao privada: ${privatePath}`);
}
console.log(`Funcionarios analisados: ${employeeRows.length}`);
console.log(`Unidades analisadas: ${unitRows.length}`);

function findSheetByName(book, candidates) {
  return book.worksheets.find((sheet) => {
    const normalized = normalizeForMatch(sheet.name);
    return candidates.some((candidate) => normalized.includes(candidate));
  });
}

function employeeHeaderAliases() {
  return new Map([
    ["nome", "nome"],
    ["cpf", "cpf"],
    ["nascimento", "nascimento"],
    ["datanascimento", "nascimento"],
    ["datadenascimento", "nascimento"],
    ["cargo", "cargo"],
    ["funcao", "cargo"],
    ["funcaoexercida", "cargo"],
    ["setor", "setor"],
    ["escolaridade", "escolaridade"],
    ["unidade", "unidade"],
    ["unidadeorigem", "unidade"],
    ["equipamento", "unidade"],
    ["vinculo", "vinculo"],
    ["vínculo", "vinculo"],
    ["cargahoraria", "carga_horaria"],
    ["cargahorária", "carga_horaria"],
    ["telefone", "telefone"],
    ["email", "email"],
    ["e-mail", "email"],
    ["admissao", "admissao"],
    ["admissão", "admissao"],
    ["datadeadmissao", "admissao"],
    ["status", "status"],
    ["observacoes", "observacoes"],
    ["observações", "observacoes"],
    ["observacao", "observacoes"],
    ["observação", "observacoes"],
  ]);
}

function unitHeaderAliases() {
  return new Map([
    ["nome", "nome"],
    ["unidade", "nome"],
    ["tipo", "tipo"],
    ["endereco", "endereco"],
    ["endereço", "endereco"],
    ["coordenador", "coordenador"],
    ["coordenadora", "coordenador"],
    ["telefone", "telefone"],
  ]);
}

function readTable(sheet, aliases) {
  const header = detectHeaderRow(sheet, aliases);
  const mapping = mapHeaders(header.headers, aliases);
  const rows = [];

  for (let rowNumber = header.rowNumber + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const excelRow = sheet.getRow(rowNumber);
    const fields = {};
    const rawFields = {};

    for (const [field, columnNumber] of Object.entries(mapping)) {
      const cell = excelRow.getCell(columnNumber);
      fields[field] = cellToText(cell);
      rawFields[field] = cell.value ?? null;
    }

    if (Object.values(fields).some((value) => !isBlank(value))) {
      rows.push({ rowNumber, fields, rawFields });
    }
  }

  return {
    headerRowNumber: header.rowNumber,
    headers: header.headers,
    mapping,
    rows,
  };
}

function detectHeaderRow(sheet, aliases) {
  const maxRowsToScan = Math.min(sheet.rowCount || 1, 20);
  let best = { rowNumber: 1, score: -1, headers: [] };

  for (let rowNumber = 1; rowNumber <= maxRowsToScan; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const headers = [];
    let score = 0;

    for (let columnNumber = 1; columnNumber <= sheet.columnCount; columnNumber += 1) {
      const text = cellToText(row.getCell(columnNumber));
      headers[columnNumber] = text;
      if (aliases.has(headerKey(text))) score += 1;
    }

    if (score > best.score) {
      best = { rowNumber, score, headers };
    }
  }

  return best;
}

function mapHeaders(headers, aliases) {
  const mapping = {};

  headers.forEach((header, index) => {
    const canonical = aliases.get(headerKey(header));
    if (canonical && !mapping[canonical]) {
      mapping[canonical] = index;
    }
  });

  return mapping;
}

function cellToText(cell) {
  if (!cell) return "";
  if (typeof cell.text === "string" && cell.text.trim()) {
    return cell.text.trim();
  }
  return valueToText(cell.value).trim();
}

function valueToText(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text ?? "").join("");
  }
  if ("result" in value) return valueToText(value.result);
  if ("text" in value) return valueToText(value.text);
  if ("hyperlink" in value && "text" in value) return valueToText(value.text);
  return String(value);
}

function headerKey(value) {
  return normalizeForMatch(value).replaceAll(" ", "");
}

function normalizeForMatch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isBlank(value) {
  return String(value ?? "").trim() === "";
}

function normalizeBlank(value) {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
  return normalized || null;
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
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
}

function missingColumns(expected, mapping) {
  return expected.filter((field) => !mapping[field]);
}

function countByField(rows, field) {
  const counts = new Map();
  for (const row of rows) {
    const value = normalizeBlank(row.fields[field]) ?? "<<vazio>>";
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, total]) => ({ value, total }))
    .sort((a, b) => b.total - a.total || a.value.localeCompare(b.value, "pt-BR"));
}

function emptyFieldSummary(rows, fields) {
  return Object.fromEntries(
    fields.map((field) => [
      `${field}_vazio`,
      rows.filter((row) => isBlank(row.fields[field])).length,
    ]),
  );
}

function auditCpf(rows) {
  const emptyRows = rows.filter((row) => isBlank(row.fields.cpf));
  const nonEmptyRows = rows
    .map((row) => ({ row, normalized: normalizeCpf(row.fields.cpf) }))
    .filter((item) => item.normalized);
  const invalidRows = nonEmptyRows
    .filter((item) => !isValidCpf(item.normalized))
    .map((item) => item.row);
  const validCount = nonEmptyRows.length - invalidRows.length;
  const groups = new Map();

  for (const item of nonEmptyRows) {
    const existing = groups.get(item.normalized) ?? [];
    existing.push(item.row);
    groups.set(item.normalized, existing);
  }

  const duplicateGroups = Array.from(groups.entries())
    .filter(([, groupRows]) => groupRows.length > 1)
    .map(([cpf, groupRows]) => ({
      cpfHash: anonymize(cpf),
      total: groupRows.length,
      rows: groupRows,
    }))
    .sort((a, b) => b.total - a.total || a.cpfHash.localeCompare(b.cpfHash));

  return {
    totalRows: rows.length,
    emptyRows,
    emptyCount: emptyRows.length,
    validCount,
    invalidRows,
    duplicateGroups,
  };
}

function auditDateField(rows, field) {
  const counts = new Map();
  const unknownRows = [];

  for (const row of rows) {
    const classification = classifyDate(row.rawFields[field], row.fields[field]);
    counts.set(classification, (counts.get(classification) ?? 0) + 1);
    if (classification === "outro") {
      unknownRows.push(row);
    }
  }

  return {
    counts: Array.from(counts.entries())
      .map(([format, total]) => ({ format, total }))
      .sort((a, b) => b.total - a.total || a.format.localeCompare(b.format)),
    unknownRows,
  };
}

function classifyDate(rawValue, displayText) {
  const value = normalizeBlank(displayText);
  if (!value) return "vazio";
  if (rawValue instanceof Date) return "excel_date";
  if (typeof rawValue === "number") return "excel_serial";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "yyyy-mm-dd";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return "dd/mm/yyyy";
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return "dd-mm-yyyy";
  return "outro";
}

function auditUnitConsistency(employeeRows, unitRows) {
  const unitNames = new Set(
    unitRows
      .map((row) => normalizeForMatch(row.fields.nome))
      .filter((value) => value.length > 0),
  );
  const employeeUnitNames = new Set(
    employeeRows
      .map((row) => normalizeForMatch(row.fields.unidade))
      .filter((value) => value.length > 0),
  );
  const employeesWithoutUnit = employeeRows.filter((row) => isBlank(row.fields.unidade));
  const employeesWithUnknownUnit = employeeRows.filter((row) => {
    const unit = normalizeForMatch(row.fields.unidade);
    return unit.length > 0 && unitNames.size > 0 && !unitNames.has(unit);
  });
  const unitsWithoutEmployees = unitRows.filter((row) => {
    const unit = normalizeForMatch(row.fields.nome);
    return unit.length > 0 && !employeeUnitNames.has(unit);
  });
  const unknownUnitGroups = countByNormalizedValue(employeesWithUnknownUnit, "unidade");

  return {
    employeesWithoutUnit,
    employeesWithUnknownUnit,
    unitsWithoutEmployees,
    publicSummary: {
      funcionarios_sem_unidade: employeesWithoutUnit.length,
      funcionarios_com_unidade_nao_listada: employeesWithUnknownUnit.length,
      grupos_de_unidade_nao_listada: unknownUnitGroups.length,
      unidades_sem_funcionarios: unitsWithoutEmployees.length,
      unidades_duplicadas_por_nome_normalizado: duplicateNormalizedGroups(
        unitRows,
        "nome",
      ).length,
      unidades_nao_listadas_hash: unknownUnitGroups.map((group) => ({
        unidade_hash: anonymize(group.normalized),
        total: group.total,
      })),
    },
  };
}

function auditStatus(rows) {
  const allowed = new Set(["ativo", "exonerado"]);
  const unknownRows = rows.filter((row) => {
    const status = normalizeForMatch(row.fields.status);
    return status.length > 0 && !allowed.has(status);
  });
  const emptyRows = rows.filter((row) => isBlank(row.fields.status));

  return {
    unknownRows,
    emptyRows,
    publicSummary: {
      status_vazio: emptyRows.length,
      status_fora_do_padrao: unknownRows.length,
    },
  };
}

function duplicateNormalizedGroups(rows, field) {
  return countByNormalizedValue(rows, field).filter((group) => group.total > 1);
}

function countByNormalizedValue(rows, field) {
  const groups = new Map();
  for (const row of rows) {
    const normalized = normalizeForMatch(row.fields[field]);
    if (!normalized) continue;
    groups.set(normalized, (groups.get(normalized) ?? 0) + 1);
  }

  return Array.from(groups.entries())
    .map(([normalized, total]) => ({ normalized, total }))
    .sort((a, b) => b.total - a.total || a.normalized.localeCompare(b.normalized));
}

function collectPrivateIssues({
  rows,
  cpfAudit,
  unitAudit,
  statusAudit,
  dateAudits,
  issues,
}) {
  for (const row of cpfAudit.emptyRows) {
    issues.push(privateIssue("cpf_vazio", "warning", row));
  }

  for (const row of cpfAudit.invalidRows) {
    issues.push(privateIssue("cpf_invalido", "warning", row));
  }

  for (const group of cpfAudit.duplicateGroups) {
    for (const row of group.rows) {
      issues.push(
        privateIssue("cpf_duplicado", "warning", row, {
          cpf_hash: group.cpfHash,
          registros_no_grupo: group.total,
        }),
      );
    }
  }

  for (const row of unitAudit.employeesWithoutUnit) {
    issues.push(privateIssue("unidade_vazia", "warning", row));
  }

  for (const row of unitAudit.employeesWithUnknownUnit) {
    issues.push(privateIssue("unidade_nao_listada", "warning", row));
  }

  for (const row of statusAudit.emptyRows) {
    issues.push(privateIssue("status_vazio", "warning", row));
  }

  for (const row of statusAudit.unknownRows) {
    issues.push(privateIssue("status_fora_do_padrao", "warning", row));
  }

  for (const [field, audit] of Object.entries(dateAudits)) {
    for (const row of audit.unknownRows) {
      issues.push(
        privateIssue("formato_data_desconhecido", "warning", row, {
          campo: field,
          valor: row.fields[field],
        }),
      );
    }
  }

  for (const row of rows) {
    if (isBlank(row.fields.nome)) {
      issues.push(privateIssue("nome_vazio", "critical", row));
    }
  }
}

function privateIssue(code, severity, row, extra = {}) {
  return {
    code,
    severity,
    sheet: employeeSheet.name,
    rowNumber: row.rowNumber,
    nome: row.fields.nome ?? null,
    cpf: row.fields.cpf ?? null,
    cpf_hash: normalizeCpf(row.fields.cpf)
      ? anonymize(normalizeCpf(row.fields.cpf))
      : null,
    status: row.fields.status ?? null,
    unidade: row.fields.unidade ?? null,
    ...extra,
  };
}

function summarizeIssues({
  employeeMissingColumns,
  unitMissingColumns,
  cpfAudit,
  unitAudit,
  statusAudit,
  dateAudits,
}) {
  return [
    {
      code: "colunas_funcionarios_ausentes",
      severity: employeeMissingColumns.length ? "critical" : "ok",
      total: employeeMissingColumns.length,
    },
    {
      code: "colunas_unidades_ausentes",
      severity: unitMissingColumns.length ? "warning" : "ok",
      total: unitMissingColumns.length,
    },
    {
      code: "cpf_vazio",
      severity: cpfAudit.emptyCount ? "warning" : "ok",
      total: cpfAudit.emptyCount,
    },
    {
      code: "cpf_invalido",
      severity: cpfAudit.invalidRows.length ? "warning" : "ok",
      total: cpfAudit.invalidRows.length,
    },
    {
      code: "cpf_duplicado",
      severity: cpfAudit.duplicateGroups.length ? "warning" : "ok",
      total: cpfAudit.duplicateGroups.reduce((sum, group) => sum + group.total, 0),
    },
    {
      code: "unidade_vazia",
      severity: unitAudit.employeesWithoutUnit.length ? "warning" : "ok",
      total: unitAudit.employeesWithoutUnit.length,
    },
    {
      code: "unidade_nao_listada",
      severity: unitAudit.employeesWithUnknownUnit.length ? "warning" : "ok",
      total: unitAudit.employeesWithUnknownUnit.length,
    },
    {
      code: "status_vazio",
      severity: statusAudit.emptyRows.length ? "warning" : "ok",
      total: statusAudit.emptyRows.length,
    },
    {
      code: "status_fora_do_padrao",
      severity: statusAudit.unknownRows.length ? "warning" : "ok",
      total: statusAudit.unknownRows.length,
    },
    {
      code: "nascimento_formato_desconhecido",
      severity: dateAudits.nascimento.unknownRows.length ? "warning" : "ok",
      total: dateAudits.nascimento.unknownRows.length,
    },
    {
      code: "admissao_formato_desconhecido",
      severity: dateAudits.admissao.unknownRows.length ? "warning" : "ok",
      total: dateAudits.admissao.unknownRows.length,
    },
  ];
}

function compareWithSqlite(xlsxEmployeeTotal, xlsxUnitTotal) {
  const sqliteAuditPath = path.resolve("docs/migration/generated/sqlite-audit.json");
  if (!fs.existsSync(sqliteAuditPath)) {
    return null;
  }

  const sqliteAudit = JSON.parse(fs.readFileSync(sqliteAuditPath, "utf8"));

  return {
    sqliteAuditFile: "docs/migration/generated/sqlite-audit.json",
    sqliteFuncionarios: sqliteAudit.counts?.funcionarios ?? null,
    xlsxFuncionarios: xlsxEmployeeTotal,
    diferencaFuncionarios:
      typeof sqliteAudit.counts?.funcionarios === "number"
        ? xlsxEmployeeTotal - sqliteAudit.counts.funcionarios
        : null,
    sqliteUnidades: sqliteAudit.counts?.unidades ?? null,
    xlsxUnidades: xlsxUnitTotal,
    diferencaUnidades:
      typeof sqliteAudit.counts?.unidades === "number"
        ? xlsxUnitTotal - sqliteAudit.counts.unidades
        : null,
  };
}

function renderMarkdown(data) {
  return `# Auditoria Sanitizada da Planilha de Funcionarios

Gerado em: ${data.auditedAt}

Fonte auditada: copia diagnostica local ignorada pelo Git.

Arquivo: \`${data.source.fileName}\`

SHA-256 da copia auditada: \`${data.source.sha256}\`

Tamanho: ${data.source.sizeBytes} bytes

Ultima modificacao do arquivo auditado: ${data.source.lastModified}

Este relatorio nao inclui nomes de funcionarios, CPFs em texto aberto, telefones,
e-mails, coordenadores ou observacoes. CPFs e unidades divergentes aparecem
apenas como hashes parciais quando necessario.

## Abas

${renderSheetTable(data.workbook.sheets)}

## Funcionarios

| Item | Valor |
| --- | ---: |
| Aba | ${escapeMarkdown(data.funcionarios.sheet)} |
| Linha de cabecalho detectada | ${data.funcionarios.detectedHeaderRow} |
| Linhas de dados | ${data.funcionarios.totalRows} |

### Cabecalhos detectados

${data.funcionarios.headers.map((header) => `- ${escapeMarkdown(header)}`).join("\n")}

### Colunas esperadas ausentes

${renderListOrNone(data.funcionarios.missingExpectedColumns)}

### Status

${renderValueTable(data.funcionarios.countsByStatus)}

### Vinculos

${renderValueTable(data.funcionarios.countsByVinculo)}

### Campos vazios

${renderKeyValueTable(data.funcionarios.emptyFields)}

### Datas

#### Nascimento

${renderFormatTable(data.funcionarios.dateFormats.nascimento.counts)}

#### Admissao

${renderFormatTable(data.funcionarios.dateFormats.admissao.counts)}

### CPF

| Metrica | Total |
| --- | ---: |
| Linhas analisadas | ${data.funcionarios.cpf.totalRows} |
| CPFs vazios | ${data.funcionarios.cpf.emptyCount} |
| CPFs validos | ${data.funcionarios.cpf.validCount} |
| CPFs invalidos nao vazios | ${data.funcionarios.cpf.invalidCount} |
| Grupos de CPF duplicado normalizado | ${data.funcionarios.cpf.duplicateGroupCount} |
| Registros dentro de grupos duplicados | ${data.funcionarios.cpf.duplicateNormalizedCount} |

#### CPFs duplicados anonimizados

${renderDuplicateTable(data.funcionarios.cpf.duplicateGroups)}

### Consistencia de unidades

${renderKeyValueTable(data.funcionarios.units)}

## Unidades

| Item | Valor |
| --- | ---: |
| Aba | ${escapeMarkdown(data.unidades.sheet ?? "nao encontrada")} |
| Linha de cabecalho detectada | ${data.unidades.detectedHeaderRow ?? "-"} |
| Linhas de dados | ${data.unidades.totalRows} |
| Grupos de nomes duplicados | ${data.unidades.duplicateNameGroupCount} |

### Cabecalhos detectados

${data.unidades.headers.length ? data.unidades.headers.map((header) => `- ${escapeMarkdown(header)}`).join("\n") : "Nenhum cabecalho detectado."}

### Colunas esperadas ausentes

${renderListOrNone(data.unidades.missingExpectedColumns)}

### Tipos de unidade

${renderValueTable(data.unidades.countsByTipo)}

## Comparacao com SQLite diagnosticado

${renderComparison(data.comparisonWithSqlite)}

## Resumo de pendencias

${renderIssueSummary(data.issueSummary)}
`;
}

function renderSheetTable(sheets) {
  return `| Aba | Linhas | Linhas com conteudo | Colunas | Colunas com conteudo |
| --- | ---: | ---: | ---: | ---: |
${sheets
  .map(
    (sheet) =>
      `| ${escapeMarkdown(sheet.name)} | ${sheet.rowCount} | ${sheet.actualRowCount} | ${sheet.columnCount} | ${sheet.actualColumnCount} |`,
  )
  .join("\n")}`;
}

function renderValueTable(rows) {
  if (!rows.length) return "Nenhum valor encontrado.";
  return `| Valor | Total |
| --- | ---: |
${rows
  .map((row) => `| ${escapeMarkdown(row.value)} | ${row.total} |`)
  .join("\n")}`;
}

function renderFormatTable(rows) {
  if (!rows.length) return "Nenhum valor encontrado.";
  return `| Formato | Total |
| --- | ---: |
${rows.map((row) => `| ${escapeMarkdown(row.format)} | ${row.total} |`).join("\n")}`;
}

function renderDuplicateTable(rows) {
  if (!rows.length) return "Nenhum CPF duplicado encontrado.";
  return `| CPF anonimizado | Registros |
| --- | ---: |
${rows.map((row) => `| ${row.cpf_hash} | ${row.total} |`).join("\n")}`;
}

function renderKeyValueTable(record) {
  const entries = Object.entries(record ?? {}).filter(
    ([, value]) => !Array.isArray(value),
  );
  if (!entries.length) return "Nenhum item encontrado.";

  return `| Item | Total |
| --- | ---: |
${entries.map(([key, value]) => `| ${escapeMarkdown(key)} | ${value} |`).join("\n")}`;
}

function renderListOrNone(values) {
  if (!values.length) return "Nenhuma coluna ausente.";
  return values.map((value) => `- ${escapeMarkdown(value)}`).join("\n");
}

function renderComparison(comparison) {
  if (!comparison) return "Arquivo de auditoria do SQLite nao encontrado.";
  return `| Item | SQLite | Planilha | Diferenca |
| --- | ---: | ---: | ---: |
| Funcionarios | ${comparison.sqliteFuncionarios} | ${comparison.xlsxFuncionarios} | ${comparison.diferencaFuncionarios} |
| Unidades | ${comparison.sqliteUnidades} | ${comparison.xlsxUnidades} | ${comparison.diferencaUnidades} |`;
}

function renderIssueSummary(rows) {
  if (!rows.length) return "Nenhuma pendencia encontrada.";
  return `| Codigo | Severidade | Total |
| --- | --- | ---: |
${rows
  .map(
    (row) =>
      `| ${escapeMarkdown(row.code)} | ${escapeMarkdown(row.severity)} | ${row.total} |`,
  )
  .join("\n")}`;
}

function escapeMarkdown(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .trim();
}
