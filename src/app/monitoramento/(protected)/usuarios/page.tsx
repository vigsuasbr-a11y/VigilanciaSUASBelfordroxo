import { redirect } from "next/navigation";

import { UsersAdminPanel } from "@/monitoramento/components/users/users-admin-panel";
import { PageContainer } from "@/monitoramento/components/ui/page-container";
import { PageHeader } from "@/monitoramento/components/ui/page-header";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";
import { hasPermission } from "@/monitoramento/lib/permissions/permissions";
import { getUsersPermissionsSnapshot } from "@/monitoramento/services/users";

export default async function UsersPage() {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "users.view")) {
    redirect("/monitoramento/acesso-negado?motivo=sem-permissao");
  }

  const snapshot = await getUsersPermissionsSnapshot();
  const canManage = hasPermission(context.permissions, "users.manage");

  return (
    <PageContainer wide>
      <PageHeader
        description="Administre contas, papéis e status de acesso com segurança e rastreabilidade."
        eyebrow="Gestão"
        icon="users"
        title="Usuários e acessos"
      />

      <UsersAdminPanel
        canManage={canManage}
        currentUserId={context.user?.id ?? null}
        permissions={snapshot.permissions}
        profiles={snapshot.profiles}
        roles={snapshot.roles}
      />
    </PageContainer>
  );
}
