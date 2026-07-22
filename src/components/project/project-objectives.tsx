import type { CSSProperties } from "react";
import { BarChart3, FolderOpen, ShieldCheck, Workflow } from "lucide-react";
import { projectContent } from "@/content/project";

const objectiveIcons = [FolderOpen, BarChart3, Workflow, ShieldCheck];

export function ProjectObjectives() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
            Objetivos
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#06285f]">
            O que o portal busca fortalecer
          </h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projectContent.objectives.map((objective, index) => {
            const Icon = objectiveIcons[index] ?? FolderOpen;

            return (
              <article
                key={objective.title}
                className="project-card rounded-xl border border-[#dbe5f1] bg-[#f8fbff] p-5 shadow-sm"
                style={{ "--card-delay": `${index * 80}ms` } as CSSProperties}
              >
                <span className="grid size-11 place-items-center rounded-xl bg-white text-[#074fb8] shadow-sm">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#06285f]">
                  {objective.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#60708a]">
                  {objective.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
