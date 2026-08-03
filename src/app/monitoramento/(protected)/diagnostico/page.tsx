import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/monitoramento/components/ui/status-badge";
import { getDiagnosticSnapshot } from "@/monitoramento/services/diagnostics";

export default async function DiagnosticsPage() {
  const snapshot = await getDiagnosticSnapshot();
  const rows: Array<[string, string | number]> = [
    ["Ambiente", formatEnvironment(snapshot.environment)],
    ["Versão da aplicação", snapshot.appVersion],
    ["Conexão de dados", formatDataConnection(snapshot.supabaseConnection)],
    [
      "Versão ativa do formulário",
      snapshot.activeFormVersion ?? "Não encontrada",
    ],
    ["Unidades", snapshot.units],
    ["Grupos", snapshot.groups],
    ["Indicadores", snapshot.indicators],
    ["Estratégicos", snapshot.featuredIndicators],
    [
      "Estrutura de dados",
      snapshot.lastMigration ? "Atualizada" : "Não informada",
    ],
  ];
  const status = diagnosticStatus(snapshot.status);

  return (
    <PageContainer>
      <PageHeader
        badge={
          <StatusBadge icon={status.icon} tone={status.tone}>
            {status.label}
          </StatusBadge>
        }
        description="Status dos serviços internos sem exibir chaves ou dados sensíveis."
        eyebrow="Suporte"
        icon="diagnostics"
        title="Diagnóstico"
      />

      <DataTable minWidth="min-w-[620px]">
        <tbody>
          <tr className={dataTableHeaderClass}>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Situação</th>
          </tr>
          {rows.map(([label, value]) => (
            <tr className={dataTableRowClass} key={label}>
              <th
                className={`${dataTableCellClass} w-72 text-xs uppercase text-muted-foreground`}
              >
                {label}
              </th>
              <td className={`${dataTableCellClass} font-medium`}>{value}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </PageContainer>
  );
}

function formatEnvironment(environment: string) {
  const labels: Record<string, string> = {
    development: "Desenvolvimento",
    production: "Produção",
    test: "Teste",
  };

  return labels[environment] ?? environment;
}

function formatDataConnection(status: string) {
  const labels: Record<string, string> = {
    configured: "Operacional",
    missing_env: "Configuração pendente",
    query_failed: "Requer atenção",
  };

  return labels[status] ?? status;
}

function diagnosticStatus(status: string): {
  icon: "success" | "pending" | "alert";
  label: string;
  tone: StatusBadgeTone;
} {
  const labels: Record<string, string> = {
    attention: "Atenção",
    needs_configuration: "Configuração pendente",
    ok: "Operacional",
  };
  const tone: Record<string, StatusBadgeTone> = {
    attention: "warning",
    needs_configuration: "warning",
    ok: "success",
  };
  const icon = status === "ok" ? "success" : "alert";

  return {
    icon,
    label: labels[status] ?? status,
    tone: tone[status] ?? "neutral",
  };
}
