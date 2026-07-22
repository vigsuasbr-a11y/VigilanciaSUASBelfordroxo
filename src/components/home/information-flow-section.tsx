import {
  BarChart3,
  ClipboardCheck,
  Database,
  FileSearch,
  Send,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const flow = [
  {
    title: "Coleta",
    description: "As unidades enviam informações e registros da rotina.",
    icon: Send,
  },
  {
    title: "Organização",
    description: "Os dados são consolidados, conferidos e qualificados.",
    icon: Database,
  },
  {
    title: "Análise",
    description: "A equipe identifica padrões, demandas e prioridades.",
    icon: FileSearch,
  },
  {
    title: "Planejamento",
    description: "As informações apoiam decisões, metas e ações.",
    icon: ClipboardCheck,
  },
  {
    title: "Monitoramento",
    description: "Os resultados são acompanhados continuamente.",
    icon: BarChart3,
  },
];

export function InformationFlowSection() {
  return (
    <section className="bg-[#f5f8fc] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Como a informação vira ação"
          description="Um fluxo contínuo de dados, análise, decisão e acompanhamento."
        />

        <div className="mt-9 grid gap-4 lg:grid-cols-5">
          {flow.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="relative rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm"
              >
                {index < flow.length - 1 ? (
                  <span
                    className="absolute -right-3 top-10 z-10 hidden size-6 place-items-center rounded-full border border-[#cfe0f4] bg-white text-[#074fb8] lg:grid"
                    aria-hidden="true"
                  >
                    →
                  </span>
                ) : null}
                <span className="grid size-12 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#00a67e]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#06285f]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#60708a]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
