import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { getCurrentUser } from "@/lib/auth/session";
import {
  formatCpfForDisplay,
  formatPhoneForDisplay,
} from "@/lib/forms/masks";
import { normalizeEscolaridadeOption } from "@/lib/funcionarios/escolaridades";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getFuncionariosWorkspaceData,
  parseFuncionarioFilters,
  type FuncionarioFilters,
  type FuncionarioListItem,
  type FuncionariosWorkspaceData,
} from "@/services/funcionarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReportFormat = "pdf" | "excel";

const reportTitle = "Relatório de Funcionários";

export async function GET(request: Request) {
  const { user, profile, isSupabaseReady } = await getCurrentUser();

  if (!isSupabaseReady) {
    return Response.json(
      { error: "A conexão do Supabase ainda não está configurada." },
      { status: 503 },
    );
  }

  if (!user || !profile?.is_active) {
    return Response.json(
      { error: "Acesso restrito a usuários autenticados." },
      { status: 401 },
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return Response.json(
      { error: "Não foi possível conectar ao banco de dados." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const format = parseReportFormat(url.searchParams.get("format"));
  const filters = parseFuncionarioFilters(
    Object.fromEntries(url.searchParams.entries()),
  );
  const data = await getFuncionariosWorkspaceData(supabase, filters);
  const fileDate = new Date().toISOString().slice(0, 10);

  if (format === "excel") {
    const body = await buildExcelReport(data, filters);

    return new Response(body, {
      headers: reportHeaders(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        `relatorio-funcionarios-${fileDate}.xlsx`,
      ),
    });
  }

  const body = await buildPdfReport(data, filters);

  return new Response(new Uint8Array(body), {
    headers: reportHeaders("application/pdf", `relatorio-funcionarios-${fileDate}.pdf`),
  });
}

function parseReportFormat(value: string | null): ReportFormat {
  return value === "excel" ? "excel" : "pdf";
}

async function buildExcelReport(
  data: FuncionariosWorkspaceData,
  filters: FuncionarioFilters,
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema de Funcionários";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Funcionários", {
    views: [{ state: "frozen", ySplit: 5 }],
  });

  worksheet.mergeCells("A1:K1");
  worksheet.getCell("A1").value = reportTitle;
  worksheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF002B6B" } };
  worksheet.getCell("A1").alignment = { vertical: "middle" };
  worksheet.getRow(1).height = 24;

  worksheet.mergeCells("A2:K2");
  worksheet.getCell("A2").value = buildReportSubtitle(data, filters);
  worksheet.getCell("A2").font = { size: 11, color: { argb: "FF53637C" } };

  worksheet.mergeCells("A3:K3");
  worksheet.getCell("A3").value = `Gerado em ${formatDateTimeForReport(new Date())}`;
  worksheet.getCell("A3").font = { size: 10, color: { argb: "FF6D7A91" } };

  const reportColumns = [
    { header: "Nome", key: "nome", width: 34 },
    { header: "CPF", key: "cpf", width: 16 },
    { header: "Cargo", key: "cargo", width: 26 },
    { header: "Unidade", key: "unidade", width: 28 },
    { header: "Setor", key: "setor", width: 22 },
    { header: "Situação", key: "status", width: 14 },
    { header: "Escolaridade", key: "escolaridade", width: 30 },
    { header: "Telefone", key: "telefone", width: 18 },
    { header: "E-mail", key: "email", width: 30 },
    { header: "Admissão", key: "admissao", width: 14 },
    { header: "Exoneração", key: "data_exoneracao", width: 14 },
  ];

  worksheet.columns = reportColumns.map(({ key, width }) => ({ key, width }));

  const headerRow = worksheet.getRow(5);
  reportColumns.forEach((column, index) => {
    headerRow.getCell(index + 1).value = column.header;
  });
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0057BF" },
  };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 22;

  for (const employee of data.filteredEmployees) {
    worksheet.addRow(toReportRow(employee));
  }

  worksheet.autoFilter = "A5:K5";
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 5) return;
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFD7E4F5" } },
      };
      cell.alignment = { vertical: "top", wrapText: true };
    });
  });

  return await workbook.xlsx.writeBuffer();
}

async function buildPdfReport(
  data: FuncionariosWorkspaceData,
  filters: FuncionarioFilters,
) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
    info: {
      Title: reportTitle,
      Author: "Sistema de Funcionários",
      Subject: "Relatório administrativo de funcionários",
    },
  });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  drawPdfHeader(doc, data, filters);

  if (!data.filteredEmployees.length) {
    doc.moveDown(2);
    doc.font("Helvetica").fontSize(11).fillColor("#53637c");
    doc.text("Nenhum funcionário encontrado para os filtros selecionados.");
  }

  data.filteredEmployees.forEach((employee, index) => {
    if (doc.y > doc.page.height - 105) {
      doc.addPage();
      drawPdfHeader(doc, data, filters, true);
    }

    drawEmployeePdfBlock(doc, employee, index + 1);
  });

  doc.end();
  return await done;
}

