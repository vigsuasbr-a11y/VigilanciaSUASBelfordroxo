import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { EmptyState } from "@/monitoramento/components/ui/empty-state";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { formatDateTime } from "@/monitoramento/lib/format";
import { listAuditLogs } from "@/monitoramento/services/audit";

export default async function AuditPage() {
  const logs = await listAuditLogs();

  return (
    <PageContainer>
      <PageHeader
        description="Trilha de alterações de negócio e segurança para acompanhamento institucional."
        eyebrow="Gestão"
        icon="audit"
        title="Auditoria"
      />

      <DataTable
        empty={
          logs.length === 0 ? (
            <EmptyState
              description="Quando houver movimentações disponíveis para sua sessão, elas aparecerão aqui."
              icon="audit"
              title="Nenhum evento de auditoria disponível"
            />
          ) : null
        }
        minWidth="min-w-[860px]"
      >
        <thead className={dataTableHeaderClass}>
          <tr>
            <th className={dataTableCellClass}>Data</th>
            <th className={dataTableCellClass}>Ação</th>
            <th className={dataTableCellClass}>Entidade</th>
            <th className={dataTableCellClass}>Registro</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr className={dataTableRowClass} key={log.id}>
              <td className={dataTableCellClass}>
                {formatDateTime(log.created_at)}
              </td>
              <td className={dataTableCellClass}>
                <StatusBadge icon="activity" tone="info">
                  {auditActionLabel(log.action)}
                </StatusBadge>
              </td>
              <td className={dataTableCellClass}>
                {auditEntityLabel(log.entity_type)}
              </td>
              <td className={`${dataTableCellClass} font-mono text-xs`}>
                {log.entity_id}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </PageContainer>
  );
}

function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    delete: "Exclusão",
    insert: "Criação",
    login: "Acesso",
    logout: "Saída",
    publish: "Publicação",
    update: "Alteração",
  };

  return labels[action] ?? action;
}

function auditEntityLabel(entity: string) {
  const labels: Record<string, string> = {
    competencies: "Competência",
    indicator_values: "Indicador",
    profiles: "Usuário",
    publications: "Publicação",
    units: "Unidade",
  };

  return labels[entity] ?? entity;
}
