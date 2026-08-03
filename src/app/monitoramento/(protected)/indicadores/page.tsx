import type { Route } from "next";
import Link from "next/link";

import {
  DataTable,
  dataTableCellClass,
  dataTableHeaderClass,
  dataTableRowClass,
} from "@/monitoramento/components/ui/data-table";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { listIndicators } from "@/monitoramento/services/indicators";

export default async function IndicatorsPage() {
  const indicators = await listIndicators(120);

  return (
    <PageContainer wide>
      <PageHeader
        description="Catálogos versionados dos formulários socioassistenciais."
        eyebrow="Catálogo"
        icon="indicators"
        title="Indicadores"
      />

      <DataTable minWidth="min-w-[980px]">
        <thead className={dataTableHeaderClass}>
          <tr>
            <th className={dataTableCellClass}>Ordem</th>
            <th className={dataTableCellClass}>Indicador</th>
            <th className={dataTableCellClass}>Grupo</th>
            <th className={dataTableCellClass}>Fonte</th>
            <th className={dataTableCellClass}>Cálculo</th>
            <th className={dataTableCellClass}>Dashboard</th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator) => (
            <tr className={dataTableRowClass} key={indicator.id}>
              <td className={dataTableCellClass}>{indicator.display_order}</td>
              <td className={dataTableCellClass}>
                <Link
                  className="font-bold text-primary hover:underline"
                  href={`/monitoramento/indicadores/${indicator.code}` as Route}
                >
                  {indicator.display_name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  Código técnico:{" "}
                  <span className="font-mono">{indicator.code}</span>
                </p>
              </td>
              <td className={dataTableCellClass}>
                {indicator.indicator_groups?.name}
              </td>
              <td className={`${dataTableCellClass} font-mono text-xs`}>
                {indicator.source_cell}
              </td>
              <td className={dataTableCellClass}>
                {calculationLabel(indicator.calculation_type)}
              </td>
              <td className={dataTableCellClass}>
                <StatusBadge
                  icon={indicator.is_dashboard_featured ? "success" : "pending"}
                  tone={indicator.is_dashboard_featured ? "success" : "neutral"}
                >
                  {indicator.is_dashboard_featured ? "Elegível" : "Não"}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      {indicators.length === 120 ? (
        <p className="text-sm text-muted-foreground">
          Exibindo os 120 primeiros registros para inspeção.
        </p>
      ) : null}
    </PageContainer>
  );
}

function calculationLabel(value: string) {
  const labels: Record<string, string> = {
    monthly_flow: "Fluxo mensal",
    monthly_stock: "Estoque mensal",
    percentage: "Percentual",
    ratio: "Razão",
    sum: "Soma",
  };

  return labels[value] ?? value;
}
