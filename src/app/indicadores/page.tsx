import type { Metadata } from "next";
import { InstitutionalNumbersSection } from "@/components/home/institutional-numbers-section";
import { PortalChrome } from "@/components/layout/portal-chrome";

export const metadata: Metadata = {
  title: "Indicadores",
};

export default function IndicadoresPage() {
  return (
    <PortalChrome>
      <main id="conteudo" className="bg-white">
        <section className="bg-[#f5f8fc] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#00a67e]">
              Indicadores
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-[#06285f] sm:text-4xl">
              Dados em destaque
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#60708a]">
              Esta área apresenta os indicadores institucionais já organizados para
              consulta pública. Novos dados serão publicados somente após validação
              técnica da base oficial.
            </p>
          </div>
        </section>
        <InstitutionalNumbersSection />
      </main>
    </PortalChrome>
  );
}
