import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";

const xlsxPath = process.env.FUNCIONARIOS_XLSX_PATH
  ? path.resolve(process.env.FUNCIONARIOS_XLSX_PATH)
  : path.resolve("C:/Users/SEMASC/Downloads/relatorio-funcionarios.xlsx");
const outputDir = process.env.MIGRATION_PRIVATE_OUTPUT_DIR
  ? path.resolve(process.env.MIGRATION_PRIVATE_OUTPUT_DIR)
  : path.resolve("local-data/private-review");
const chunkSize = Number(process.env.MIGRATION_SQL_CHUNK_SIZE ?? 100);

if (!fs.existsSync(xlsxPath)) {
  console.error(`Planilha nao encontrada: ${xlsxPath}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const sourceBuffer = fs.readFileSync(xlsxPath);
const sourceHash = crypto.createHash("sha256").update(sourceBuffer).digest("hex");

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

const units = buildUnits({ employeeRows, unitRows, sourceHash });
const employees = buildEmployees({ employeeRows, units, sourceHash });
const statements = [
  renderUnitUpsert(units),
  ...chunk(employees, chunkSize).map((items, index) =>
    renderEmployeeUpsert(items, index + 1),
  ),
].filter(Boolean);

const sqlPath = path.join(outputDir, "import-funcionarios-from-xlsx.sql");
const summaryPath = path.join(outputDir, "import-funcionarios-from-xlsx.summary.json");

fs.writeFileSync(
  sqlPath,
  [
    "-- Importacao gerada a partir da planilha atual de funcionarios.",
    "-- Dados pessoais: manter este arquivo fora do controle de versao.",
    `-- Fonte: ${path.basename(xlsxPath)}`,
    `-- SHA256: ${sourceHash}`,
    "",
    ...statements,
    "",
  ].join("\n"),
  "utf8",
);

fs.writeFileSync(
  summaryPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: {
        fileName: path.basename(xlsxPath),
        sha256: sourceHash,
        sizeBytes: sourceBuffer.byteLength,
      },
      sheets: {
        funcionarios: employeeSheet.name,
        unidades: unitSheet?.name ?? null,
      },
      totals: {
        funcionarios: employees.length,
        unidades: units.length,
        sqlStatements: statements.length,
        chunkSize,
      },
      funcionariosByStatus: countBy(employees, (employee) => employee.status),
      unidadesByTipo: countBy(units, (unit) => unit.tipo),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`SQL de importacao: ${sqlPath}`);
console.log(`Resumo: ${summaryPath}`);
console.log(`Funcionarios preparados: ${employees.length}`);
console.log(`Unidades preparadas: ${units.length}`);
console.log(`Statements SQL: ${statements.length}`);

function buildUnits({ employeeRows, unitRows, sourceHash }) {
  const map = new Map();
  let legacyId = 1;

  for (const row of unitRows) {
    const nome = normalizeBlank(row.fields.nome);
    if (!nome) continue;
    const key = normalizeForMatch(nome);
    if (map.has(key)) continue;

    map.set(key, {
      id: uuidFromText(`unidade:${key}`),
      legacy_id: legacyId,
      nome,
      sigla: null,
      tipo: normalizeBlank(row.fields.tipo) ?? "Nao informado",
      endereco: normalizeBlank(row.fields.endereco),
      coordenador: normalizeBlank(row.fields.coordenador),
      telefone: normalizeBlank(row.fields.telefone),
      status: "ativa",
      ativa: true,
      metadata: {
        source: "xlsx",
        source_sha256: sourceHash,
        excel_row: row.rowNumber,
      },
    });
    legacyId += 1;
  }

  for (const row of employeeRows) {
    const nome = normalizeBlank(row.fields.unidade);
    if (!nome) continue;
    const key = normalizeForMatch(nome);
    if (map.has(key)) continue;

    map.set(key, {
      id: uuidFromText(`unidade:${key}`),
      legacy_id: 900000 + legacyId,
      nome,
      sigla: null,
      tipo: "Nao informado",
      endereco: null,
      coordenador: null,
      telefone: null,
      status: "ativa",
      ativa: true,
      metadata: {
        source: "xlsx",
        source_sha256: sourceHash,
        inferred_from_funcionarios: true,
      },
    });
    legacyId += 1;
  }

  return Array.from(map.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

function buildEmployees({ employeeRows, units, sourceHash }) {
  const unitByKey = new Map(units.map((unit) => [normalizeForMatch(unit.nome), unit]));

  return employeeRows.map((row, index) => {
    const fields = row.fields;
    const unitName = normalizeBlank(fields.unidade);
    const unit = unitName ? unitByKey.get(normalizeForMatch(unitName)) : null;
    const legacyId = index + 1;
    const status = normalizeStatus(fields.status);
    const nascimento = toIsoDate(row.rawFields.nascimento, fields.nascimento);
    const admissao = toIsoDate(row.rawFields.admissao, fields.admissao);

    return {
      id: uuidFromText(`funcionario:${sourceHash}:${legacyId}`),
      legacy_id: legacyId,
      unidade: unitName ?? "Sem unidade",
      cpf: normalizeBlank(fields.cpf),
      nome: normalizeBlank(fields.nome) ?? `Funcionario ${legacyId}`,
      setor: normalizeBlank(fields.setor),
      cargo: normalizeBlank(fields.cargo),
      escolaridade: normalizeBlank(fields.escolaridade),
      telefone: normalizeBlank(fields.telefone),
      inicio_exercicio: admissao,
      vinculo_institucional: normalizeBlank(fields.vinculo),
      data_nascimento: nascimento,
      cpf_normalized: normalizeCpf(fields.cpf) || null,
      nascimento,
      unidade_id: unit?.id ?? null,
      legacy_unidade_id: unit?.legacy_id ?? null,
      vinculo: normalizeBlank(fields.vinculo),
      carga_horaria: normalizeBlank(fields.carga_horaria),
      email: normalizeBlank(fields.email),
      admissao,
      data_exoneracao: null,
      status,
      observacoes: normalizeBlank(fields.observacoes),
      metadata: {
        source: "xlsx",
        source_sha256: sourceHash,
        excel_row: row.rowNumber,
      },
    };
  });
}

function renderUnitUpsert(units) {
  if (units.length === 0) return "";

  return [
    "insert into public.unidades (",
    "  id, legacy_id, nome, sigla, tipo, endereco, coordenador, telefone, status, ativa, metadata",
    ")",
    "values",
    units.map(renderUnitValues).join(",\n"),
    "on conflict (id) do update",
    "set",
    "  legacy_id = excluded.legacy_id,",
    "  nome = excluded.nome,",
    "  sigla = excluded.sigla,",
    "  tipo = excluded.tipo,",
    "  endereco = excluded.endereco,",
    "  coordenador = excluded.coordenador,",
    "  telefone = excluded.telefone,",
    "  status = excluded.status,",
    "  ativa = excluded.ativa,",
    "  metadata = excluded.metadata,",
    "  updated_at = now();",
  ].join("\n");
}

function renderEmployeeUpsert(employees, batchNumber) {
  if (employees.length === 0) return "";

  return [
    `-- funcionarios lote ${batchNumber}`,
    "insert into public.funcionarios (",
    "  id, legacy_id, unidade, cpf, nome, setor, cargo, escolaridade, telefone,",
    "  inicio_exercicio, vinculo_institucional, data_nascimento, cpf_normalized, nascimento,",
    "  unidade_id, legacy_unidade_id, vinculo, carga_horaria, email, admissao, data_exoneracao,",
    "  status, observacoes, metadata",
    ")",
    "values",
    employees.map(renderEmployeeValues).join(",\n"),
    "on conflict (id) do update",
    "set",
    "  legacy_id = excluded.legacy_id,",
    "  unidade = excluded.unidade,",
    "  cpf = excluded.cpf,",
    "  nome = excluded.nome,",
    "  setor = excluded.setor,",
    "  cargo = excluded.cargo,",
    "  escolaridade = excluded.escolaridade,",
    "  telefone = excluded.telefone,",
    "  inicio_exercicio = excluded.inicio_exercicio,",
    "  vinculo_institucional = excluded.vinculo_institucional,",
    "  data_nascimento = excluded.data_nascimento,",
    "  cpf_normalized = excluded.cpf_normalized,",
    "  nascimento = excluded.nascimento,",
    "  unidade_id = excluded.unidade_id,",
    "  legacy_unidade_id = excluded.legacy_unidade_id,",
    "  vinculo = excluded.vinculo,",
    "  carga_horaria = excluded.carga_horaria,",
    "  email = excluded.email,",
    "  admissao = excluded.admissao,",
    "  data_exoneracao = excluded.data_exoneracao,",
    "  status = excluded.status,",
    "  observacoes = excluded.observacoes,",
    "  metadata = excluded.metadata,",
    "  updated_at = now();",
  ].join("\n");
}

function renderUnitValues(unit) {
  return `(${[
    sqlUuid(unit.id),
    sqlNumber(unit.legacy_id),
    sqlText(unit.nome),
    sqlText(unit.sigla),
    sqlText(unit.tipo),
    sqlText(unit.endereco),
    sqlText(unit.coordenador),
    sqlText(unit.telefone),
    sqlText(unit.status),
    sqlBoolean(unit.ativa),
    sqlJsonb(unit.metadata),
  ].join(", ")})`;
}

function renderEmployeeValues(employee) {
  return `(${[
    sqlUuid(employee.id),
    sqlNumber(employee.legacy_id),
    sqlText(employee.unidade),
    sqlText(employee.cpf),
    sqlText(employee.nome),
    sqlText(employee.setor),
    sqlText(employee.cargo),
    sqlText(employee.escolaridade),
    sqlText(employee.telefone),
    sqlDate(employee.inicio_exercicio),
    sqlText(employee.vinculo_institucional),
    sqlDate(employee.data_nascimento),
    sqlText(employee.cpf_normalized),
    sqlDate(employee.nascimento),
    sqlUuid(employee.unidade_id),
    sqlNumber(employee.legacy_unidade_id),
    sqlText(employee.vinculo),
    sqlText(employee.carga_horaria),
    sqlText(employee.email),
    sqlDate(employee.admissao),
    sqlDate(employee.data_exoneracao),
    sqlText(employee.status),
    sqlText(employee.observacoes),
    sqlJsonb(employee.metadata),
  ].join(", ")})`;
}

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
    ["carga horaria", "carga_horaria"],
    ["carga horária", "carga_horaria"],
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

  return { headerRowNumber: header.rowNumber, headers: header.headers, mapping, rows };
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
  if (typeof cell.text === "string" && cell.text.trim()) return cell.text.trim();
  return valueToText(cell.value).trim();
}

function valueToText(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value.richText)) return value.richText.map((part) => part.text ?? "").join("");
  if ("result" in value) return valueToText(value.result);
  if ("text" in value) return valueToText(value.text);
  if ("hyperlink" in value && "text" in value) return valueToText(value.text);
  return String(value);
}

function toIsoDate(rawValue, displayText) {
  if (rawValue instanceof Date && !Number.isNaN(rawValue.valueOf())) {
    return rawValue.toISOString().slice(0, 10);
  }

  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpoch + rawValue * 86400000);
    return date.toISOString().slice(0, 10);
  }

  const value = normalizeBlank(displayText);
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const slash = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;

  const dash = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dash) return `${dash[3]}-${dash[2]}-${dash[1]}`;

  return null;
}

function normalizeStatus(value) {
  const normalized = normalizeForMatch(value);
  if (normalized.includes("exoner")) return "Exonerado";
  return "Ativo";
}

function normalizeBlank(value) {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ");
  return normalized || null;
}

function normalizeCpf(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function isBlank(value) {
  return String(value ?? "").trim() === "";
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

function uuidFromText(value) {
  const hash = crypto.createHash("sha256").update(value).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function countBy(items, getter) {
  const counts = new Map();
  for (const item of items) {
    const key = getter(item) ?? "<<vazio>>";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries(
    Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

function sqlText(value) {
  if (value == null || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlUuid(value) {
  return value ? `${sqlText(value)}::uuid` : "null";
}

function sqlDate(value) {
  return value ? `${sqlText(value)}::date` : "null";
}

function sqlNumber(value) {
  return value == null ? "null" : String(Number(value));
}

function sqlBoolean(value) {
  return value ? "true" : "false";
}

function sqlJsonb(value) {
  return `${sqlText(JSON.stringify(value))}::jsonb`;
}
