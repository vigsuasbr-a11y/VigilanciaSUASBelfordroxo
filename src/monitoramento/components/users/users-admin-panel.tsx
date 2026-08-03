"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AppIcon } from "@/monitoramento/components/ui/app-icon";
import { Button } from "@/monitoramento/components/ui/button";
import { dataTableCellClass } from "@/monitoramento/components/ui/data-table";
import { EmptyState } from "@/monitoramento/components/ui/empty-state";
import { MetricCard } from "@/monitoramento/components/ui/metric-card";
import { SectionCard } from "@/monitoramento/components/ui/section-card";
import { StatusBadge } from "@/monitoramento/components/ui/status-badge";
import {
  createManagedUserAction,
  updateManagedUserAction,
} from "@/monitoramento/features/users/actions";
import { formatDateTime } from "@/monitoramento/lib/format";
import type { ProfileWithRoles, RoleWithPermissions } from "@/monitoramento/services/users";
import type { Permission } from "@/monitoramento/types/domain";

type UsersAdminPanelProps = {
  canManage: boolean;
  currentUserId: string | null;
  permissions: Permission[];
  profiles: ProfileWithRoles[];
  roles: RoleWithPermissions[];
};

type CreateFormState = {
  active: boolean;
  displayName: string;
  email: string;
  fullName: string;
  password: string;
  roleIds: string[];
};

const fieldClass =
  "mt-1 h-11 w-full rounded-[12px] border border-blue-100 bg-white/95 px-3 text-sm font-medium text-slate-900 shadow-sm transition hover:border-blue-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const roleToneByCode = {
  administrator: "danger",
  consulta: "neutral",
  secretario: "warning",
  vigilancia: "info",
} as const;

