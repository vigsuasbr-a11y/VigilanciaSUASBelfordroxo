import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import type { Permission, Profile, Role } from "@/monitoramento/types/domain";

export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export type ProfileWithRoles = Profile & {
  roles: Array<Pick<Role, "id" | "code" | "name" | "description" | "active">>;
};

export type UsersPermissionsSnapshot = {
  profiles: ProfileWithRoles[];
  roles: RoleWithPermissions[];
  permissions: Permission[];
};

export async function getUsersPermissionsSnapshot(): Promise<UsersPermissionsSnapshot> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { profiles: [], roles: [], permissions: [] };
  }

  const [
    profilesResult,
    rolesResult,
    permissionsResult,
    userRolesResult,
    rolePermissionsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, email, display_name, active, avatar_url, last_login_at, created_at, updated_at",
      )
      .order("display_name", { ascending: true }),
    supabase
      .from("roles")
      .select("id, code, name, description, active, created_at, updated_at")
      .order("code"),
    supabase
      .from("permissions")
      .select("id, code, name, description, module, created_at")
      .order("module")
      .order("code"),
    supabase.from("user_roles").select("user_id, role_id"),
    supabase
      .from("role_permissions")
      .select(
        "role_id, permissions(id, code, name, description, module, created_at)",
      ),
  ]);

  if (
    profilesResult.error ||
    rolesResult.error ||
    permissionsResult.error ||
    userRolesResult.error ||
    rolePermissionsResult.error
  ) {
    throw new Error("Não foi possível carregar usuários e permissões.");
  }

  const roles = (rolesResult.data ?? []) as Role[];
  const permissions = (permissionsResult.data ?? []) as Permission[];
  const rolesById = new Map(roles.map((role) => [role.id, role]));
  const userRolesByUserId = new Map<
    string,
    Array<Pick<Role, "id" | "code" | "name" | "description" | "active">>
  >();
  const permissionsByRoleId = new Map<string, Permission[]>();

  for (const relation of (userRolesResult.data ?? []) as Array<{
    user_id: string;
    role_id: string;
  }>) {
    const role = rolesById.get(relation.role_id);

    if (!role) {
      continue;
    }

    const current = userRolesByUserId.get(relation.user_id) ?? [];
    current.push({
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      active: role.active,
    });
    userRolesByUserId.set(relation.user_id, current);
  }

  for (const relation of (rolePermissionsResult.data ?? []) as Array<{
    role_id: string;
    permissions: Permission | Permission[] | null;
  }>) {
    const permission = normalizeSingle(relation.permissions);

    if (!permission) {
      continue;
    }

    const current = permissionsByRoleId.get(relation.role_id) ?? [];
    current.push(permission);
    permissionsByRoleId.set(relation.role_id, current);
  }

  return {
    profiles: ((profilesResult.data ?? []) as Profile[]).map((profile) => ({
      ...profile,
      roles: (userRolesByUserId.get(profile.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      ),
    })),
    roles: roles.map((role) => ({
      ...role,
      permissions: (permissionsByRoleId.get(role.id) ?? []).sort((a, b) =>
        a.code.localeCompare(b.code, "pt-BR"),
      ),
    })),
    permissions,
  };
}

function normalizeSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
