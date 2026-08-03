import { AppIcon } from "@/monitoramento/components/ui/app-icon";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { SectionCard } from "@/monitoramento/components/ui/section-card";

export default function AboutPage() {
  const resources = [
    "Formulários oficiais para PSB, PSE, Centro POP, Complexo da Cidadania e Gestão do SUAS.",
    "Login seguro, perfis de acesso e permissões por responsabilidade.",
    "Competências mensais com preenchimento, revisão, devolução e publicação.",
    "Monitoramento operacional, painel executivo, auditoria e histórico de publicações.",
  ];

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        description="O Sistema de Monitoramento Socioassistencial organiza, acompanha e consolida informações da rede de atendimento para apoiar a Vigilância, as unidades e a gestão municipal."
        eyebrow="Institucional"
        icon="about"
        title="Sobre o sistema"
      />

      <SectionCard
        description="Principais capacidades disponíveis para acompanhamento da rede."
        icon="success"
        title="Recursos disponíveis"
      >
        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          {resources.map((resource) => (
            <li
              className="flex gap-3 rounded-[var(--radius-lg)] border border-slate-100 bg-slate-50 p-3 leading-6"
              key={resource}
            >
              <AppIcon
                className="mt-0.5 text-blue-700"
                name="success"
                size="sm"
              />
              <span>{resource}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </PageContainer>
  );
}
