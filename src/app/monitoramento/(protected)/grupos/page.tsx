import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { listIndicatorGroups } from "@/monitoramento/services/indicators";

export default async function GroupsPage() {
  const groups = await listIndicatorGroups();

  return (
    <PageContainer wide>
      <PageHeader
        description="Grupos oficiais importados e organizados para preenchimento mensal."
        eyebrow="Catálogo"
        icon="groups"
        title="Grupos"
      />

      <DataTable minWidth="min-w-[820px]">
        <thead className={dataTableHeaderClass}>
          <tr>
            <th className={dataTableCellClass}>Ordem</th>
            <th className={dataTableCellClass}>Código</th>
            <th className={dataTableCellClass}>Nome</th>
            <th className={dataTableCellClass}>Linhas</th>
            <th className={dataTableCellClass}>Fonte</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr className={dataTableRowClass} key={group.id}>
              <td className={dataTableCellClass}>{group.display_order}</td>
              <td className={`${dataTableCellClass} font-mono text-xs`}>
                {group.code}
              </td>
              <td className={`${dataTableCellClass} font-bold text-blue-950`}>
                <span className="line-clamp-2">{group.name}</span>
                {group.inferred_name ? (
                  <span className="mt-2 inline-flex">
                    <StatusBadge icon="alert" tone="warning">
                      Inferido
                    </StatusBadge>
                  </span>
                ) : null}
              </td>
              <td className={dataTableCellClass}>
                {group.source_start_row}:{group.source_end_row}
              </td>
              <td className={dataTableCellClass}>{group.source_name}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </PageContainer>
  );
}
