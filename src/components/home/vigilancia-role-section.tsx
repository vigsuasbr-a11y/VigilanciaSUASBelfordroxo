import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { vigilanciaRoles } from "@/config/home-data";
import { SectionHeading } from "@/components/ui/section-heading";

export function VigilanciaRoleSection() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Áreas de atuação"
          description="Como a Vigilância organiza dados, acompanha a rede e apoia decisões."
        />
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vigilanciaRoles.map((role, index) => {
            const Icon = role.icon;
            return (
              <article
                key={role.title}
                className="group relative min-h-56 overflow-hidden rounded-lg border border-[#dbe5f1] bg-gradient-to-br from-white to-[#f5f8fc] p-6 shadow-sm hover:-translate-y-1 hover:border-[#9fc6f4] hover:shadow-md"
              >
                <span className="absolute right-5 top-4 text-5xl font-semibold leading-none text-[#e8f2ff]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="grid size-12 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-[#10213a]">{role.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#60708a]">{role.description}</p>
                <Link
                  href="/a-vigilancia"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#074fb8]"
                >
                  Saiba mais
                  <ArrowRight className="size-4 group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#0a84ff] transition-transform duration-200 group-hover:scale-x-100" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
