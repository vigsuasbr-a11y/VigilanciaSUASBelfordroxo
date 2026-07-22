import { Lightbulb } from "lucide-react";
import { projectContent } from "@/content/project";

export function ProjectOriginSection() {
  return (
    <section className="bg-[#f5f8fc] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <article className="rounded-2xl border border-[#dbe5f1] bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
            <div>
              <span className="grid size-12 place-items-center rounded-xl bg-[#eaf4ff] text-[#074fb8]">
                <Lightbulb className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[#06285f]">
                Como surgiu
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-[#38506f]">
              {projectContent.howItStarted.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
