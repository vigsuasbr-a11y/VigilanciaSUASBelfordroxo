import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import { institutionalNumbers } from "@/config/home-data";

export function InstitutionalNumbersSection() {
  return (
    <section className="bg-[#f5f8fc] py-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#cfe0f4] bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-[#06285f]">
              <Sparkles className="size-5 text-[#074fb8]" aria-hidden="true" />
              A Vigilância em números
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#60708a]">
              Indicadores institucionais usados para orientar o acompanhamento da rede.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {institutionalNumbers.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.label}
                className="numbers-card flex min-h-20 items-center gap-4 border-[#dbe5f1] lg:border-r lg:pr-4 lg:last:border-r-0"
                style={{ "--card-delay": `${index * 65}ms` } as CSSProperties}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-50 text-[#074fb8]">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex items-end gap-2 text-[#06285f]">
                    {item.value ? (
                      <span className="text-4xl font-bold leading-none tracking-[-0.03em]">{item.value}</span>
                    ) : null}
                    <h3 className="text-sm font-semibold leading-5">{item.label}</h3>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#60708a]">{item.description}</p>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