export function UsersAdminPanel({
  canManage,
  currentUserId,
  permissions,
  profiles,
  roles,
}: UsersAdminPanelProps) {
  const router = useRouter();
  const defaultRoleId =
    roles.find((role) => role.code === "consulta")?.id ?? roles[0]?.id ?? "";
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [createForm, setCreateForm] = useState<CreateFormState>({
    active: true,
    displayName: "",
    email: "",
    fullName: "",
    password: "",
    roleIds: defaultRoleId ? [defaultRoleId] : [],
  });

  const activeProfiles = profiles.filter((profile) => profile.active);
  const administratorCount = profiles.filter((profile) =>
    profile.roles.some((role) => role.code === "administrator"),
  ).length;
  const withoutRoleCount = profiles.filter(
    (profile) => profile.roles.length === 0,
  ).length;

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return profiles.filter((profile) => {
      const matchesQuery =
        !normalizedQuery ||
        normalizeSearch(
          [
            profile.full_name,
            profile.display_name,
            profile.email,
            profile.roles.map((role) => role.name).join(" "),
          ].join(" "),
        ).includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && profile.active) ||
        (statusFilter === "inactive" && !profile.active);
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "without_role" && profile.roles.length === 0) ||
        profile.roles.some((role) => role.id === roleFilter);

      return matchesQuery && matchesStatus && matchesRole;
    });
  }, [profiles, query, roleFilter, statusFilter]);

  function toggleCreateRole(roleId: string) {
    setCreateForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((id) => id !== roleId)
        : [...current.roleIds, roleId],
    }));
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startCreateTransition(async () => {
      const result = await createManagedUserAction(createForm);

      if (result.ok) {
        toast.success("Usuário criado", { description: result.message });
        setCreateForm({
          active: true,
          displayName: "",
          email: "",
          fullName: "",
          password: "",
          roleIds: defaultRoleId ? [defaultRoleId] : [],
        });
        router.refresh();
      } else {
        toast.error("Não foi possível criar", { description: result.message });
      }
    });
  }

  function handleUpdate(
    event: FormEvent<HTMLFormElement>,
    profile: ProfileWithRoles,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const roleIds = formData.getAll("roleIds").map(String);

    setPendingUserId(profile.id);
    startUpdateTransition(async () => {
      const result = await updateManagedUserAction({
        active: formData.get("active") === "on",
        displayName: String(formData.get("displayName") ?? ""),
        fullName: String(formData.get("fullName") ?? ""),
        roleIds,
        userId: profile.id,
      });

      setPendingUserId(null);

      if (result.ok) {
        toast.success("Acesso atualizado", { description: result.message });
        router.refresh();
      } else {
        toast.error("Não foi possível atualizar", {
          description: result.message,
        });
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-blue-200/35 bg-[radial-gradient(circle_at_78%_20%,rgba(137,189,247,0.38),transparent_18rem),linear-gradient(135deg,#0b6dcf_0%,#004f9e_48%,#05254d_100%)] p-5 text-white shadow-[var(--shadow-panel)] lg:p-6">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[repeating-linear-gradient(105deg,rgba(255,255,255,0.12)_0_1px,transparent_1px_24px)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.55fr)] lg:items-end">
          <div>
            <StatusBadge
              className="border-white/20 bg-white text-blue-800"
              icon="security"
              tone="info"
            >
              Painel administrativo
            </StatusBadge>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl">
              Controle quem entra, o que pode ver e quais ações pode executar.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/82 sm:text-base">
              Crie contas institucionais, defina papéis de acesso e acompanhe
              perfis ativos com clareza operacional.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <HeroCounter label="Usuários" value={profiles.length} />
            <HeroCounter label="Ativos" value={activeProfiles.length} />
            <HeroCounter label="Administradores" value={administratorCount} />
            <HeroCounter label="Sem papel" value={withoutRoleCount} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="Contas autorizadas no sistema"
          icon="users"
          label="Total de usuários"
          tone="info"
          value={profiles.length}
        />
        <MetricCard
          description="Podem acessar quando possuem papel"
          icon="success"
          label="Perfis ativos"
          tone="success"
          value={activeProfiles.length}
        />
        <MetricCard
          description="Papéis liberados para vinculação"
          icon="permissions"
          label="Papéis ativos"
          tone="neutral"
          value={roles.filter((role) => role.active).length}
        />
        <MetricCard
          description="Chaves granulares aplicadas por papel"
          icon="security"
          label="Permissões"
          tone="warning"
          value={permissions.length}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(360px,0.42fr)_minmax(0,1fr)]">
        <SectionCard
          description="Use senha temporária e oriente o usuário a alterá-la no primeiro acesso administrativo."
          icon="users"
          title="Criar novo usuário"
        >
          {canManage ? (
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Nome completo
                  <input
                    className={fieldClass}
                    maxLength={180}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    required
                    value={createForm.fullName}
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-800">
                  Nome de exibição
                  <input
                    className={fieldClass}
                    maxLength={120}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        displayName: event.target.value,
                      }))
                    }
                    placeholder="Opcional"
                    value={createForm.displayName}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-800">
                E-mail institucional
                <input
                  className={fieldClass}
                  maxLength={254}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                  type="email"
                  value={createForm.email}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Senha temporária
                <div className="mt-1 flex gap-2">
                  <input
                    className={fieldClass.replace("mt-1 ", "")}
                    minLength={8}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    required
                    type="text"
                    value={createForm.password}
                  />
                  <Button
                    className="shrink-0"
                    onClick={() =>
                      setCreateForm((current) => ({
                        ...current,
                        password: generateTemporaryPassword(),
                      }))
                    }
                    type="button"
                    variant="secondary"
                  >
                    <AppIcon name="refresh" size="sm" />
                    Gerar
                  </Button>
                </div>
              </label>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Papéis de acesso
                </p>
                <div className="mt-2 grid gap-2">
                  {roles.map((role) => (
                    <label
                      className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-blue-100 bg-white/92 p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/55"
                      key={role.id}
                    >
                      <input
                        checked={createForm.roleIds.includes(role.id)}
                        className="mt-1 h-4 w-4 accent-primary"
                        disabled={!role.active}
                        onChange={() => toggleCreateRole(role.id)}
                        type="checkbox"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-blue-950">
                          {role.name}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                          {role.permissions.length} permissões liberadas
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-[14px] border border-blue-100 bg-blue-50/45 px-3 py-2.5 text-sm font-semibold text-slate-800">
                <input
                  checked={createForm.active}
                  className="h-4 w-4 accent-primary"
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Criar usuário ativo
              </label>

              <Button
                className="w-full"
                disabled={isCreating || createForm.roleIds.length === 0}
                type="submit"
              >
                <AppIcon name="users" size="sm" />
                {isCreating ? "Criando usuário..." : "Criar usuário"}
              </Button>
            </form>
          ) : (
            <EmptyState
              description="Sua conta pode consultar usuários, mas não possui permissão para criar ou editar acessos."
              icon="lock"
              title="Gerenciamento bloqueado"
            />
          )}
        </SectionCard>

        <section className="grid gap-3 md:grid-cols-2">
          {roles.map((role) => (
            <article
              className="interactive-card surface-card rounded-[var(--radius-xl)] p-4"
              key={role.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <StatusBadge
                    icon={role.active ? "success" : "pending"}
                    tone={role.active ? roleTone(role.code) : "neutral"}
                  >
                    {role.active ? "Ativo" : "Inativo"}
                  </StatusBadge>
                  <h3 className="mt-3 text-lg font-semibold text-blue-950">
                    {role.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {role.description}
                  </p>
                </div>
                <span className="icon-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-blue-800">
                  <AppIcon name="permissions" size="md" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.permissions.slice(0, 5).map((permission) => (
                  <span
                    className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-900"
                    key={permission.id}
                    title={permission.name}
                  >
                    {moduleLabel(permission.module)}
                  </span>
                ))}
                {role.permissions.length > 5 ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                    +{role.permissions.length - 5}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </section>

      <SectionCard
        actions={
          <Button
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setRoleFilter("all");
            }}
            type="button"
            variant="secondary"
          >
            <AppIcon name="refresh" size="sm" />
            Limpar filtros
          </Button>
        }
        description="Pesquise por nome, e-mail ou papel e ajuste acessos quando necessário."
        icon="filter"
        title="Usuários cadastrados"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_220px]">
          <label className="block text-sm font-semibold text-slate-800">
            Buscar
            <div className="relative">
              <AppIcon
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                name="search"
                size="sm"
              />
              <input
                className={`${fieldClass} pl-9`}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nome, e-mail ou papel"
                value={query}
              />
            </div>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Status
            <select
              className={fieldClass}
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Papel
            <select
              className={fieldClass}
              onChange={(event) => setRoleFilter(event.target.value)}
              value={roleFilter}
            >
              <option value="all">Todos</option>
              <option value="without_role">Sem papel</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-blue-100 bg-white/82">
          <div className="monitoramento-table-scroll">
            <table className="w-full min-w-[980px] text-left text-sm">
              <tbody>
                {filteredProfiles.map((profile) => {
                  const isSelf = profile.id === currentUserId;
                  const rowPending = isUpdating && pendingUserId === profile.id;

                  return (
                    <tr
                      className="border-b border-blue-50 align-top transition duration-200 odd:bg-white/70 even:bg-slate-50/35 hover:bg-blue-50/60 last:border-b-0"
                      key={profile.id}
                    >
                      <td className={`${dataTableCellClass} w-[34%]`}>
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#2585ff,#075fdc)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,91,219,0.18)]">
                            {initials(
                              profile.display_name || profile.full_name,
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-blue-950">
                              {profile.display_name || profile.full_name}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {profile.full_name}
                            </p>
                            <p className="mt-1 truncate text-xs font-medium text-slate-500">
                              {profile.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`${dataTableCellClass} w-[22%]`}>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.roles.length > 0 ? (
                            profile.roles.map((role) => (
                              <StatusBadge
                                icon="permissions"
                                key={role.id}
                                tone={roleTone(role.code)}
                              >
                                {role.name}
                              </StatusBadge>
                            ))
                          ) : (
                            <StatusBadge icon="alert" tone="warning">
                              Sem papel
                            </StatusBadge>
                          )}
                        </div>
                      </td>
                      <td className={`${dataTableCellClass} w-[16%]`}>
                        <StatusBadge
                          icon={profile.active ? "success" : "error"}
                          tone={profile.active ? "success" : "danger"}
                        >
                          {profile.active ? "Ativo" : "Inativo"}
                        </StatusBadge>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Último acesso: {formatDateTime(profile.last_login_at)}
                        </p>
                      </td>
                      <td className={`${dataTableCellClass} w-[28%]`}>
                        {canManage ? (
                          <details className="group rounded-[14px] border border-blue-100 bg-white/86 shadow-sm">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-blue-900">
                              {isSelf ? "Conta atual" : "Editar acesso"}
                              <AppIcon
                                className="transition group-open:rotate-90"
                                name="open"
                                size="sm"
                              />
                            </summary>
                            <form
                              className="space-y-3 border-t border-blue-100 p-3"
                              onSubmit={(event) => handleUpdate(event, profile)}
                            >
                              <label className="block text-xs font-semibold text-slate-700">
                                Nome completo
                                <input
                                  className={fieldClass}
                                  defaultValue={profile.full_name}
                                  disabled={isSelf || rowPending}
                                  maxLength={180}
                                  name="fullName"
                                  required
                                />
                              </label>
                              <label className="block text-xs font-semibold text-slate-700">
                                Nome de exibição
                                <input
                                  className={fieldClass}
                                  defaultValue={profile.display_name}
                                  disabled={isSelf || rowPending}
                                  maxLength={120}
                                  name="displayName"
                                />
                              </label>
                              <div className="grid gap-2">
                                {roles.map((role) => (
                                  <label
                                    className="flex items-center gap-2 text-xs font-medium text-slate-700"
                                    key={role.id}
                                  >
                                    <input
                                      className="h-4 w-4 accent-primary"
                                      defaultChecked={profile.roles.some(
                                        (profileRole) =>
                                          profileRole.id === role.id,
                                      )}
                                      disabled={
                                        !role.active || isSelf || rowPending
                                      }
                                      name="roleIds"
                                      type="checkbox"
                                      value={role.id}
                                    />
                                    {role.name}
                                  </label>
                                ))}
                              </div>
                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <input
                                  className="h-4 w-4 accent-primary"
                                  defaultChecked={profile.active}
                                  disabled={isSelf || rowPending}
                                  name="active"
                                  type="checkbox"
                                />
                                Perfil ativo
                              </label>
                              <Button
                                className="w-full"
                                disabled={isSelf || rowPending}
                                type="submit"
                                variant="secondary"
                              >
                                <AppIcon name="success" size="sm" />
                                {rowPending ? "Salvando..." : "Salvar acesso"}
                              </Button>
                              {isSelf ? (
                                <p className="text-xs leading-5 text-muted-foreground">
                                  Por segurança, sua própria conta deve ser
                                  alterada por outro administrador.
                                </p>
                              ) : null}
                            </form>
                          </details>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Somente leitura.
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="border-t border-blue-100">
              <EmptyState
                description="Altere os filtros ou cadastre uma nova conta autorizada."
                icon="users"
                title="Nenhum usuário encontrado"
              />
            </div>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

function HeroCounter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-white/18 bg-white/14 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur">
      <p className="text-sm font-medium text-white/78">{label}</p>
      <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
    </div>
  );
}

function roleTone(code: string) {
  return roleToneByCode[code as keyof typeof roleToneByCode] ?? "info";
}

function moduleLabel(module: string) {
  const labels: Record<string, string> = {
    audit: "Auditoria",
    competencies: "Competências",
    dashboard: "Dashboard",
    indicators: "Indicadores",
    reports: "Relatórios",
    settings: "Configurações",
    units: "Unidades",
    users: "Usuários",
  };

  return labels[module] ?? module;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";

  return `${first}${second}`.toUpperCase();
}

function generateTemporaryPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const random = Array.from({ length: 8 }, () =>
    alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
  ).join("");

  return `Temp@${new Date().getFullYear()}-${random}!`;
}
