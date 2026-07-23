"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CircleCheck,
  CircleOff,
  Eye,
  FilterX,
  Info,
  Search,
  ShieldCheck,
  UserCog,
  UserRoundPlus,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { DocumentLink as Link } from "@/components/funcionarios/document-link";
import { UserActionsMenu } from "@/components/funcionarios/user-actions-menu";
import { roleLabels } from "@/lib/permissions/roles";
import type { ProfileListItem } from "@/services/funcionarios";
import type { UserRole } from "@/types/database.types";

type UsersClientViewProps = {
  profiles: ProfileListItem[];
  currentProfileId: string;
  canManageAccess: boolean;
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  administrador: "Acesso total",
  operador: "Cadastro e edição",
  consulta: "Somente consulta",
};

const ROLE_HELP: Record<UserRole, string> = {
  administrador:
    "Acesso total ao sistema, incluindo usuários, unidades, configurações e relatórios.",
  operador:
    "Pode cadastrar, editar e acompanhar funcionários e unidades, conforme as permissões definidas.",
  consulta:
    "Pode consultar informações e relatórios autorizados, sem realizar alterações.",
};

export function UsersClientView({
  profiles,
  currentProfileId,
  canManageAccess,
}: UsersClientViewProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) =>
      getProfileDisplayName(a).localeCompare(getProfileDisplayName(b), "pt-BR"),
    );
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    const query = normalizeForSearch(search);

    return sortedProfiles.filter((profile) => {
      if (roleFilter && profile.role !== roleFilter) return false;
      if (statusFilter === "ativo" && !profile.is_active) return false;
      if (statusFilter === "inativo" && profile.is_active) return false;
      if (!query) return true;

      return [profile.full_name, profile.email, roleLabels[profile.role]].some(
        (value) => normalizeForSearch(value).includes(query),
      );
    });
  }, [roleFilter, search, sortedProfiles, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredProfiles.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProfiles.length);
  const visibleProfiles = filteredProfiles.slice(startIndex, endIndex);
  const showLastAccess = profiles.some((profile) => profile.last_sign_in_at);
  const hasFilters = Boolean(search || roleFilter || statusFilter);
  const adminCount = profiles.filter((profile) => profile.role === "administrador").length;
  const activeAdminCount = profiles.filter(
    (profile) => profile.role === "administrador" && profile.is_active,
  ).length;
  const operatorCount = profiles.filter((profile) => profile.role === "operador").length;
  const viewerCount = profiles.filter((profile) => profile.role === "consulta").length;
  const inactiveCount = profiles.filter((profile) => !profile.is_active).length;

  function clearFilters() {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  }

  return (
    <div className="users-shell">
      <section className="users-metric-grid" aria-label="Indicadores de usuários">
        <UserMetricCard
          icon={<UsersRound size={23} aria-hidden="true" />}
          label="Total de usuários"
          value={profiles.length}
          note="Quantidade cadastrada"
          tone="blue"
        />
        <UserMetricCard
          icon={<ShieldCheck size={23} aria-hidden="true" />}
          label="Administradores"
          value={adminCount}
          note="Acesso total"
          tone="navy"
        />
        <UserMetricCard
          icon={<UserCog size={23} aria-hidden="true" />}
          label="Operadores"
          value={operatorCount}
          note="Cadastro e edição"
          tone="green"
        />
        <UserMetricCard
          icon={<Eye size={23} aria-hidden="true" />}
          label="Visualização"
          value={viewerCount}
          note="Somente consulta"
          tone="purple"
        />
        <UserMetricCard
          icon={<UserRoundX size={23} aria-hidden="true" />}
          label="Inativos"
          value={inactiveCount}
          note="Acessos desativados"
          tone="red"
        />
      </section>

      <section className="users-filter-panel" aria-labelledby="usersFilterTitle">
        <div className="users-filter-heading">
          <div>
            <h2 id="usersFilterTitle">Busca e filtros</h2>
            <p>Encontre usuários por nome, e-mail, perfil ou situação.</p>
          </div>
          {hasFilters ? (
            <button className="ghost-action users-clear-button" type="button" onClick={clearFilters}>
              <FilterX size={15} aria-hidden="true" />
              Limpar filtros
            </button>
          ) : null}
        </div>

        <div className="users-filter-grid">
          <label className="filter-search users-search-field">
            <span>Buscar usuário</span>
            <span className="filter-search-field">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Busque por nome, e-mail ou usuário"
              />
              <Search size={18} aria-hidden="true" />
            </span>
          </label>

          <label>
            <span>Perfil</span>
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos os perfis</option>
              <option value="administrador">Administrador</option>
              <option value="operador">Operador</option>
              <option value="consulta">Visualização</option>
            </select>
          </label>

          <label>
            <span>Situação</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos os usuários</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </label>
        </div>

        {hasFilters ? (
          <div className="active-filter-chips" aria-label="Filtros aplicados">
            {roleFilter ? (
              <button type="button" onClick={() => setRoleFilter("")}>
                Perfil: {roleLabels[roleFilter as UserRole]} ×
              </button>
            ) : null}
            {statusFilter ? (
              <button type="button" onClick={() => setStatusFilter("")}>
                Situação: {statusFilter === "ativo" ? "Ativo" : "Inativo"} ×
              </button>
            ) : null}
            {search ? (
              <button type="button" onClick={() => setSearch("")}>
                Busca: {search} ×
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="users-table-panel" aria-labelledby="usersListTitle">
        <div className="users-list-heading">
          <div>
            <p className="eyebrow">Gestão de acesso</p>
            <h2 id="usersListTitle">Usuários cadastrados</h2>
            <span>
              Mostrando {filteredProfiles.length} de {profiles.length} usuário
              {profiles.length === 1 ? "" : "s"}.
            </span>
          </div>
          <div className="users-list-actions">
            <span className="result-count">
              {filteredProfiles.length} registro
              {filteredProfiles.length === 1 ? "" : "s"}
            </span>
            <label className="users-page-size">
              <span>Itens por página</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </label>
            {canManageAccess ? (
              <Link className="primary-action users-inline-action" href="/funcionarios?view=users&modal=user">
                <UserRoundPlus size={16} aria-hidden="true" />
                Novo usuário
              </Link>
            ) : null}
          </div>
        </div>

        <div className="users-table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th scope="col">Usuário</th>
                <th scope="col">Perfil</th>
                <th scope="col">Situação</th>
                {showLastAccess ? <th scope="col">Último acesso</th> : null}
                <th scope="col">Criado em</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleProfiles.length ? (
                visibleProfiles.map((profile) => (
                  <UserTableRow
                    key={profile.id}
                    profile={profile}
                    currentProfileId={currentProfileId}
                    canManageAccess={canManageAccess}
                    showLastAccess={showLastAccess}
                    activeAdminCount={activeAdminCount}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={showLastAccess ? 6 : 5}>
                    <UsersEmptyState
                      hasFilters={hasFilters}
                      canManageAccess={canManageAccess}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="user-card-grid" aria-label="Usuários cadastrados em cartões">
          {visibleProfiles.length ? (
            visibleProfiles.map((profile) => (
              <UserCard
                key={profile.id}
                profile={profile}
                currentProfileId={currentProfileId}
                canManageAccess={canManageAccess}
                showLastAccess={showLastAccess}
                activeAdminCount={activeAdminCount}
              />
            ))
          ) : (
            <UsersEmptyState
              hasFilters={hasFilters}
              canManageAccess={canManageAccess}
            />
          )}
        </div>

        <div className="users-pagination">
          <span>
            {filteredProfiles.length
              ? `Mostrando ${startIndex + 1} a ${endIndex} de ${filteredProfiles.length}`
              : "Nenhum registro para exibir"}
          </span>
          <div className="pagination-pages">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              aria-label="Página anterior"
            >
              ‹
            </button>
            <button type="button" className="active" aria-current="page">
              {currentPage}
            </button>
            <span className="pagination-total">de {totalPages}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              aria-label="Próxima página"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <section className="access-profile-info" aria-labelledby="accessProfilesTitle">
        <div className="access-profile-heading">
          <div>
            <h2 id="accessProfilesTitle">Sobre os perfis de acesso</h2>
            <p>Resumo das permissões aplicadas atualmente no sistema.</p>
          </div>
          <span>
            <Info size={15} aria-hidden="true" />
            Regras fixas do sistema
          </span>
        </div>
        <div className="access-profile-grid">
          {(["administrador", "operador", "consulta"] as UserRole[]).map((role) => (
            <article key={role}>
              <UserRoleIcon role={role} />
              <strong>{roleLabels[role]}</strong>
              <span>{ROLE_HELP[role]}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="access-security-note">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <strong>Segurança de acesso</strong>
          <span>
            Alterações de perfil, ativações e desativações são registradas para
            fins de segurança e auditoria.
          </span>
        </div>
      </section>
    </div>
  );
}

function UserTableRow({
  profile,
  currentProfileId,
  canManageAccess,
  showLastAccess,
  activeAdminCount,
}: {
  profile: ProfileListItem;
  currentProfileId: string;
  canManageAccess: boolean;
  showLastAccess: boolean;
  activeAdminCount: number;
}) {
  return (
    <tr>
      <td>
        <UserIdentity profile={profile} currentProfileId={currentProfileId} />
      </td>
      <td>
        <UserRoleBadge role={profile.role} />
      </td>
      <td>
        <UserStatusBadge isActive={profile.is_active} />
      </td>
      {showLastAccess ? (
        <td>{formatLastAccess(profile.last_sign_in_at)}</td>
      ) : null}
      <td>{formatDate(profile.created_at)}</td>
      <td>
        <UserActionsMenu
          userId={profile.id}
          userName={getProfileDisplayName(profile)}
          isActive={profile.is_active}
          canManageAccess={canManageAccess}
          disableAccessToggle={isLastActiveAdmin(profile, activeAdminCount)}
        />
      </td>
    </tr>
  );
}

function UserCard({
  profile,
  currentProfileId,
  canManageAccess,
  showLastAccess,
  activeAdminCount,
}: {
  profile: ProfileListItem;
  currentProfileId: string;
  canManageAccess: boolean;
  showLastAccess: boolean;
  activeAdminCount: number;
}) {
  return (
    <article className="user-card">
      <div className="user-card-top">
        <UserIdentity profile={profile} currentProfileId={currentProfileId} />
        <UserActionsMenu
          userId={profile.id}
          userName={getProfileDisplayName(profile)}
          isActive={profile.is_active}
          canManageAccess={canManageAccess}
          disableAccessToggle={isLastActiveAdmin(profile, activeAdminCount)}
        />
      </div>
      <div className="user-card-meta">
        <span>
          <strong>Perfil</strong>
          <UserRoleBadge role={profile.role} />
        </span>
        <span>
          <strong>Situação</strong>
          <UserStatusBadge isActive={profile.is_active} />
        </span>
        {showLastAccess ? (
          <span>
            <strong>Último acesso</strong>
            {formatLastAccess(profile.last_sign_in_at)}
          </span>
        ) : null}
        <span>
          <strong>Criado em</strong>
          {formatDate(profile.created_at)}
        </span>
      </div>
    </article>
  );
}

function UserIdentity({
  profile,
  currentProfileId,
}: {
  profile: ProfileListItem;
  currentProfileId: string;
}) {
  return (
    <div className="user-identity">
      <span className="user-avatar">{getInitials(profile)}</span>
      <div>
        <strong>
          {getProfileDisplayName(profile)}
          {profile.id === currentProfileId ? <small>Você</small> : null}
        </strong>
        <span>{profile.email}</span>
      </div>
    </div>
  );
}

function UserMetricCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
  tone: "blue" | "navy" | "green" | "purple" | "red";
}) {
  return (
    <article className={`user-metric-card user-metric-${tone}`}>
      <span className="user-metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`user-role-badge role-${role}`}>
      <UserRoleIcon role={role} />
      <span>
        <strong>{roleLabels[role]}</strong>
        <small>{ROLE_DESCRIPTIONS[role]}</small>
      </span>
    </span>
  );
}

function UserRoleIcon({ role }: { role: UserRole }) {
  if (role === "administrador") return <ShieldCheck size={15} aria-hidden="true" />;
  if (role === "operador") return <UserCog size={15} aria-hidden="true" />;
  return <Eye size={15} aria-hidden="true" />;
}

function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`user-status-badge ${isActive ? "status-active" : "status-inactive"}`}>
      {isActive ? (
        <CircleCheck size={14} aria-hidden="true" />
      ) : (
        <CircleOff size={14} aria-hidden="true" />
      )}
      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
}

function UsersEmptyState({
  hasFilters,
  canManageAccess,
}: {
  hasFilters: boolean;
  canManageAccess: boolean;
}) {
  return (
    <div className="users-empty-state">
      <UsersRound size={25} aria-hidden="true" />
      <strong>
        {hasFilters ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
      </strong>
      <span>
        {hasFilters
          ? "Não encontramos usuários com os filtros selecionados."
          : "Adicione usuários e defina os níveis de acesso ao sistema."}
      </span>
      {canManageAccess && !hasFilters ? (
        <Link className="primary-action" href="/funcionarios?view=users&modal=user">
          <UserRoundPlus size={16} aria-hidden="true" />
          Novo usuário
        </Link>
      ) : null}
    </div>
  );
}

function getProfileDisplayName(profile: ProfileListItem) {
  const fullName = String(profile.full_name ?? "").trim();
  return fullName && normalizeForSearch(fullName) !== normalizeForSearch(profile.email)
    ? fullName
    : "Nome não informado";
}

function isLastActiveAdmin(profile: ProfileListItem, activeAdminCount: number) {
  return (
    profile.role === "administrador" &&
    profile.is_active &&
    activeAdminCount <= 1
  );
}

function getInitials(profile: ProfileListItem) {
  const base =
    getProfileDisplayName(profile) !== "Nome não informado"
      ? getProfileDisplayName(profile)
      : profile.email;
  return (
    base
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "U"
  ).toUpperCase();
}

function normalizeForSearch(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value: string | null) {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return date.toLocaleDateString("pt-BR");
}

function formatLastAccess(value: string | null) {
  if (!value) return "Nunca acessou";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
