"use server";

import { revalidatePath } from "next/cache";

import {
  createManagedUserSchema,
  updateManagedUserSchema,
  type CreateManagedUserInput,
  type UpdateManagedUserInput,
} from "@/monitoramento/features/users/schema";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";
import { hasPermission } from "@/monitoramento/lib/permissions/permissions";
import { createSupabaseAdminClient } from "@/monitoramento/lib/supabase/admin";
import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";

export type UserManagementResult = {
  ok: boolean;
  message: string;
};

export async function createManagedUserAction(
  input: CreateManagedUserInput,
): Promise<UserManagementResult> {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "users.manage")) {
    return {
      ok: false,
      message: "Sua sessão não tem permissão para criar usuários.",
    };
  }

  const parsed = createManagedUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Confira nome, e-mail, senha temporária e papéis selecionados.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!supabase || !admin) {
    return {
      ok: false,
      message:
        "Ambiente administrativo indisponível. Confira a chave segura do servidor.",
    };
  }

  const validRoles = await loadValidRoles(parsed.data.roleIds);

  if (!validRoles.ok) {
    return validRoles;
  }

  const existingProfile = await supabase
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existingProfile.data?.id) {
    return {
      ok: false,
      message: "Já existe um usuário cadastrado com este e-mail.",
    };
  }

  const displayName =
    parsed.data.displayName?.trim() || firstName(parsed.data.fullName);

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: parsed.data.email,
      email_confirm: true,
      password: parsed.data.password,
      user_metadata: {
        display_name: displayName,
        full_name: parsed.data.fullName,
      },
    });

  if (authError || !authData.user) {
    return {
      ok: false,
      message: friendlyAuthError(authError?.message),
    };
  }

  const userId = authData.user.id;
  const profileResult = await supabase.from("profiles").upsert(
    {
      active: parsed.data.active,
      display_name: displayName,
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      id: userId,
    },
    { onConflict: "id" },
  );

  if (profileResult.error) {
    await admin.auth.admin.deleteUser(userId);
    return {
      ok: false,
      message: "A conta foi criada, mas o perfil não pôde ser vinculado.",
    };
  }

  const roleResult = await assignUserRoles(
    userId,
    parsed.data.roleIds,
    context.user?.id ?? null,
  );

  if (!roleResult.ok) {
    await supabase.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
    return roleResult;
  }

  revalidateUsers();

  return {
    ok: true,
    message: `Usuário ${displayName} criado com acesso configurado.`,
  };
}

export async function updateManagedUserAction(
  input: UpdateManagedUserInput,
): Promise<UserManagementResult> {
  const context = await requireActiveSession();

  if (!hasPermission(context.permissions, "users.manage")) {
    return {
      ok: false,
      message: "Sua sessão não tem permissão para alterar usuários.",
    };
  }

  const parsed = updateManagedUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Confira nome, status e papéis selecionados.",
    };
  }

  if (parsed.data.userId === context.user?.id) {
    return {
      ok: false,
      message:
        "Para segurança, altere sua própria conta por outro administrador.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Ambiente de dados indisponível." };
  }

  const validRoles = await loadValidRoles(parsed.data.roleIds);

  if (!validRoles.ok) {
    return validRoles;
  }

  const displayName =
    parsed.data.displayName?.trim() || firstName(parsed.data.fullName);

  const profileResult = await supabase
    .from("profiles")
    .update({
      active: parsed.data.active,
      display_name: displayName,
      full_name: parsed.data.fullName,
    })
    .eq("id", parsed.data.userId);

  if (profileResult.error) {
    return { ok: false, message: "Não foi possível atualizar o perfil." };
  }

  const roleResult = await assignUserRoles(
    parsed.data.userId,
    parsed.data.roleIds,
    context.user?.id ?? null,
  );

  if (!roleResult.ok) {
    return roleResult;
  }

  revalidateUsers();

  return { ok: true, message: "Acesso atualizado com sucesso." };
}

async function loadValidRoles(
  roleIds: string[],
): Promise<UserManagementResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Ambiente de dados indisponível." };
  }

  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .eq("active", true)
    .in("id", roleIds);

  if (error || (data?.length ?? 0) !== new Set(roleIds).size) {
    return {
      ok: false,
      message: "Um dos papéis selecionados não está disponível.",
    };
  }

  return { ok: true, message: "Papéis validados." };
}

async function assignUserRoles(
  userId: string,
  roleIds: string[],
  assignedBy: string | null,
): Promise<UserManagementResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Ambiente de dados indisponível." };
  }

  const deleteResult = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  if (deleteResult.error) {
    return { ok: false, message: "Não foi possível limpar papéis antigos." };
  }

  const insertResult = await supabase.from("user_roles").insert(
    roleIds.map((roleId) => ({
      assigned_by: assignedBy,
      role_id: roleId,
      user_id: userId,
    })),
  );

  if (insertResult.error) {
    return { ok: false, message: "Não foi possível vincular os papéis." };
  }

  return { ok: true, message: "Papéis vinculados." };
}

function friendlyAuthError(message?: string): string {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("already") || normalized.includes("registered")) {
    return "Este e-mail já existe na autenticação.";
  }

  if (normalized.includes("password")) {
    return "A senha temporária não atende aos critérios mínimos.";
  }

  return "Não foi possível criar a conta de autenticação.";
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}

function revalidateUsers(): void {
  revalidatePath("/monitoramento/usuarios");
  revalidatePath("/monitoramento/permissoes");
  revalidatePath("/monitoramento/inicio");
}
