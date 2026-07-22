import type { Metadata } from "next";
import { QuickSystemsSection } from "@/components/home/quick-systems-section";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { getSystems } from "@/services/systems";

export const metadata: Metadata = {
  title: "Serviços e ferramentas",
};

export default async function ServicosPage() {
  const systems = await getSystems();

  return (
    <PortalChrome>
      <main id="conteudo">
        <h1 className="sr-only">Serviços e ferramentas</h1>
        <QuickSystemsSection systems={systems} />
      </main>
    </PortalChrome>
  );
}
