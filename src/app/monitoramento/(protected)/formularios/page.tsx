import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { EmptyState } from "@/monitoramento/components/ui/empty-state";
import { MetricCard } from "@/monitoramento/components/ui/metric-card";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { formatDateTime } from "@/monitoramento/lib/format";
import { serviceTypeLabel } from "@/monitoramento/lib/service-types";
import {
  getFormVersionCatalogOverviews,
  type FormVersionCatalogOverview,
} from "@/monitoramento/services/form-version-catalogs";

export default async function FormVersionsPage() {
  const overviews = await getFormVersionCatalogOverviews();
  const totals = overviews.reduce(
    (acc, overview) => ({
      groups: acc.groups + overview.counts.groups,
      indicators: acc.indicators + overview.counts.indicators,
      units: acc.units + overview.activeUnits,
    }),
    { groups: 0, indicators: 0, units: 0 },
  );

  return (
    <PageContainer wide>
      <PageHeader
        description="Versões por setor, status operacional e contagens do catálogo."
        eyebrow="Ativação controlada"
        icon="forms"
        title="Formulários"
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon="forms" label="Versões" value={overviews.length} />
        <MetricCard icon="units" label="Unidades" value={totals.units} />
        <MetricCard
          icon="indicators"
          label="Indicadores"
          value={totals.indicators}
        />
      </section>

      <DataTable
        empty={
          overviews.length === 0 ? (
            <EmptyState
              description="As versões aparecerão após a ativação dos catálogos oficiais."
              icon="forms"
              title="Nenhuma versão de formulário encontrada"
            />
          ) : null
        }
        minWidth="min-w-[1080px]"
      >
        <thead className={dataTableHeaderClass}>
          <tr>
            <th className={dataTableCellClass}>Setor</th>
            <th className={dataTableCellClass}>Formulário</th>
            <th className={dataTableCellClass}>Estado</th>
            <th className={dataTableCellClass}>Unidades</th>
            <th className={dataTableCellClass}>Grupos</th>
            <th className={dataTableCellClass}>Indicadores</th>
            <th className={dataTableCellClass}>Estratégicos</th>
            <th className={dataTableCellClass}>Observações</th>
            <th className={dataTableCellClass}>Campos especiais</th>
            <th className={dataTableCellClass}>Atualização</th>
          </tr>
        </thead>
        <tbody>
          {overviews.map((overview) => (
            <tr className={dataTableRowClass} key={overview.formVersion.id}>
              <td className={dataTableCellClass}>
                {serviceTypeLabel(overview.serviceType)}
              </td>
              <td className={dataTableCellClass}>
                <p className="font-bold text-blue-950">
                  {overview.formVersion.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Código técnico:{" "}
                  <span className="font-mono">{overview.formVersion.code}</span>
                </p>
              </td>
              <td className={dataTableCellClass}>
                <OperationalStateBadge overview={overview} />
              </td>
              <td className={dataTableCellClass}>{overview.activeUnits}</td>
              <td className={dataTableCellClass}>{overview.counts.groups}</td>
              <td className={dataTableCellClass}>
                {overview.counts.indicators}
              </td>
              <td className={dataTableCellClass}>
                {overview.counts.featuredIndicators}
              </td>
              <td className={dataTableCellClass}>
                {overview.counts.observations}
              </td>
              <td className={dataTableCellClass}>
                {overview.counts.specialFields}
              </td>
              <td className={dataTableCellClass}>
                {formatDateTime(overview.formVersion.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </PageContainer>
  );
}

function OperationalStateBadge({
  overview,
}: {
  overview: FormVersionCatalogOverview;
}) {
  if (overview.operationalState === "available") {
    return (
      <StatusBadge icon="success" tone="success">
        Operacional
      </StatusBadge>
    );
  }

  if (overview.operationalState === "archived") {
    return (
      <StatusBadge icon="pending" tone="neutral">
        Arquivado
      </StatusBadge>
    );
  }

  return (
    <StatusBadge icon="review" tone="warning">
      Em revisão
    </StatusBadge>
  );
}
