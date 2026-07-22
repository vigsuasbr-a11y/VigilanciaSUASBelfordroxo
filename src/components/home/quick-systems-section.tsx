import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileText,
  FolderOpen,
  UsersRound,
  Zap,
} from "lucide-react";
import type { PortalSystem } from "@/types/domain";

const baseQuickAccessItems = [
  {
    title: "Gestão de Funcionários",
    description: "Sistema operacional para gestão de pessoas e vínculos.",
    href: "/login?redirectTo=/funcionarios",
    icon: UsersRound,
    tone: "blue",
  },
  {
    title: "Monitoramento Socioassistencial",
    description: "Painéis, metas, atividades e acompanhamento da rede.",
    href: "/monitoramento",
    icon: BarChart3,
    tone: "green",
  },
  {
    title: "Indicadores da Rede",
    description: "Dados consolidados sobre unidades, serviços e atendimentos.",
    href: "/indicadores",
    icon: ClipboardList,
    tone: "purple",
  },
  {
    title: "Relatórios e Boletins",
    description: "Relatórios técnicos, boletins e diagnósticos da Vigilância.",
    href: "/publicacoes",
    icon: FileText,
    tone: "orange",
  },
  {
    title: "Biblioteca de Documentos",
    description: "Planos, orientações técnicas e formulários institucionais.",
    href: "/publicacoes",
    icon: FolderOpen,
    tone: "blue",
  },
];

const toneClasses: Record<string, { card: string; icon: string; title: string }> = {
  blue: {
    card: "border-blue-200 bg-gradient-to-br from-white to-blue-50",
    icon: "bg-blue-50 text-[#074fb8]",
    title: "text-[#074fb8]",
  },
  green: {
    card: "border-emerald-200 bg-gradient-to-br from-white to-emerald-50",
    icon: "bg-emerald-50 text-[#008b6c]",
    title: "text-[#008b6c]",
  },
  purple: {
    card: "border-violet-200 bg-gradient-to-br from-white to-violet-50",
    icon: "bg-violet-50 text-[#6d38d6]",
    title: "text-[#6d38d6]",
  },
  orange: {
    card: "border-orange-200 bg-gradient-to-br from-white to-orange-50",
    icon: "bg-orange-50 text-[#e85d04]",
    title: "text-[#e85d04]",
  },
};

export function QuickSystemsSection({ systems }: { systems: PortalSystem[] }) {
  const employeeSystem = systems.find((system) => system.slug === "gestao-funcionarios");
  const monitoringSystem = systems.find(
    (system) => system.slug === "monitoramento-socioassistencial",
  );
  const quickAccessItems = baseQuickAccessItems.map((item) => {
    if (item.title === "Gestão de Funcionários" && employeeSystem?.url) {
      return { ...item, href: employeeSystem.url };
    }

    if (item.title === "Monitoramento Socioassistencial" && monitoringSystem?.url) {
      return { ...item, href: monitoringSystem.url };
    }

    return item;
  });

  return (
    <section id="sistemas" className="section-anchor bg-[#f5f8fc] py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#dbe5f1] bg-white p-4 shadow-[0_14px_32px_rgba(8,39,85,0.08)]">
          <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#06285f]">
            <Zap className="size-4 text-[#074fb8]" aria-hidden="true" />
            Acesso rápido
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {quickAccessItems.map((item, index) => {
              const Icon = item.icon;
              const tone = toneClasses[item.tone];
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`quick-access-card group flex min-h-32 items-center gap-4 rounded-lg border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone.card}`}
                  style={{ "--card-delay": `${index * 70}ms` } as CSSProperties}
                >
                  <span className={`grid size-12 shrink-0 place-items-center rounded-lg ${tone.icon}`}>
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className={`block text-base font-semibold leading-5 ${tone.title}`}>
                      {item.title}
                    </strong>
                    <span className="mt-2 block text-xs leading-5 text-[#10213a]">
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight className={`size-4 shrink-0 ${tone.title} group-hover:translate-x-0.5`} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
