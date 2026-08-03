import { redirect } from "next/navigation";

import { ExecutiveDashboard } from "@/monitoramento/components/dashboard/executive-dashboard";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";
import { hasPermission } from "@/monitoramento/lib/permissions/permissions";
import { getExecutiveDashboardData } from "@/monitoramento/services/executive-dashboard";

export default async function ExecutiveDashboardPage() {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "dashboard.executive.view")) {
    redirect("/monitoramento/acesso-negado?motivo=sem-permissao-executivo");
  }

  const data = await getExecutiveDashboardData();

  return <ExecutiveDashboard data={data} />;
}
