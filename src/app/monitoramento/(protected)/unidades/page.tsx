import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { MetricCard } from "@/monitoramento/components/ui/metric-card";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { serviceTypeLabel } from "@/monitoramento/lib/service-types";
import { listUnits } from "@/monitoramento/services/units";

export default async function UnitsPage() {
  const units = await listUnits();
  const active = units.filter((unit) => unit.active).length;

  return (
    <PageContainer wide>
      <PageHeader
        description="Cadastro de unidades e serviços por setor socioassistencial."
        eyebrow="Catálogo"
        icon="units"
        title="Unidades"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon="units" label="Total" value={units.length} />
        <MetricCard
          icon="success"
          label="Ativas"
          tone="success"
          value={active}
        />
        <MetricCard
          icon="pending"
          label="Inativas"
          tone="neutral"
          value={units.length - active}
        />
      </section>

      <DataTable minWidth="min-w-[760px]">
        <thead className={dataTableHeaderClass}>
          <tr>
            <th className={dataTableCellClass}>Ordem</th>
            <th className={dataTableCellClass}>Código</th>
            <th className={dataTableCellClass}>Unidade</th>
            <th className={dataTableCellClass}>Sigla</th>
            <th className={dataTableCellClass}>Setor</th>
            <th className={dataTableCellClass}>Status</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr className={dataTableRowClass} key={unit.id}>
              <td className={dataTableCellClass}>{unit.display_order}</td>
              <td className={`${dataTableCellClass} font-mono text-xs`}>
                {unit.code}
              </td>
              <td className={`${dataTableCellClass} font-bold text-blue-950`}>
                {unit.full_name}
              </td>
              <td className={dataTableCellClass}>{unit.acronym}</td>
              <td className={dataTableCellClass}>
                {serviceTypeLabel(unit.unit_type)}
              </td>
              <td className={dataTableCellClass}>
                <StatusBadge
                  icon={unit.active ? "success" : "pending"}
                  tone={unit.active ? "success" : "neutral"}
                >
                  {unit.active ? "Ativa" : "Inativa"}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </PageContainer>
  );
}
