import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Info, ShieldCheck, Sparkles } from "lucide-react";

const aboutHighlights = [
  {
    title: "Informação para transformar realidades",
    description: "Dados organizados para apoiar equipes, unidades e território.",
    icon: Sparkles,
  },
  {
    title: "Decisões baseadas em evidências",
    description: "Indicadores claros para orientar planejamento e monitoramento.",
    icon: ShieldCheck,
  },
  {
    title: "Transparência e responsabilidade",
    description: "Conteúdos institucionais para fortalecer a gestão pública.",
    icon: Info,
  },
];

export function HomeAboutSection() {
  return (
    <section className="bg-[#f5f8fc] pb-4 pt-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <article className="grid gap-6 rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
              <Info className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
                Institucional
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[#06285f]">Sobre a Vigilância</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#60708a]">
                A Vigilância Socioassistencial é responsável por produzir,
                sistematizar, analisar e disseminar informações sobre os territórios,
                as vulnerabilidades e a oferta de serviços.
              </p>
              <Link
                href="/a-vigilancia"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#074fb8] transition hover:text-[#063f92]"
              >
                Conheça a Vigilância
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {aboutHighlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.title}
                  className="about-card rounded-lg border border-[#e3ebf6] bg-[#f9fbff] p-4 transition hover:-translate-y-0.5 hover:border-[#bcd5f4] hover:bg-white hover:shadow-sm"
                  style={{ "--card-delay": `${index * 70}ms` } as CSSProperties}
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold leading-snug text-[#06285f]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#60708a]">{item.description}</p>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </section>
  );
}
