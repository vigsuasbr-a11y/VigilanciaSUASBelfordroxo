"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json, UserRole } from "@/types/database.types";

type FuncionarioInsert = Database["public"]["Tables"]["funcionarios"]["Insert"];
type FuncionarioUpdate = Database["public"]["Tables"]["funcionarios"]["Update"];
type UnidadeInsert = Database["public"]["Tables"]["unidades"]["Insert"];
type UnidadeUpdate = Database["public"]["Tables"]["unidades"]["Update"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type FuncionarioPayload = FuncionarioUpdate & {
  nome: string;
  status: string;
};
type UnidadePayload = UnidadeUpdate & {
  nome: string;
  tipo: string;
};
type UserAuditAction =
  | "user_created"
  | "user_updated"
  | "user_role_changed"
  | "user_deactivated"
  | "user_reactivated"
  | "password_updated";

const allowedRoles = new Set<UserRole>([
  "administrador",
  "operador",
  "consulta",
]);

export async function createUserAction(formData: FormData) {
  const { user, profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const admin = createSupabaseAdminClient();

  if (profile.role !== "administrador") {
    redirectUsersNotice("acesso-restrito");
  }

  if (!admin) {
    redirectUsersNotice("config-admin-ausente");
  }

  const fullName = readString(formData, "full_name");
  const email = normalizeEmail(readString(formData, "email"));
  const password = readString(formData, "password");
  const passwordConfirmation = readString(formData, "password_confirmation");
  const role = readUserRole(formData);
  const isActive = readUserActive(formData);

  if (!fullName) redirectUsersNotice("usuario-nome-obrigatorio");
  if (!isValidEmail(email)) redirectUsersNotice("usuario-email-invalido");
  if (!role) redirectUsersNotice("usuario-perfil-obrigatorio");
  if (password.length < 6) redirectUsersNotice("usuario-senha-fraca");
  if (password !== passwordConfirmation) {
    redirectUsersNotice("usuario-senhas-diferentes");
  }

  const existingProfile = await findProfileByEmail(supabase, email);
  if (existingProfile) {
    redirectUsersNotice("usuario-email-existente");
  }

  const { data: authResult, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  const createdUser = authResult.user;

  if (authError || !createdUser) {
    redirectUsersNotice(
      isDuplicateAuthError(authError?.message)
        ? "usuario-email-existente"
        : "erro-criar-usuario",
    );
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: createdUser.id,
    full_name: fullName,
    email,
    role,
    is_active: isActive,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(createdUser.id);
    redirectUsersNotice(
      isDuplicateDatabaseError(profileError.code)
        ? "usuario-email-existente"
        : "erro-criar-usuario",
    );
  }

  await writeUserAudit("user_created", user.id, createdUser.id, null, {
    role,
    is_active: isActive,
  });

  revalidatePath("/funcionarios");
  redirectUsersNotice("usuario-criado");
}

export async function updateUserAction(formData: FormData) {
  const { user, profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const id = readString(formData, "id");
  const fullName = readString(formData, "full_name");
  const email = normalizeEmail(readString(formData, "email"));
  const role = readUserRole(formData);
  const isActive = readUserActive(formData);

  if (profile.role !== "administrador") {
    redirectUsersNotice("acesso-restrito");
  }

  if (!id) redirectUsersNotice("usuario-nao-encontrado");
  if (!fullName) redirectUsersNotice("usuario-nome-obrigatorio");
  if (!isValidEmail(email)) redirectUsersNotice("usuario-email-invalido");
  if (!role) redirectUsersNotice("usuario-perfil-obrigatorio");

  const current = await getProfileById(supabase, id);
  if (!current) redirectUsersNotice("usuario-nao-encontrado");

  await ensureAdminAccessContinuity(supabase, current, role, isActive);
  ensureSelfAccessConfirmed(formData, user.id, current, role, isActive);

  const emailChanged = normalizeEmail(current.email) !== email;
  let admin = null;

  if (emailChanged) {
    admin = createSupabaseAdminClient();
    if (!admin) redirectUsersNotice("config-admin-ausente");

    const existingProfile = await findProfileByEmail(supabase, email);
    if (existingProfile && existingProfile.id !== id) {
      redirectUsersNotice("usuario-email-existente");
    }

    const { error: authError } = await admin.auth.admin.updateUserById(id, {
      email,
      email_confirm: true,
    });

    if (authError) {
      redirectUsersNotice(
        isDuplicateAuthError(authError.message)
          ? "usuario-email-existente"
          : "erro-atualizar-usuario",
      );
    }
  }

  const updateData: ProfileUpdate = {
    full_name: fullName,
    email,
    role,
    is_active: isActive,
  };

  const { error } = await supabase.from("profiles").update(updateData).eq("id", id);

  if (error) {
    if (emailChanged && admin) {
      await admin.auth.admin.updateUserById(id, { email: current.email });
    }
    redirectUsersNotice(
      isDuplicateDatabaseError(error.code)
        ? "usuario-email-existente"
        : "erro-atualizar-usuario",
    );
  }

  await writeUserAudit(resolveUserUpdateAuditAction(current, role, isActive), user.id, id, current, {
    role,
    is_active: isActive,
  });

  revalidatePath("/funcionarios");
  redirectUsersNotice(resolveUserUpdateNotice(current, role, isActive));
}

export async function changeUserRoleAction(formData: FormData) {
  const { user, profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const id = readString(formData, "id");
  const role = readUserRole(formData);

  if (profile.role !== "administrador") {
    redirectUsersNotice("acesso-restrito");
  }

  if (!id) redirectUsersNotice("usuario-nao-encontrado");
  if (!role) redirectUsersNotice("usuario-perfil-obrigatorio");

  const current = await getProfileById(supabase, id);
  if (!current) redirectUsersNotice("usuario-nao-encontrado");

  await ensureAdminAccessContinuity(supabase, current, role, current.is_active);
  ensureSelfAccessConfirmed(formData, user.id, current, role, current.is_active);

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id);

  if (error) redirectUsersNotice("erro-alterar-perfil");

  await writeUserAudit("user_role_changed", user.id, id, current, {
    role,
    is_active: current.is_active,
  });

  revalidatePath("/funcionarios");
  redirectUsersNotice("perfil-alterado");
}

export async function setUserActiveAction(formData: FormData) {
  const { user, profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const id = readString(formData, "id");
  const isActive = readUserActive(formData);

  if (profile.role !== "administrador") {
    redirectUsersNotice("acesso-restrito");
  }

  if (!id) redirectUsersNotice("usuario-nao-encontrado");

  const current = await getProfileById(supabase, id);
  if (!current) redirectUsersNotice("usuario-nao-encontrado");

  await ensureAdminAccessContinuity(supabase, current, current.role, isActive);
  ensureSelfAccessConfirmed(formData, user.id, current, current.role, isActive);

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    redirectUsersNotice(isActive ? "erro-reativar-usuario" : "erro-desativar-usuario");
  }

  await writeUserAudit(
    isActive ? "user_reactivated" : "user_deactivated",
    user.id,
    id,
    current,
    {
      role: current.role,
      is_active: isActive,
    },
  );

  revalidatePath("/funcionarios");
  redirectUsersNotice(isActive ? "usuario-reativado" : "usuario-desativado");
}

export async function updateUserPasswordAction(formData: FormData) {
  const { user, profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const admin = createSupabaseAdminClient();
  const id = readString(formData, "id");
  const password = readString(formData, "password");
  const passwordConfirmation = readString(formData, "password_confirmation");

  if (profile.role !== "administrador") {
    redirectUsersNotice("acesso-restrito");
  }

  if (!admin) {
    redirectUsersNotice("config-admin-ausente");
  }

  const target = id ? await getProfileById(supabase, id) : null;
  if (!target) redirectUsersNotice("usuario-nao-encontrado");
  if (password.length < 6) redirectUsersNotice("usuario-senha-fraca");
  if (password !== passwordConfirmation) {
    redirectUsersNotice("usuario-senhas-diferentes");
  }

  const { error } = await admin.auth.admin.updateUserById(target.id, {
    password,
  });

  if (error) redirectUsersNotice("erro-alterar-senha");

  await writeUserAudit(
    "password_updated",
    user.id,
    target.id,
    target,
    { role: target.role, is_active: target.is_active },
  );

  revalidatePath("/funcionarios");
  redirectUsersNotice("senha-atualizada");
}

export async function saveFuncionarioAction(formData: FormData) {
  const { user, profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const id = readString(formData, "id");
  const data = funcionarioPayload(formData, user.id);

  if (!data.nome) {
    redirect("/funcionarios?view=employees&notice=nome-obrigatorio");
  }

  if (id) {
    const { data: current, error: currentError } = await supabase
      .from("funcionarios")
      .select("id,status,legacy_id")
      .eq("id", id)
      .maybeSingle();

    if (currentError || !current) {
      redirect("/funcionarios?view=employees&notice=funcionario-nao-encontrado");
    }

    const { error } = await supabase
      .from("funcionarios")
      .update(data)
      .eq("id", id);

    if (error) {
      redirect("/funcionarios?view=employees&notice=erro-salvar-funcionario");
    }

    if (current.status !== data.status) {
      await supabase.from("historico_movimentacoes").insert({
        funcionario_id: id,
        funcionario_legacy_id: current.legacy_id,
        status_anterior: current.status,
        status_novo: data.status ?? "Ativo",
        data_movimentacao: new Date().toISOString(),
        observacao:
          readNullableString(formData, "historico_observacao") ??
          "Alteração de situação funcional no cadastro",
        performed_by: user.id,
        metadata: { source: "portal-web" },
      });
    }
  } else {
    const insertData: FuncionarioInsert = {
      ...data,
      created_by: user.id,
      updated_by: user.id,
      metadata: {
        source: "portal-web",
        created_by_role: profile.role,
      },
    };

    const { data: created, error } = await supabase
      .from("funcionarios")
      .insert(insertData)
      .select("id,status,legacy_id")
      .single();

    if (error || !created) {
      redirect("/funcionarios?view=employees&notice=erro-criar-funcionario");
    }

    await supabase.from("historico_movimentacoes").insert({
      funcionario_id: created.id,
      funcionario_legacy_id: created.legacy_id,
      status_anterior: null,
      status_novo: created.status,
      data_movimentacao: new Date().toISOString(),
      observacao: "Cadastro inicial",
      performed_by: user.id,
      metadata: { source: "portal-web" },
    });
  }

  revalidatePath("/funcionarios");
  redirect("/funcionarios?view=employees&notice=funcionario-salvo");
}

export async function softDeleteFuncionarioAction(formData: FormData) {
  const { user } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const id = readString(formData, "id");

  if (!id) {
    redirect("/funcionarios?view=employees&notice=funcionario-nao-encontrado");
  }

  const { error } = await supabase
    .from("funcionarios")
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: user.id,
      metadata: { source: "portal-web", deleted_by: user.id },
    })
    .eq("id", id);

  if (error) {
    redirect("/funcionarios?view=employees&notice=erro-excluir-funcionario");
  }

  revalidatePath("/funcionarios");
  redirect("/funcionarios?view=employees&notice=funcionario-excluido");
}

export async function saveUnidadeAction(formData: FormData) {
  const { user, profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const id = readString(formData, "id");
  const data = unidadePayload(formData, user.id);

  if (profile.role !== "administrador") {
    redirect("/funcionarios?view=units&notice=acesso-restrito");
  }

  if (!data.nome || !data.tipo) {
    redirect("/funcionarios?view=units&notice=unidade-obrigatoria");
  }

  const result = id
    ? await supabase.from("unidades").update(data).eq("id", id)
    : await supabase.from("unidades").insert({
        ...(data as UnidadeInsert),
        created_by: user.id,
        updated_by: user.id,
        metadata: { source: "portal-web" },
      });

  if (result.error) {
    redirect("/funcionarios?view=units&notice=erro-salvar-unidade");
  }

  revalidatePath("/funcionarios");
  redirect("/funcionarios?view=units&notice=unidade-salva");
}

export async function deleteUnidadeAction(formData: FormData) {
  const { profile } = await requireActiveProfile();
  const supabase = await requireSupabase();
  const id = readString(formData, "id");

  if (profile.role !== "administrador") {
    redirect("/funcionarios?view=units&notice=acesso-restrito");
  }

  if (!id) {
    redirect("/funcionarios?view=units&notice=unidade-nao-encontrada");
  }

  const { count } = await supabase
    .from("funcionarios")
    .select("id", { count: "exact", head: true })
    .eq("unidade_id", id)
    .is("deleted_at", null);

  if ((count ?? 0) > 0) {
    redirect("/funcionarios?view=units&notice=unidade-em-uso");
  }

  const { error } = await supabase.from("unidades").delete().eq("id", id);

  if (error) {
    redirect("/funcionarios?view=units&notice=erro-excluir-unidade");
  }

  revalidatePath("/funcionarios");
  redirect("/funcionarios?view=units&notice=unidade-excluida");
}

async function requireSupabase() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/funcionarios");
  }
  return supabase;
}

async function requireActiveProfile() {
  const { user, profile, isSupabaseReady } = await getCurrentUser();

  if (!isSupabaseReady || !user) {
    redirect("/login?redirectTo=/funcionarios");
  }

  if (!profile?.is_active) {
    redirect("/acesso-negado?from=/funcionarios");
  }

  return { user, profile };
}

async function getProfileById(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  id: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data;
}

async function findProfileByEmail(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  email: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  return data;
}

async function ensureAdminAccessContinuity(
  supabase: Awaited<ReturnType<typeof requireSupabase>>,
  current: ProfileRow,
  nextRole: UserRole,
  nextActive: boolean,
) {
  const removesActiveAdmin =
    current.role === "administrador" &&
    current.is_active &&
    (nextRole !== "administrador" || !nextActive);

  if (!removesActiveAdmin) {
    return;
  }

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "administrador")
    .eq("is_active", true);

  if ((count ?? 0) <= 1) {
    redirectUsersNotice("ultimo-admin");
  }
}

function ensureSelfAccessConfirmed(
  formData: FormData,
  actorId: string,
  current: ProfileRow,
  nextRole: UserRole,
  nextActive: boolean,
) {
  const changesOwnSensitiveAccess =
    current.id === actorId &&
    current.is_active &&
    (!nextActive ||
      (current.role === "administrador" && nextRole !== "administrador"));

  if (
    changesOwnSensitiveAccess &&
    readString(formData, "confirm_self_change") !== "true"
  ) {
    redirectUsersNotice("autoalteracao-confirmacao");
  }
}

async function writeUserAudit(
  action: UserAuditAction,
  actorId: string,
  targetId: string,
  oldProfile: Pick<ProfileRow, "role" | "is_active"> | null,
  newProfile: Pick<ProfileRow, "role" | "is_active"> | null,
) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return;
  }

  await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: "profile",
    entity_id: targetId,
    old_values: oldProfile ? profileAuditSnapshot(oldProfile) : null,
    new_values: newProfile ? profileAuditSnapshot(newProfile) : null,
    metadata: { source: "portal-web" } as Json,
  });
}

