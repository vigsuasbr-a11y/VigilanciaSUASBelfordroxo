import { redirect } from "next/navigation";

import { getPublicEnvStatus } from "@/monitoramento/lib/env";
import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import type { Permission, Profile, Role } from "@/monitoramento/types/domain";

export type AuthUserSummary = {
  id: string;
  email: string | null;
};

type RoleWithPermissions = Pick<Role, "code" | "name"> & {
  role_permissions: Array<{
    permissions: Pick<Permission, "code"> | Pick<Permission, "code">[] | null;
  }> | null;
};

type RolePermissionRow = {
  roles: RoleWithPermissions | RoleWithPermissions[] | null;
};

export type SessionContext = {
  configured: boolean;
  user: AuthUserSummary | null;
  profile: Profile | null;
  roles: Array<Pick<Role, "code" | "name">>;
  permissions: string[];
};

export async function getSessionContext(): Promise<SessionContext> {
  const env = getPublicEnvStatus();

  if (!env.supabaseConfigured) {
    return {
      configured: false,
      user: null,
      profile: null,
      roles: [],
      permissions: [],
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      user: null,
      profile: null,
      roles: [],
      permissions: [],
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      configured: true,
      user: null,
      profile: null,
      roles: [],
      permissions: [],
    };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, display_name, active, avatar_url, last_login_at, created_at, updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  if (!profile?.active) {
    return {
      configured: true,
      user: { id: user.id, email: user.email ?? null },
      profile,
      roles: [],
      permissions: [],
    };
  }

  const { data: roleRowsData } = await supabase
    .from("user_roles")
    .select("roles(code, name, role_permissions(permissions(code)))")
    .eq("user_id", user.id);

  const roleRows = (roleRowsData ?? []) as unknown as RolePermissionRow[];
  const roles = roleRows
    .map((row) => normalizeSingle(row.roles))
    .filter((role): role is RoleWithPermissions => Boolean(role));
  const permissions = new Set<string>();

  for (const role of roleRows) {
    const normalizedRole = normalizeSingle(role.roles);

    for (const rolePermission of normalizedRole?.role_permissions ?? []) {
      const permission = normalizeSingle(rolePermission.permissions);

      if (permission?.code) {
        permissions.add(permission.code);
      }
    }
  }

  return {
    configured: true,
    user: { id: user.id, email: user.email ?? null },
    profile,
    roles: roles.map(({ code, name }) => ({ code, name })),
    permissions: [...permissions].sort(),
  };
}

function normalizeSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export async function requireActiveSession(): Promise<SessionContext> {
  const context = await getSessionContext();

  if (!context.configured) {
    redirect("/monitoramento/login?erro=ambiente-nao-configurado");
  }

  if (!context.user) {
    redirect("/monitoramento/login");
  }

  if (!context.profile?.active) {
    redirect("/monitoramento/acesso-negado?motivo=perfil-inativo");
  }

  if (context.roles.length === 0) {
    redirect("/monitoramento/acesso-negado?motivo=sem-papel");
  }

  return context;
}
