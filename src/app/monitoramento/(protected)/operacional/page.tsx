import { OperationalMonitoringView } from "@/monitoramento/components/monitoring/operational-monitoring";
import type { OperationalStatusFilter } from "@/monitoramento/features/monitoring/operational";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";
import type { ServiceTypeFilter } from "@/monitoramento/lib/service-types";
import { getOperationalMonitoringData } from "@/monitoramento/services/operational-monitoring";

type MonitoringPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OperationalMonitoringPage({
  searchParams,
}: MonitoringPageProps) {
  await requireActiveSession();

  const params = (await searchParams) ?? {};
  const data = await getOperationalMonitoringData({
    serviceType: stringParam(params.service_type) as
      ServiceTypeFilter | undefined,
    referenceYear: numberParam(params.reference_year),
    referenceMonth: numberParam(params.reference_month),
    formVersionId: stringParam(params.form_version_id) ?? null,
    status: stringParam(params.status) as OperationalStatusFilter | undefined,
    unitId: stringParam(params.unit_id) ?? "all",
  });

  return <OperationalMonitoringView data={data} />;
}

function stringParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const parsed = Number(stringParam(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}
