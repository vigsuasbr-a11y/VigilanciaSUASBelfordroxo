import type { Metadata } from "next";
import { ChartNoAxesCombined } from "lucide-react";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { UnderConstructionPage } from "@/components/ui/under-construction-page";

export const metadata: Metadata = {
  title: "Monitoramento Socioassistencial",
};

export default function MonitoramentoPage() {
  return (
    <PortalChrome>
      <UnderConstructionPage
        areaTitle="Monitoramento Socioassistencial"
        description="Futuro módulo para acompanhamento de indicadores, metas, atividades, unidades, prazos e relatórios da rede socioassistencial."
        icon={ChartNoAxesCombined}
      />
    </PortalChrome>
  );
}
