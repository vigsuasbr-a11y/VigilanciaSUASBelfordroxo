import { notFound } from "next/navigation";

import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { SectionCard } from "@/monitoramento/components/ui/section-card";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { getIndicatorByCode } from "@/monitoramento/services/indicators";

type IndicatorDetailProps = {
  params: Promise<{ code: string }>;
};

export default async function IndicatorDetailPage({
  params,
}: IndicatorDetailProps) {
  const { code } = await params;
  const indicator = await getIndicatorByCode(code);

  if (!indicator) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        badge={
          <StatusBadge
            icon={indicator.is_dashboard_featured ? "success" : "pending"}
            tone={indicator.is_dashboard_featured ? "success" : "neutral"}
          >
            {indicator.is_dashboard_featured
              ? "Indicador estratégico"
              : "Indicador operacional"}
          </StatusBadge>
        }
        description={
          <>
            Código técnico:{" "}
            <span className="font-mono text-xs">{indicator.code}</span>
          </>
        }
        eyebrow="Indicador"
        icon="indicators"
        title={indicator.display_name}
      />

      <SectionCard icon="info" title="Dados do indicador">
        <dl className="grid gap-4 md:grid-cols-2">
          <Detail label="Nome original" value={indicator.original_name} />
          <Detail label="Grupo" value={indicator.indicator_groups?.name} />
          <Detail label="Célula fonte" mono value={indicator.source_cell} />
          <Detail
            label="Células preservadas"
            mono
            value={indicator.source_cells}
          />
          <Detail label="Tipo" value={dataTypeLabel(indicator.data_type)} />
          <Detail
            label="Cálculo mensal"
            value={calculationLabel(indicator.calculation_type)}
          />
          <Detail
            label="Agregação anual"
            value={aggregationLabel(indicator.annual_aggregation_type)}
          />
        </dl>
      </SectionCard>
    </PageContainer>
  );
}

function Detail({
  label,
  mono = false,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-slate-100 bg-slate-50 p-3">
      <dt className="text-sm font-bold text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? "mt-1 break-words font-mono text-sm text-blue-950"
            : "mt-1 font-bold text-blue-950"
        }
      >
        {value || "Não informado"}
      </dd>
    </div>
  );
}

function dataTypeLabel(value: string) {
  const labels: Record<string, string> = {
    boolean: "Sim ou não",
    decimal: "Número decimal",
    integer: "Número inteiro",
    text: "Texto",
  };

  return labels[value] ?? value;
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

function aggregationLabel(value: string) {
  const labels: Record<string, string> = {
    average: "Média anual",
    last: "Último valor do ano",
    max: "Maior valor do ano",
    min: "Menor valor do ano",
    sum: "Soma anual",
  };

  return labels[value] ?? value;
}
