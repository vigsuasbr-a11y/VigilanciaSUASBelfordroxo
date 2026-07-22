import type { CSSProperties } from "react";
import { CheckCircle2 } from "lucide-react";
import { projectContent } from "@/content/project";

export function ProjectTimeline() {
  return (
    <section className="bg-[#f5f8fc] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
            Evolução do projeto
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#06285f]">
            Da necessidade prática à expansão dos serviços
          </h2>
        </div>
        <ol className="mt-7 grid gap-4 lg:grid-cols-5">
          {projectContent.timeline.map((item, index) => (
            <li
              key={item}
              className="project-card relative rounded-xl border border-[#dbe5f1] bg-white p-5 shadow-sm"
              style={{ "--card-delay": `${index * 80}ms` } as CSSProperties}
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eaf4ff] text-sm font-semibold text-[#074fb8]">
                  {index + 1}
                </span>
                <CheckCircle2 className="size-5 text-[#00a67e]" aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold leading-6 text-[#06285f]">
                {item}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
