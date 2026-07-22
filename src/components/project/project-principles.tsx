import { ShieldCheck } from "lucide-react";
import { projectContent } from "@/content/project";

export function ProjectPrinciples() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
            Princípios
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#06285f]">
            Uma base simples, segura e transparente
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#60708a]">
            {projectContent.principlesText}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {projectContent.principles.map((principle) => (
            <div
              key={principle}
              className="flex items-center gap-3 rounded-xl border border-[#dbe5f1] bg-[#f8fbff] p-4"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#074fb8] shadow-sm">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-[#06285f]">
                {principle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
