import type { CSSProperties } from "react";
import {
  BarChart3,
  ClipboardList,
  FileText,
  FolderOpen,
  Grid2X2,
  Mail,
  Megaphone,
  Network,
} from "lucide-react";
import { projectContent } from "@/content/project";

const resourceIcons = [
  Network,
  BarChart3,
  FileText,
  Grid2X2,
  ClipboardList,
  FolderOpen,
  Megaphone,
  Mail,
];

export function ProjectResources() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
            O que o portal reúne
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#06285f]">
            Informações e acessos em um só lugar
          </h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {projectContent.resources.map((resource, index) => {
            const Icon = resourceIcons[index] ?? FolderOpen;

            return (
              <article
                key={resource.title}
                className="project-card rounded-xl border border-[#dbe5f1] bg-[#f8fbff] p-4"
                style={{ "--card-delay": `${index * 55}ms` } as CSSProperties}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-white text-[#074fb8] shadow-sm">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-[#06285f]">
                  {resource.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#60708a]">
                  {resource.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
