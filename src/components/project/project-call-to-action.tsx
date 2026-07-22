import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { projectContent } from "@/content/project";

export function ProjectCallToAction() {
  return (
    <section className="bg-[#031b45] py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            {projectContent.finalTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            {projectContent.finalText}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/16"
          >
            <Home className="size-4" aria-hidden="true" />
            Voltar ao início
          </Link>
          <Link
            href="/servicos"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0a84ff] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0474e4]"
          >
            Acessar serviços
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
