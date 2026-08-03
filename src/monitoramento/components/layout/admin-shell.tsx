import type { Route } from "next";
import type { ReactNode } from "react";

import {
  AdminShellClient,
  type AdminNavSection,
} from "@/monitoramento/components/layout/admin-shell-client";
import { signOutAction } from "@/monitoramento/features/auth/actions";
import type { SessionContext } from "@/monitoramento/lib/auth/session";
import { getPublicEnvStatus } from "@/monitoramento/lib/env";
import {
  type PermissionCode,
  hasAnyPermission,
} from "@/monitoramento/lib/permissions/permissions";

type ServerNavItem = {
  href: Route;
  icon: AdminNavSection["items"][number]["icon"];
  label: string;
  permissions: PermissionCode[];
};

type ServerNavSection = {
  items: ServerNavItem[];
  label: string;
};

const navSections: ServerNavSection[] = [
  {
    label: "Visão geral",
    items: [
      {
        href: "/monitoramento/inicio",
        icon: "home",
        label: "Início",
        permissions: ["dashboard.view"],
      },
      {
        href: "/monitoramento/executivo" as Route,
        icon: "executive",
        label: "Executivo",
        permissions: ["dashboard.executive.view"],
      },
    ],
  },
  {
    label: "Monitoramento",
    items: [
      {
        href: "/monitoramento/competencias",
        icon: "competencies",
        label: "Competências",
        permissions: ["competencies.view"],
      },
      {
        href: "/monitoramento/operacional",
        icon: "operational",
        label: "Operacional",
        permissions: ["competencies.view"],
      },
      {
        href: "/monitoramento/formularios" as Route,
        icon: "forms",
        label: "Formulários",
        permissions: ["indicators.view"],
      },
      {
        href: "/monitoramento/indicadores",
        icon: "indicators",
        label: "Indicadores",
        permissions: ["indicators.view"],
      },
      {
        href: "/monitoramento/grupos",
        icon: "groups",
        label: "Grupos",
        permissions: ["indicators.view"],
      },
      {
        href: "/monitoramento/unidades",
        icon: "units",
        label: "Unidades",
        permissions: ["units.view"],
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        href: "/monitoramento/usuarios",
        icon: "users",
        label: "Usuários",
        permissions: ["users.view"],
      },
      {
        href: "/monitoramento/permissoes",
        icon: "permissions",
        label: "Permissões",
        permissions: ["users.view"],
      },
      {
        href: "/monitoramento/auditoria",
        icon: "audit",
        label: "Auditoria",
        permissions: ["audit.view"],
      },
    ],
  },
  {
    label: "Suporte",
    items: [
      {
        href: "/monitoramento/diagnostico",
        icon: "diagnostics",
        label: "Diagnóstico",
        permissions: ["dashboard.view"],
      },
      {
        href: "/monitoramento/ajuda" as Route,
        icon: "help",
        label: "Ajuda",
        permissions: ["dashboard.view"],
      },
      {
        href: "/monitoramento/sobre",
        icon: "about",
        label: "Sobre",
        permissions: ["dashboard.view"],
      },
    ],
  },
];

export function AdminShell({
  children,
  context,
}: {
  children: ReactNode;
  context: SessionContext;
}) {
  const env = getPublicEnvStatus();
  const runtimeLabel = environmentLabel(process.env.NODE_ENV);
  const visibleSections = navSections
    .map((section) => ({
      label: section.label,
      items: section.items
        .filter((item) =>
          hasAnyPermission(context.permissions, item.permissions),
        )
        .map(({ href, icon, label }) => ({ href, icon, label })),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <AdminShellClient
      appName={env.appName}
      appVersion={process.env.NEXT_PUBLIC_APP_VERSION ?? "0.2.0"}
      environmentLabel={runtimeLabel}
      sections={visibleSections}
      signOutAction={signOutAction}
      user={{
        displayName:
          context.profile?.display_name ??
          context.profile?.full_name ??
          context.user?.email ??
          "Usuário",
        email: context.user?.email ?? context.profile?.email ?? null,
        roles: context.roles.map((role) => role.name),
      }}
    >
      {children}
    </AdminShellClient>
  );
}

function environmentLabel(value: string | undefined): string | null {
  if (!value || value === "production") {
    return null;
  }

  if (value === "development") {
    return "Desenvolvimento";
  }

  if (value === "test") {
    return "Teste";
  }

  return value;
}
