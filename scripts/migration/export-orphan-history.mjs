import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";

const dbPath = process.env.FUNCIONARIOS_SQLITE_PATH
  ? path.resolve(process.env.FUNCIONARIOS_SQLITE_PATH)
  : "";
const outputDir = process.env.MIGRATION_PRIVATE_OUTPUT_DIR
  ? path.resolve(process.env.MIGRATION_PRIVATE_OUTPUT_DIR)
  : path.resolve("local-data/private-review");

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

const dbBuffer = fs.readFileSync(dbPath);
const sourceHash = crypto.createHash("sha256").update(dbBuffer).digest("hex");
const SQL = await initSqlJs();
const db = new SQL.Database(dbBuffer);

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

const exportedAt = new Date().toISOString();
const orphanHistory = selectAll(`
  SELECT
    h.id AS legacy_id,
    h.funcionario_id AS funcionario_legacy_id,
    h.status_anterior,
    h.status_novo,
    h.data_movimentacao,
    h.observacao
  FROM historico_movimentacoes h
  LEFT JOIN funcionarios f ON f.id = h.funcionario_id
  WHERE f.id IS NULL
  ORDER BY h.funcionario_id, h.id
`);

const report = {
  exportedAt,
  sourceHash,
  total: orphanHistory.length,
  classification: "bloqueia_migracao",
  notes:
    "Arquivo privado para revisão. Não versionar. Não associar historico a funcionario apenas por nome.",
  records: orphanHistory,
};

const outputPath = path.join(
  outputDir,
  `historicos-orfaos.${exportedAt.replace(/[:.]/g, "-")}.json`,
);

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Históricos órfãos exportados: ${outputPath}`);
console.log(`Total: ${orphanHistory.length}`);
