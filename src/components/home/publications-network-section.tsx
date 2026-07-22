import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import {
  networkTypes,
  preparedPublications,
} from "@/config/home-data";
import { SectionHeading } from "@/components/ui/section-heading";

export function PublicationsNetworkSection() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <SectionHeading
            centered={false}
            title="Publicações e documentos"
            description="Estrutura preparada para organizar materiais técnicos validados pela Vigilância."
          />
          <div className="mt-6 grid gap-4">
            {preparedPublications.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="flex gap-4 rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-5 shadow-sm"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-white text-[#074fb8]">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#00a67e]">
                      {item.type}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-[#06285f]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#60708a]">{item.description}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#075aaa]">
                      {item.status}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
          <Link
            href="/publicacoes"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#074fb8]"
          >
            Ver publicações
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div>
          <SectionHeading
            centered={false}
            title="Conheça a rede socioassistencial"
            description="Tipos de unidades e serviços que compõem a rede acompanhada pela Vigilância."
          />
          <div className="mt-6 grid gap-4">
            {networkTypes.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
                    <Building2 className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[#06285f]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#60708a]">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>
                A consulta pública de unidades por território pode ser ampliada assim
                que a base oficial estiver validada para divulgação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