function drawPdfHeader(
  doc: PDFKit.PDFDocument,
  data: FuncionariosWorkspaceData,
  filters: FuncionarioFilters,
  compact = false,
) {
  doc.font("Helvetica-Bold").fontSize(compact ? 13 : 18).fillColor("#002b6b");
  doc.text(reportTitle);
  doc.moveDown(0.25);
  doc.font("Helvetica").fontSize(9).fillColor("#53637c");
  doc.text(buildReportSubtitle(data, filters));
  doc.text(`Gerado em ${formatDateTimeForReport(new Date())}`);
  doc.moveDown(0.6);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .lineWidth(0.7)
    .strokeColor("#bfd4f0")
    .stroke();
  doc.moveDown(0.8);
}

function drawEmployeePdfBlock(
  doc: PDFKit.PDFDocument,
  employee: FuncionarioListItem,
  position: number,
) {
  const startY = doc.y;
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;

  doc.font("Helvetica-Bold").fontSize(9).fillColor("#082858");
  doc.text(`${position}. ${safePdfText(employee.nome || "Sem nome")}`, left, startY, {
    width: right - left,
  });
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(8).fillColor("#465a78");
  doc.text(
    [
      `CPF: ${formatCpfForDisplay(employee.cpf) || "-"}`,
      `Situação: ${formatStatusForReport(employee.status)}`,
      `Admissão: ${formatDateForReport(employee.admissao)}`,
    ].join("   |   "),
  );
  doc.text(
    [
      `Cargo: ${safePdfText(employee.cargo || "-")}`,
      `Unidade: ${safePdfText(employee.unidade_nome || "-")}`,
      `Setor: ${safePdfText(employee.setor || "-")}`,
    ].join("   |   "),
  );
  doc.text(
    [
      `Escolaridade: ${safePdfText(formatEducationForReport(employee.escolaridade))}`,
      `Telefone: ${formatPhoneForDisplay(employee.telefone) || "-"}`,
      `E-mail: ${safePdfText(employee.email || "-")}`,
    ].join("   |   "),
  );
  doc.moveDown(0.5);
  doc
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(0.35)
    .strokeColor("#d7e4f5")
    .stroke();
  doc.moveDown(0.55);
}

function toReportRow(employee: FuncionarioListItem) {
  return {
    nome: safeExcelText(employee.nome),
    cpf: formatCpfForDisplay(employee.cpf) || "",
    cargo: safeExcelText(employee.cargo),
    unidade: safeExcelText(employee.unidade_nome),
    setor: safeExcelText(employee.setor),
    status: formatStatusForReport(employee.status),
    escolaridade: safeExcelText(formatEducationForReport(employee.escolaridade)),
    telefone: formatPhoneForDisplay(employee.telefone) || "",
    email: safeExcelText(employee.email),
    admissao: formatDateForReport(employee.admissao),
    data_exoneracao: formatDateForReport(employee.data_exoneracao),
  };
}

function buildReportSubtitle(
  data: FuncionariosWorkspaceData,
  filters: FuncionarioFilters,
) {
  const appliedFilters = [
    filters.search ? `busca "${filters.search}"` : null,
    filters.unidadeId ? `unidade "${unitName(data, filters.unidadeId)}"` : null,
    filters.cargo ? `cargo "${filters.cargo}"` : null,
    filters.escolaridade ? `escolaridade "${filters.escolaridade}"` : null,
    filters.status ? `situação "${formatStatusForReport(filters.status)}"` : null,
  ].filter(Boolean);

  const filterLabel = appliedFilters.length
    ? `Filtros: ${appliedFilters.join("; ")}.`
    : "Sem filtros aplicados.";

  return `${data.filteredEmployees.length} registro${
    data.filteredEmployees.length === 1 ? "" : "s"
  } encontrado${data.filteredEmployees.length === 1 ? "" : "s"}. ${filterLabel}`;
}

function unitName(data: FuncionariosWorkspaceData, unitId: string) {
  return data.units.find((unit) => unit.id === unitId)?.nome ?? unitId;
}

function formatEducationForReport(value: string | null) {
  return normalizeEscolaridadeOption(value) ?? value ?? "-";
}

function formatStatusForReport(value: string | null) {
  if (value === "Licenca") return "Licença";
  return value || "-";
}

function formatDateForReport(value: string | null) {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatDateTimeForReport(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(value);
}

function safeExcelText(value: string | null) {
  const text = String(value ?? "").trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function safePdfText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function reportHeaders(contentType: string, filename: string) {
  return {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  };
}
