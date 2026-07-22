import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Grid2X2 } from "lucide-react";

type UnderConstructionPageProps = {
  areaTitle: string;
  description?: string;
  icon: LucideIcon;
};

export function UnderConstructionPage({
  areaTitle,
  description = "Esta página faz parte do processo de modernização da Vigilância Socioassistencial. Em breve, novos conteúdos, dados e ferramentas estarão disponíveis.",
  icon: Icon,
}: UnderConstructionPageProps) {
  return (
    <main id="conteudo" className="bg-[#f5f8fc]">
      <section className="mx-auto grid min-h-[62vh] max-w-5xl place-items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-lg border border-[#dbe5f1] bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
            <Icon className="size-8" aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-black uppercase text-[#00a67e]">{areaTitle}</p>
          <h1 className="mt-2 text-3xl font-black text-[#06285f] sm:text-4xl">
            Estamos preparando esta área
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#60708a]">
            {description}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#dbe5f1] bg-white px-5 py-3 text-sm font-bold text-[#06285f] hover:bg-blue-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar para o início
            </Link>
            <Link
              href="/sistemas"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#074fb8] px-5 py-3 text-sm font-bold text-white hover:bg-[#063f93]"
            >
              <Grid2X2 className="size-4" aria-hidden="true" />
              Acessar sistemas
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
