import { HeartHandshake, Lightbulb, UserRound } from "lucide-react";
import { projectContent } from "@/content/project";

export function ProjectAuthorSection() {
  const initiativeText = projectContent.showNoDevelopmentCostStatement
    ? projectContent.noDevelopmentCostStatement
    : projectContent.voluntaryInitiativeText;

  return (
    <section className="bg-[#f5f8fc] py-10">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <article className="rounded-2xl border border-[#dbe5f1] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-[#074fb8]">
              <UserRound className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
                Autoria
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#06285f]">
                {projectContent.authorSectionTitle}
              </h2>
              <p className="mt-4 text-lg font-semibold text-[#10213a]">
                {projectContent.author}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#38506f]">
                {projectContent.authorDescription}
              </p>
              <p className="mt-4 rounded-xl border border-[#cfe0f4] bg-[#f8fbff] p-4 text-sm leading-6 text-[#60708a]">
                {projectContent.authorNote}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#dbe5f1] bg-[#031b45] p-6 text-white shadow-sm">
          <span className="grid size-12 place-items-center rounded-xl bg-white/10 text-[#4ee7ff]">
            <HeartHandshake className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">
            {projectContent.voluntarySectionTitle}
          </h2>
          <p className="mt-4 text-sm leading-6 text-blue-100">
            {initiativeText}
          </p>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-blue-50">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-[#4ee7ff]" aria-hidden="true" />
            <p>
              A comunicação foi estruturada de forma institucional, valorizando a
              contribuição ao serviço público sem transformar a autoria em peça
              promocional.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
