import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { MetricCard } from "@/monitoramento/components/ui/metric-card";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { SectionCard } from "@/monitoramento/components/ui/section-card";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { getUsersPermissionsSnapshot } from "@/monitoramento/services/users";

export default async function PermissionsPage() {
  const snapshot = await getUsersPermissionsSnapshot();
  const activeRoles = snapshot.roles.filter((role) => role.active).length;

  return (
    <PageContainer wide>
      <PageHeader
        description="Papéis de acesso e permissões organizadas por módulo."
        eyebrow="Gestão"
        icon="permissions"
        title="Permissões"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon="profile"
          label="Papéis"
          value={snapshot.roles.length}
        />
        <MetricCard
          icon="success"
          label="Papéis ativos"
          tone="success"
          value={activeRoles}
        />
        <MetricCard
          icon="permissions"
          label="Permissões"
          value={snapshot.permissions.length}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.roles.map((role) => (
          <SectionCard className="h-full" key={role.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-blue-950">{role.name}</h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {role.code}
                </p>
              </div>
              <StatusBadge
                icon={role.active ? "success" : "pending"}
                tone={role.active ? "success" : "neutral"}
              >
                {role.active ? "Ativo" : "Inativo"}
              </StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {role.description}
            </p>
          </SectionCard>
        ))}
      </section>

      <DataTable minWidth="min-w-[760px]">
        <thead className={dataTableHeaderClass}>
          <tr>
            <th className={dataTableCellClass}>Módulo</th>
            <th className={dataTableCellClass}>Permissão</th>
            <th className={dataTableCellClass}>Código técnico</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.permissions.map((permission) => (
            <tr className={dataTableRowClass} key={permission.id}>
              <td className={dataTableCellClass}>
                {moduleLabel(permission.module)}
              </td>
              <td className={`${dataTableCellClass} font-bold text-blue-950`}>
                {permission.name}
              </td>
              <td className={`${dataTableCellClass} font-mono text-xs`}>
                {permission.code}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </PageContainer>
  );
}

function moduleLabel(module: string) {
  const labels: Record<string, string> = {
    audit: "Auditoria",
    competencies: "Competências",
    dashboard: "Dashboard",
    forms: "Formulários",
    indicators: "Indicadores",
    publication: "Publicação",
    units: "Unidades",
    users: "Usuários",
  };

  return labels[module] ?? module;
}
