import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InformationFlowSection } from "@/components/home/information-flow-section";
import { VigilanciaRoleSection } from "@/components/home/vigilancia-role-section";
import { WhatIsVigilanciaSection } from "@/components/home/what-is-vigilancia-section";
import { PortalChrome } from "@/components/layout/portal-chrome";

export const metadata: Metadata = {
  title: "A Vigilância",
};

export default function AVigilanciaPage() {
  return (
    <PortalChrome>
      <main id="conteudo">
        <WhatIsVigilanciaSection />
        <VigilanciaRoleSection />
        <InformationFlowSection />
        <section className="bg-white pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-[#dbe5f1] bg-[#f8fbff] p-5 shadow-sm">
              <Link
                href="/sobre-o-projeto"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#074fb8] hover:text-[#06285f]"
              >
                Conheça a história deste portal
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PortalChrome>
  );
}
