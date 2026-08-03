import type { Route } from "next";
import Link from "next/link";

import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { EmptyState } from "@/monitoramento/components/ui/empty-state";
import { MetricCard } from "@/monitoramento/components/ui/metric-card";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { SectionCard } from "@/monitoramento/components/ui/section-card";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import { getSessionContext } from "@/monitoramento/lib/auth/session";
import { getPublicEnvStatus } from "@/monitoramento/lib/env";
import {
  hasAnyPermission,
  hasPermission,
  type PermissionCode,
} from "@/monitoramento/lib/permissions/permissions";
import { listUnits } from "@/monitoramento/services/units";

type QuickAction = {
  description: string;
  href: Route;
  icon: AppIconName;
  permissions: PermissionCode[];
  title: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Abrir competências",
    description: "Acompanhe ou crie preenchimentos mensais por unidade.",
    href: "/monitoramento/competencias",
    icon: "competencies",
    permissions: ["competencies.view"],
  },
  {
    title: "Acompanhar pendências",
    description: "Veja atrasos, devoluções e unidades ainda sem envio.",
    href: "/monitoramento/operacional",
    icon: "operational",
    permissions: ["competencies.view"],
  },
  {
    title: "Consultar resultados",
    description: "Analise somente dados publicados e consolidados.",
    href: "/monitoramento/executivo",
    icon: "executive",
    permissions: ["dashboard.executive.view"],
  },
  {
    title: "Administrar formulários",
    description: "Confira formulários, complexos e indicadores por setor.",
    href: "/monitoramento/formularios",
    icon: "forms",
    permissions: ["indicators.view"],
  },
];

export default async function HomePage() {
  const [context, units] = await Promise.all([getSessionContext(), listUnits()]);
  const env = getPublicEnvStatus();
  const activePsb = units.filter(
    (unit) => unit.active && unit.unit_type === "cras",
  ).length;
  const activeCentroPop = units.filter(
    (unit) => unit.active && unit.unit_type === "centro_pop",
  ).length;
  const plannedPse = 5;
  const complexoCidadania = 1;
  const territoryTotal = Math.max(
    activePsb + plannedPse + activeCentroPop + complexoCidadania,
    1,
  );
  const visibleActions = quickActions.filter((action) =>
    hasAnyPermission(context.permissions, action.permissions),
  );
  const canManageUsers = hasPermission(context.permissions, "users.view");
  const profileName =
    context.profile?.display_name ?? context.profile?.full_name ?? "usuário";
  const roleNames = context.roles.map((role) => role.name).join(", ");

  return (
    <PageContainer wide>
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-blue-200/25 bg-[radial-gradient(circle_at_78%_18%,rgba(137,189,247,0.34),transparent_18rem),linear-gradient(135deg,#0b6dcf_0%,#0052a3_48%,#062a56_100%)] text-white shadow-[var(--shadow-panel)]">
        <div className="relative p-6 lg:p-8">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[repeating-linear-gradient(105deg,rgba(137,189,247,0.13)_0_1px,transparent_1px_24px)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-8 hidden h-44 w-[520px] rounded-t-full border border-white/10 lg:block"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-4xl">
            <StatusBadge
              className="border-white/20 bg-white text-blue-800"
              icon="monitoring"
              tone="info"
            >
              Sistema de Monitoramento
            </StatusBadge>
            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.15] sm:text-4xl">
              Bom trabalho, {profileName}.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/88">
              Acompanhe o preenchimento mensal, revise pendências e consulte os
              resultados da rede socioassistencial.
            </p>
            {roleNames ? (
              <p className="mt-4 text-sm font-medium text-white/75">
                Perfil de acesso:{" "}
                <span className="font-semibold text-white">{roleNames}</span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {!env.supabaseConfigured ? (
        <section className="surface-card flex items-start gap-3 rounded-[var(--radius-lg)] border-amber-200 bg-amber-50 p-4 text-amber-950">
          <AppIcon className="mt-0.5" name="alert" size="md" />
          <div>
            <h2 className="font-semibold">Configuração pendente</h2>
            <p className="mt-1 text-sm leading-6">
              O ambiente ainda precisa das configurações de acesso para liberar
              login, permissões e gravação dos dados.
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="Proteção Social Básica"
          icon="cras"
          label="PSB"
          tone="info"
          value={activePsb}
        />
        <MetricCard
          description="Proteção Social Especial"
          icon="creas"
          label="PSE"
          tone="success"
          value={plannedPse}
        />
        <MetricCard
          description="População em situação de rua"
          icon="users"
          label="Centro POP"
          tone="info"
          value={activeCentroPop}
        />
        <MetricCard
          description="Integração territorial e cidadania"
          icon="groups"
          label="Complexo da Cidadania"
          value={complexoCidadania}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <SectionCard
          actions={
            canManageUsers ? (
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-blue-100 bg-white/92 px-3 text-sm font-semibold text-blue-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50"
                href="/monitoramento/usuarios"
              >
                Gerenciar usuários
                <AppIcon name="forward" size="sm" />
              </Link>
            ) : null
          }
          description="Atalhos organizados conforme seu perfil de acesso."
          icon="activity"
          title="Ações rápidas"
        >
          {visibleActions.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {visibleActions.map((action) => (
                <Link
                  className="interactive-card group rounded-[var(--radius-xl)] border border-blue-100 bg-[linear-gradient(135deg,#ffffff,#f5f9ff)] p-5 text-blue-950 shadow-sm"
                  href={action.href}
                  key={action.href}
                >
                  <div className="flex items-start gap-4">
                    <span className="icon-surface flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-blue-800">
                      <AppIcon name={action.icon} size="lg" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <AppIcon
                      className="mt-1 transition group-hover:translate-x-1"
                      name="forward"
                      size="sm"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Seu perfil ainda não possui atalhos liberados para esta central."
              icon="lock"
              title="Nenhuma ação disponível"
            />
          )}
        </SectionCard>

        <SectionCard
          description="Distribuição dos serviços acompanhados."
          icon="coverage"
          title="Território"
        >
          <div className="space-y-5">
            <TerritoryBar
              label="PSB"
              total={territoryTotal}
              value={activePsb}
            />
            <TerritoryBar
              label="PSE"
              total={territoryTotal}
              value={plannedPse}
            />
            <TerritoryBar
              label="Centro POP"
              total={territoryTotal}
              value={activeCentroPop}
            />
            <TerritoryBar
              label="Complexo da Cidadania"
              total={territoryTotal}
              value={complexoCidadania}
            />
          </div>
        </SectionCard>
      </section>

      <PageHeader
        badge={
          <StatusBadge icon="info" tone="info">
            Próxima ação
          </StatusBadge>
        }
        description="Comece em Competências para acompanhar o preenchimento mensal, use o Monitoramento Operacional para controlar pendências e consulte o Dashboard Executivo apenas para dados publicados."
        icon="success"
        title="Rotina recomendada"
        variant="operational"
      />
    </PageContainer>
  );
}

function TerritoryBar({
  label,
  total,
  value,
}: {
  label: string;
  total: number;
  value: number;
}) {
  const width = `${Math.max(6, Math.round((value / total) * 100))}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-blue-950">
          {value}
        </span>
      </div>
      <div className="h-10 overflow-hidden rounded-[var(--radius-md)] bg-[linear-gradient(180deg,#f8fbff,#edf4fb)] shadow-inner">
        <div
          className="flex h-full items-center justify-end rounded-[var(--radius-md)] bg-[linear-gradient(90deg,#167be7,#075ba5)] pr-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(22,123,231,0.22)]"
          style={{ width }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
