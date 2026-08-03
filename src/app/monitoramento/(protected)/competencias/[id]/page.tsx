import { notFound } from "next/navigation";

import { CompetencyWizard } from "@/monitoramento/components/competencies/competency-wizard";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";
import { hasPermission } from "@/monitoramento/lib/permissions/permissions";
import { getCompetencyWizardData } from "@/monitoramento/services/competencies";

type CompetencyDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function CompetencyDetailPage({
  params,
}: CompetencyDetailProps) {
  const { id } = await params;
  const [context, data] = await Promise.all([
    requireActiveSession(),
    getCompetencyWizardData(id),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <CompetencyWizard
      canEdit={hasPermission(context.permissions, "competencies.edit_draft")}
      canSubmit={hasPermission(
        context.permissions,
        "competencies.submit_review",
      )}
      data={data}
    />
  );
}
