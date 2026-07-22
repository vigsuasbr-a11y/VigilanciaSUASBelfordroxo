import type { Metadata } from "next";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { SystemDetailCard } from "@/components/systems/system-detail-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSystems } from "@/services/systems";

export const metadata: Metadata = {
  title: "Acesso aos sistemas",
};

export default async function SistemasPage() {
  const systems = await getSystems();

  return (
    <PortalChrome>
      <main id="conteudo" className="bg-[#f5f8fc]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          as="h1"
          title="Acesso aos sistemas"
          description="Escolha o sistema desejado. A autenticação será solicitada apenas nos sistemas restritos."
        />
        <div className="mt-8 space-y-5">
          {systems.map((system) => (
            <SystemDetailCard key={system.slug} system={system} />
          ))}
        </div>
      </section>
      </main>
    </PortalChrome>
  );
}