function profileAuditSnapshot(profile: Pick<ProfileRow, "role" | "is_active">) {
  return {
    role: profile.role,
    is_active: profile.is_active,
  } as Json;
}

function resolveUserUpdateAuditAction(
  current: ProfileRow,
  nextRole: UserRole,
  nextActive: boolean,
): UserAuditAction {
  if (current.role !== nextRole) return "user_role_changed";
  if (current.is_active && !nextActive) return "user_deactivated";
  if (!current.is_active && nextActive) return "user_reactivated";
  return "user_updated";
}

function resolveUserUpdateNotice(
  current: ProfileRow,
  nextRole: UserRole,
  nextActive: boolean,
) {
  if (current.role !== nextRole) return "perfil-alterado";
  if (current.is_active && !nextActive) return "usuario-desativado";
  if (!current.is_active && nextActive) return "usuario-reativado";
  return "usuario-atualizado";
}

function readUserRole(formData: FormData) {
  const role = readString(formData, "role") as UserRole;
  return allowedRoles.has(role) ? role : null;
}

function readUserActive(formData: FormData) {
  const value = readString(formData, "is_active").toLowerCase();
  return !["false", "0", "inativo", "inativa"].includes(value);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDuplicateAuthError(message = "") {
  return /already|exists|registered|duplicate/i.test(message);
}

function isDuplicateDatabaseError(code = "") {
  return code === "23505";
}

function redirectUsersNotice(code: string): never {
  redirect(`/funcionarios?view=users&notice=${code}`);
}

function funcionarioPayload(formData: FormData, userId: string): FuncionarioPayload {
  const cpf = readNullableString(formData, "cpf");
  const status = readNullableString(formData, "status") ?? "Ativo";

  return {
    nome: readString(formData, "nome"),
    cpf,
    cpf_normalized: normalizeCpf(cpf),
    nascimento: readNullableString(formData, "nascimento"),
    cargo: readNullableString(formData, "cargo"),
    setor: readNullableString(formData, "setor"),
    escolaridade: readNullableString(formData, "escolaridade"),
    unidade_id: readNullableString(formData, "unidade_id"),
    vinculo: readNullableString(formData, "vinculo"),
    carga_horaria: readNullableString(formData, "carga_horaria"),
    telefone: readNullableString(formData, "telefone"),
    email: readNullableString(formData, "email"),
    admissao: readNullableString(formData, "admissao"),
    data_exoneracao:
      status === "Exonerado"
        ? readNullableString(formData, "data_exoneracao")
        : null,
    status,
    observacoes: readNullableString(formData, "observacoes"),
    updated_by: userId,
  };
}

function unidadePayload(formData: FormData, userId: string): UnidadePayload {
  const status = readString(formData, "status");

  return {
    nome: readString(formData, "nome"),
    tipo: readString(formData, "tipo"),
    status: status === "inativa" ? "inativa" : "ativa",
    endereco: readNullableString(formData, "endereco"),
    coordenador: readNullableString(formData, "coordenador"),
    telefone: readNullableString(formData, "telefone"),
    updated_by: userId,
  };
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

function normalizeCpf(value: string | null) {
  const normalized = String(value ?? "").replace(/\D/g, "");
  return normalized || null;
}
