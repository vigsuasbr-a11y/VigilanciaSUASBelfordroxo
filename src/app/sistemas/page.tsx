import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Layers3,
  LockKeyhole,
  MonitorCog,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { SystemDetailCard } from "@/components/systems/system-detail-card";
import { getSystems } from "@/services/systems";

export const metadata: Metadata = {
  title: "Acesso aos sistemas",
};

export default async function SistemasPage() {
  const systems = await getSystems();
  const operationalCount = systems.filter((system) => system.status === "operacional").length;
  const restrictedCount = systems.filter((system) =>
    system.accessType.toLowerCase().includes("restrito"),
  ).length;

  return (
    <PortalChrome>
      <main id="conteudo" className="bg-[#f5f8fc]">
        <section className="overflow-hidden border-b border-[#dbe5f1] bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.96fr_1.04fr] lg:px-8 lg:py-14">
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
                <MonitorCog className="size-4" aria-hidden="true" />
                Central de acesso
              </span>
              <h1 className="mt-5 max-w-3xl text-[30px] font-semibold leading-[1.12] tracking-[-0.025em] text-[#06285f] sm:text-5xl">
                Sistemas da Vigilância Socioassistencial
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#4d5f7a]">
                Acesse ferramentas institucionais para gestão de pessoas, monitoramento,
                organização de dados e apoio às rotinas técnicas da SEMASC.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <HeroMetric
                  icon={<Layers3 className="size-5" aria-hidden="true" />}
                  value={systems.length}
                  label="sistemas listados"
                />
                <HeroMetric
                  icon={<Activity className="size-5" aria-hidden="true" />}
                  value={operationalCount}
                  label="em operação"
                />
                <HeroMetric
                  icon={<LockKeyhole className="size-5" aria-hidden="true" />}
                  value={restrictedCount}
                  label="com acesso restrito"
                />
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-[#cfe0f4] bg-[#06285f] p-6 text-white shadow-[0_24px_60px_rgba(8,39,85,0.18)]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#0a84ff]/18 to-transparent" />
              <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-cyan-300/50 via-blue-200/20 to-transparent" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs font-semibold text-blue-100">
                      <ShieldCheck className="size-4 text-cyan-200" aria-hidden="true" />
                      Acesso protegido
                    </span>
                    <h2 className="mt-4 max-w-md text-2xl font-semibold leading-tight tracking-[-0.02em]">
                      Ferramentas organizadas para a equipe certa, no momento certo.
                    </h2>
                  </div>
                  <span className="hidden size-14 place-items-center rounded-lg bg-white/[0.12] text-cyan-200 sm:grid">
                    <DatabaseZap className="size-7" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {systems.map((system, index) => (
                    <div
                      key={system.slug}
                      className="rounded-lg border border-white/10 bg-white/[0.08] p-4 backdrop-blur"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.025em] text-blue-100">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <strong className="mt-2 block text-base font-semibold text-white">
                        {system.shortName}
                      </strong>
                      <span className="mt-1 block text-sm leading-6 text-blue-100">
                        {system.status === "operacional"
                          ? "Disponível para usuários autorizados."
                          : "Preparado para evolução e validação técnica."}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-7">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#06285f] shadow-sm">
                    <Sparkles className="size-4 text-[#074fb8]" aria-hidden="true" />
                    Portal público, sistemas protegidos quando necessário
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.025em] text-[#00a67e]">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Ferramentas disponíveis
                </span>
                <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#06285f]">
                  Escolha o sistema desejado
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#60708a]">
                  A autenticação aparece apenas quando o sistema exige acesso restrito.
                  Módulos em desenvolvimento ficam sinalizados para acompanhamento.
                </p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#dbe5f1] bg-white px-4 py-3 text-sm font-semibold text-[#102d5d] shadow-sm">
                <Clock3 className="size-4 text-[#074fb8]" aria-hidden="true" />
                Atualizado em tempo real pelo portal
              </div>
            </div>

            <div className="mt-7 grid gap-5">
              {systems.map((system) => (
                <SystemDetailCard key={system.slug} system={system} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-10">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <SupportCard
              icon={<ShieldCheck className="size-5" aria-hidden="true" />}
              title="Segurança e controle"
              text="Sistemas restritos preservam acesso apenas para usuários autorizados e ativos."
            />
            <SupportCard
              icon={<DatabaseZap className="size-5" aria-hidden="true" />}
              title="Dados organizados"
              text="As ferramentas apoiam cadastro, monitoramento, análise e qualificação das informações."
            />
            <SupportCard
              icon={<ArrowRight className="size-5" aria-hidden="true" />}
              title="Evolução contínua"
              text="Novos módulos podem ser incorporados ao portal conforme validação técnica da equipe."
            />
          </div>
        </section>
      </main>
    </PortalChrome>
  );
}

function HeroMetric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-4">
      <span className="grid size-10 place-items-center rounded-lg bg-white text-[#074fb8] shadow-sm">
        {icon}
      </span>
      <strong className="mt-4 block text-3xl font-bold leading-none tracking-[-0.03em] text-[#06285f]">
        {value}
      </strong>
      <span className="mt-2 block text-xs leading-5 text-[#60708a]">{label}</span>
    </div>
  );
}

function SupportCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-5">
      <span className="grid size-11 place-items-center rounded-lg bg-white text-[#074fb8] shadow-sm">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-[#06285f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#60708a]">{text}</p>
    </article>
  );
}
