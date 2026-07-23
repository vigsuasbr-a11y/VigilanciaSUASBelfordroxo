/* eslint-disable @next/next/no-css-tags */
import Image from "next/image";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleCheck,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Shield,
  ShieldCheck,
  X,
  UserCheck,
  UserCog,
  UserPlus,
  UserRound,
  UserRoundCheck,
  UserRoundPlus,
  UserRoundX,
  Users,
} from "lucide-react";
import {
  changeUserRoleAction,
  createUserAction,
  deleteUnidadeAction,
  saveFuncionarioAction,
  saveUnidadeAction,
  setUserActiveAction,
  softDeleteFuncionarioAction,
  updateUserAction,
  updateUserPasswordAction,
} from "@/app/funcionarios/actions";
import { DocumentLink as Link } from "@/components/funcionarios/document-link";
import { EmployeeActionsMenu } from "@/components/funcionarios/employee-actions-menu";
import { MobileMenuControls } from "@/components/funcionarios/mobile-menu-controls";
import { PageSizeForm } from "@/components/funcionarios/page-size-form";
import { UnitsClientView } from "@/components/funcionarios/units-client-view";
import { UsersClientView } from "@/components/funcionarios/users-client-view";
import { roleLabels } from "@/lib/permissions/roles";
import type { CurrentProfile } from "@/lib/auth/session";
import type {
  ChartRow,
  FuncionarioFilters,
  FuncionarioListItem,
  FuncionariosWorkspaceData,
  HistoricoMovimentacaoRow,
  ProfileListItem,
  UnidadeRow,
} from "@/services/funcionarios";
import type { UserRole } from "@/types/database.types";

export type ViewName = "dashboard" | "employees" | "units" | "users" | "reports" | "about";

type FuncionariosWorkspaceProps = {
  data: FuncionariosWorkspaceData;
  filters: FuncionarioFilters;
  activeView: ViewName;
  profile: NonNullable<CurrentProfile>;
  notice: string;
  dialog: DialogState;
};

type DialogState = {
  kind:
    | "none"
    | "employee"
    | "history"
    | "deleteEmployee"
    | "unit"
    | "unitDetails"
    | "deleteUnit"
    | "user"
    | "userDetails"
    | "changeUserRole"
    | "deactivateUser"
    | "reactivateUser"
    | "changePassword";
  employee?: FuncionarioListItem | null;
  unit?: UnidadeRow | null;
  user?: ProfileListItem | null;
  history?: HistoricoMovimentacaoRow[];
};

const viewTitles: Record<ViewName, string> = {
  dashboard: "Dashboard",
  employees: "Funcionários",
  units: "Unidades",
  users: "Usuários e perfis",
  reports: "Relatórios",
  about: "Sobre",
};

const viewSubtitles: Record<ViewName, string> = {
  dashboard: "Visão geral dos funcionários da Assistência Social",
  employees: "Cadastre, consulte e acompanhe a situação funcional dos profissionais.",
  units: "Cadastre, consulte e gerencie as unidades da Assistência Social.",
  users: "Gerencie os acessos, perfis e permissões dos usuários do sistema.",
  reports: "Exportação e acompanhamento de relatórios",
  about: "Informações institucionais do Sistema de Funcionários.",
};

const roleHelp: Record<UserRole, string> = {
  administrador:
    "Acesso total ao sistema, incluindo usuários, unidades, configurações e relatórios.",
  operador:
    "Pode cadastrar, editar e acompanhar funcionários e unidades, conforme permissões definidas.",
  consulta:
    "Pode consultar informações e relatórios autorizados, sem realizar alterações.",
};

export function FuncionariosWorkspace({
  data,
  filters,
  activeView,
  profile,
  notice,
  dialog,
}: FuncionariosWorkspaceProps) {
  const isAdmin = profile.role === "administrador";
  const currentView = activeView === "users" && !isAdmin ? "dashboard" : activeView;
  const lastUpdatedLabel = formatLastUpdated(new Date());
  const dialogUnitEmployeeCount = dialog.unit
    ? countEmployeesForUnit(data.employees, dialog.unit.id)
    : 0;
  const activeAdminCount = data.profiles.filter(
    (item) => item.role === "administrador" && item.is_active,
  ).length;
  const dialogUserIsLastActiveAdmin =
    dialog.user?.role === "administrador" &&
    dialog.user.is_active &&
    activeAdminCount <= 1;
  const primaryAction =
    currentView === "units"
      ? isAdmin
        ? {
            href: "/funcionarios?view=units&modal=unit",
            label: "Nova unidade",
            icon: <Plus size={18} aria-hidden="true" />,
          }
        : null
      : currentView === "users"
        ? isAdmin
          ? {
              href: "/funcionarios?view=users&modal=user",
              label: "Novo usuário",
              icon: <UserRoundPlus size={18} aria-hidden="true" />,
            }
          : null
      : currentView === "about"
        ? null
      : {
          href: "/funcionarios?view=employees&modal=employee",
          label: "Novo funcionário",
          icon: <Plus size={18} aria-hidden="true" />,
        };

  return (
    <>
      <link rel="stylesheet" href="/funcionarios/styles.css" />
      <div id="appShell" className="app-shell">
        <aside id="appSidebar" className="sidebar" aria-label="Menu principal">
          <div className="brand">
            <Image
              className="brand-crest"
              src="/funcionarios/assets/iconebelford-web.png"
              alt="Brasão da Prefeitura de Belford Roxo"
              width={96}
              height={96}
              priority
            />
            <div className="brand-copy">
              <span>Prefeitura de</span>
              <strong>Belford Roxo</strong>
              <small>Secretaria Municipal de Assistência Social e Cidadania</small>
            </div>
          </div>

          <div className="sidebar-title">
            <span>Sistema de Funcionários</span>
            <strong>Assistência Social</strong>
          </div>

          <nav className="menu">
            <MenuLink view="dashboard" activeView={currentView}>
              Dashboard
            </MenuLink>
            <MenuLink view="employees" activeView={currentView}>
              Funcionários
            </MenuLink>
            <MenuLink view="units" activeView={currentView}>
              Unidades
            </MenuLink>
            {isAdmin ? (
              <MenuLink view="users" activeView={currentView}>
                Usuários
              </MenuLink>
            ) : null}
            <MenuLink view="reports" activeView={currentView}>
              Relatórios
            </MenuLink>
            <MenuLink view="about" activeView={currentView}>
              Sobre
            </MenuLink>
          </nav>

          <div className="signature">
            <div className="sidebar-user">
              <span id="currentUserInitials" className="session-avatar">
                {getInitials(profile.full_name || profile.email)}
              </span>
              <span className="session-copy">
                <strong id="currentUserName">{profile.email}</strong>
                <small id="currentUserRole">{roleLabels[profile.role]}</small>
              </span>
            </div>
            <Link id="logoutBtn" className="logout-button" href="/logout">
              <LogOut size={17} aria-hidden="true" />
              Sair do sistema
            </Link>
            <div className="sidebar-safe">
              <ShieldCheck size={22} aria-hidden="true" />
              <div>
                <strong>Sistema seguro</strong>
                <span>Acesso restrito a usuários autorizados.</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="workspace" id="conteudo">
          <header className="topbar">
            <div className="topbar-heading">
              <MobileMenuControls />
              <div>
                <p className="eyebrow">Início / {viewTitles[currentView]}</p>
                <h1 id="viewTitle">{viewTitles[currentView]}</h1>
                <p id="viewSubtitle" className="view-subtitle">
                  {viewSubtitles[currentView]}
                </p>
              </div>
            </div>
            <div className="top-actions">
              <span className="top-icon-button" aria-label="Sem avisos recentes">
                <Bell size={18} aria-hidden="true" />
                <span />
              </span>
              <div className="top-profile-chip" aria-label="Usuário conectado">
                <span className="session-avatar">
                  {getInitials(profile.full_name || profile.email)}
                </span>
                <span className="session-copy">
                  <strong>{profile.email}</strong>
                  <small>{roleLabels[profile.role]}</small>
                </span>
              </div>
              <div className="period-card" aria-label="Atualização dos dados">
                <CalendarDays size={18} aria-hidden="true" />
                <span>
                  <small>Atualização</small>
                  <strong>{lastUpdatedLabel}</strong>
                </span>
              </div>
              {primaryAction ? (
                <Link
                  id="newEmployeeBtn"
                  className="primary-action"
                  href={primaryAction.href}
                >
                  {primaryAction.icon}
                  {primaryAction.label}
                </Link>
              ) : null}
            </div>
          </header>

          {notice ? (
            <div className="system-notice" role="status" aria-live="polite">
              {notice}
            </div>
          ) : null}

          {data.errors.length ? (
            <div className="system-notice">
              Não foi possível carregar todos os dados. Verifique a conexão e
              tente novamente.
            </div>
          ) : null}

          <section
            id="dashboardView"
            className={`view${currentView === "dashboard" ? " active" : ""}`}
          >
            <DashboardView data={data} lastUpdatedLabel={lastUpdatedLabel} />
          </section>

          <section
            id="employeesView"
            className={`view${currentView === "employees" ? " active" : ""}`}
          >
            <EmployeesView data={data} filters={filters} />
          </section>

          <section
            id="unitsView"
            className={`view${currentView === "units" ? " active" : ""}`}
          >
            <UnitsView data={data} canManage={isAdmin} />
          </section>

          <section
            id="usersView"
            className={`view${currentView === "users" ? " active" : ""}`}
          >
            <UsersView
              data={data}
              currentProfileId={profile.id}
              canManageAccess={isAdmin}
            />
          </section>

          <section
            id="reportsView"
            className={`view${currentView === "reports" ? " active" : ""}`}
          >
            <ReportsView />
          </section>

          <section
            id="aboutView"
            className={`view${currentView === "about" ? " active" : ""}`}
          >
            <AboutView />
          </section>
        </main>
      </div>

      {dialog.kind === "employee" ? (
        <EmployeeDialog employee={dialog.employee ?? null} units={data.units} />
      ) : null}
      {dialog.kind === "history" && dialog.employee ? (
        <HistoryDialog
          employee={dialog.employee}
          history={dialog.history ?? []}
        />
      ) : null}
      {dialog.kind === "deleteEmployee" && dialog.employee ? (
        <DeleteEmployeeDialog employee={dialog.employee} />
      ) : null}
      {dialog.kind === "unit" ? (
        <UnitDialog unit={dialog.unit ?? null} />
      ) : null}
      {dialog.kind === "unitDetails" && dialog.unit ? (
        <UnitDetailsDialog
          unit={dialog.unit}
          linkedCount={dialogUnitEmployeeCount}
          canManage={isAdmin}
        />
      ) : null}
      {dialog.kind === "deleteUnit" && dialog.unit ? (
        <DeleteUnitDialog
          unit={dialog.unit}
          linkedCount={dialogUnitEmployeeCount}
        />
      ) : null}
      {dialog.kind === "user" ? (
        <UserDialog
          user={dialog.user ?? null}
          currentProfileId={profile.id}
          protectedAdmin={dialogUserIsLastActiveAdmin}
        />
      ) : null}
      {dialog.kind === "userDetails" && dialog.user ? (
        <UserDetailsDialog
          user={dialog.user}
          currentProfileId={profile.id}
          canManageAccess={isAdmin}
        />
      ) : null}
      {dialog.kind === "changeUserRole" && dialog.user ? (
        <ChangeUserRoleDialog
          user={dialog.user}
          currentProfileId={profile.id}
          protectedAdmin={dialogUserIsLastActiveAdmin}
        />
      ) : null}
      {dialog.kind === "deactivateUser" && dialog.user ? (
        <UserAccessDialog
          user={dialog.user}
          currentProfileId={profile.id}
          nextActive={false}
          protectedAdmin={dialogUserIsLastActiveAdmin}
        />
      ) : null}
      {dialog.kind === "reactivateUser" && dialog.user ? (
        <UserAccessDialog
          user={dialog.user}
          currentProfileId={profile.id}
          nextActive
          protectedAdmin={false}
        />
      ) : null}
      {dialog.kind === "changePassword" && dialog.user ? (
        <PasswordChangeDialog user={dialog.user} />
      ) : null}
    </>
  );
}

function DashboardView({
  data,
  lastUpdatedLabel,
}: {
  data: FuncionariosWorkspaceData;
  lastUpdatedLabel: string;
}) {
  const total = data.summary.total;
  const activePercent = percentage(data.summary.ativos, total);
  const exoneratedPercent = percentage(data.summary.exonerados, total);
  const unitsWithEmployees = data.summary.porUnidade.filter(
    (row) => normalizeText(row.label) !== "sem unidade",
  ).length;
  const quickStats = buildQuickStats(data);

  return (
    <>
      <div className="metric-grid dashboard-metric-grid">
        <MetricCard
          icon={<Users size={28} aria-hidden="true" />}
          label="Total de funcionários"
          value={data.summary.total}
          note="cadastrados"
          trend={`Dados atualizados em ${lastUpdatedLabel}`}
          tone="blue"
        />
        <MetricCard
          icon={<UserCheck size={28} aria-hidden="true" />}
          label="Funcionários ativos"
          value={data.summary.ativos}
          note="em exercício"
          trend={`${activePercent}% do quadro atual`}
          tone="green"
        />
        <MetricCard
          icon={<UserRoundX size={28} aria-hidden="true" />}
          label="Funcionários exonerados"
          value={data.summary.exonerados}
          note="mantidos no histórico"
          trend={`${exoneratedPercent}% dos registros`}
          tone="orange"
        />
        <MetricCard
          icon={<Building2 size={28} aria-hidden="true" />}
          label="Unidades"
          value={data.summary.unidades}
          note="equipamentos e setores"
          trend={`${unitsWithEmployees} com funcionários`}
          tone="purple"
        />
      </div>

      <div className="dashboard-grid dashboard-grid-upgraded">
        <section className="panel dashboard-panel units-panel">
          <div className="panel-heading">
            <h2>
              <Building2 size={20} aria-hidden="true" />
              Funcionários por unidade
            </h2>
            <Link className="panel-link" href="/funcionarios?view=units">
              Ver todas
            </Link>
          </div>
          <BarList rows={data.summary.porUnidade.slice(0, 8)} showPercent total={total} />
          <Link className="soft-action" href="/funcionarios?view=units">
            Ver todas as unidades
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <section className="panel dashboard-panel status-panel">
          <div className="panel-heading">
            <h2>Distribuição por situação funcional</h2>
          </div>
          <StatusChart rows={data.summary.porStatus} />
        </section>
        <section className="panel dashboard-panel quick-panel">
          <div className="panel-heading">
            <h2>Informacoes rapidas</h2>
          </div>
          <QuickInfoGrid stats={quickStats} />
        </section>
        <section className="panel dashboard-panel wide-panel roles-panel">
          <div className="panel-heading">
            <h2>
              <BriefcaseBusiness size={20} aria-hidden="true" />
              Cargos com maior volume
            </h2>
          </div>
          <RankedRoleList rows={data.summary.porCargo.slice(0, 5)} total={total} />
        </section>
      </div>
    </>
  );
}

function EmployeesView({
  data,
  filters,
}: {
  data: FuncionariosWorkspaceData;
  filters: FuncionarioFilters;
}) {
  const licenseTotal = data.summary.porStatus.find((row) =>
    normalizeText(row.label).startsWith("licenca"),
  )?.total ?? 0;
  const inactiveTotal = Math.max(data.summary.total - data.summary.ativos, 0);
  const percent = (value: number) =>
    data.summary.total ? `${Math.round((value / data.summary.total) * 100)}% do total` : "0% do total";

  return (
    <>
      <form className="filter-bar" action="/funcionarios">
        <input type="hidden" name="view" value="employees" />
        <div className="filter-panel-heading">
          <h2>Filtros de busca</h2>
          <span className="filter-advanced">
            <X size={14} aria-hidden="true" />
            Filtros avançados
          </span>
        </div>
        <div className="filter-grid">
        <label className="filter-search">
          <span>Buscar</span>
          <span className="filter-search-field">
          <input
            id="globalSearch"
            name="search"
            type="search"
            placeholder="Busque por nome, CPF, cargo ou unidade"
            defaultValue={filters.search}
          />
          <Search size={18} aria-hidden="true" />
          </span>
        </label>
        <label>
          <span>Unidade</span>
          <select id="filterUnit" name="unidade_id" defaultValue={filters.unidadeId}>
            <option value="">Todas as unidades</option>
            {data.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Cargo</span>
          <input
            id="filterRole"
            name="cargo"
            type="text"
            placeholder="Todos os cargos"
            defaultValue={filters.cargo}
          />
        </label>
        <label>
          <span>Situação</span>
          <select id="filterStatus" name="status" defaultValue={filters.status}>
            <option value="">Todas as situações</option>
            <option>Ativo</option>
            <option>Exonerado</option>
            <option value="Licenca">Licença</option>
            <option>Transferido</option>
            <option>Afastado</option>
          </select>
        </label>
        <button className="primary-action filter-submit" type="submit">
          <Filter size={16} aria-hidden="true" />
          Buscar
        </button>
        <Link className="ghost-action filter-reset" href="/funcionarios?view=employees">
          Limpar filtros
        </Link>
        </div>
      </form>

      <div className="employee-overview" aria-label="Resumo dos funcionários">
        <EmployeeStat className="stat-total" label="Total de funcionários" value={data.summary.total} note="funcionários cadastrados" />
        <EmployeeStat className="stat-active" label="Funcionários ativos" value={data.summary.ativos} note={percent(data.summary.ativos)} />
        <EmployeeStat className="stat-license" label="Em licença" value={licenseTotal} note={percent(licenseTotal)} />
        <EmployeeStat className="stat-inactive" label="Inativos" value={inactiveTotal} note={percent(inactiveTotal)} />
      </div>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div className="list-heading">
            <div>
              <h2>Funcionários cadastrados</h2>
            </div>
          </div>
          <div className="table-heading-actions">
            <span id="employeeCount" className="result-count">
              {data.filteredEmployees.length} registro
              {data.filteredEmployees.length === 1 ? "" : "s"}
            </span>
            <PageSizeForm
              search={filters.search}
              unidadeId={filters.unidadeId}
              cargo={filters.cargo}
              status={filters.status}
              pageSize={filters.pageSize}
            />
            <Link className="ghost-action table-export" href="/funcionarios?view=reports">
              <Download size={15} aria-hidden="true" />
              Relatórios
            </Link>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Funcionário</th>
                <th scope="col">CPF</th>
                <th scope="col">Cargo</th>
                <th scope="col">Unidade</th>
                <th scope="col">Setor</th>
                <th scope="col">Situação</th>
                <th scope="col">Contato</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody id="employeeTable">
              {data.paginatedEmployees.length ? (
                data.paginatedEmployees.map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="empty-state">
                    Nenhum funcionário foi encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span id="employeeRange" className="pagination-range">
            {data.filteredEmployees.length
              ? `Mostrando ${data.pagination.start + 1} a ${data.pagination.end} de ${data.filteredEmployees.length} funcionários`
              : "Nenhum registro"}
          </span>
          <nav className="pagination" aria-label="Paginação da lista de funcionários">
            <PaginationLink
              label="‹"
              ariaLabel="Página anterior"
              page={data.pagination.page - 1}
              disabled={data.pagination.page <= 1}
              filters={filters}
            />
            <div id="employeePaginationPages" className="pagination-pages">
              {paginationItems(data.pagination.page, data.pagination.totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <PaginationLink
                    key={item}
                    label={String(item)}
                    page={item}
                    active={item === data.pagination.page}
                    filters={filters}
                  />
                ),
              )}
            </div>
            <PaginationLink
              label="›"
              ariaLabel="Próxima página"
              page={data.pagination.page + 1}
              disabled={data.pagination.page >= data.pagination.totalPages}
              filters={filters}
            />
          </nav>
        </div>
      </section>
    </>
  );
}

function UnitsView({
  data,
  canManage,
}: {
  data: FuncionariosWorkspaceData;
  canManage: boolean;
}) {
  return (
    <UnitsClientView
      units={data.units}
      employees={data.employees}
      canManage={canManage}
    />
  );
}

function UsersView({
  data,
  currentProfileId,
  canManageAccess,
}: {
  data: FuncionariosWorkspaceData;
  currentProfileId: string;
  canManageAccess: boolean;
}) {
  return (
    <UsersClientView
      profiles={data.profiles}
      currentProfileId={currentProfileId}
      canManageAccess={canManageAccess}
    />
  );
}

function ReportsView() {
  return (
    <section className="panel report-panel">
      <div className="panel-heading">
        <h2>Relatórios</h2>
      </div>
      <div className="report-grid">
        <article>
          <strong>Relatório geral</strong>
          <span>Todos os funcionários com unidade, cargo, contato e situação funcional.</span>
        </article>
        <article>
          <strong>Relatório por unidade</strong>
          <span>Use o filtro de unidade antes de exportar.</span>
        </article>
        <article>
          <strong>Relatório por situação</strong>
          <span>Exporte ativos, exonerados, licenças, transferidos ou afastados.</span>
        </article>
      </div>
      <div className="report-actions">
        <button id="exportPdfBtn" className="primary-action" type="button" disabled>
          PDF indisponível
        </button>
        <button id="exportExcelBtn" className="secondary-action" type="button" disabled>
          Excel indisponível
        </button>
      </div>
    </section>
  );
}

function AboutView() {
  return (
    <div className="about-shell">
      <section className="about-hero" aria-labelledby="aboutHeroTitle">
        <div className="about-hero-content">
          <span className="about-badge">Sistema institucional</span>
          <h2 id="aboutHeroTitle">Sistema de Funcionários</h2>
          <p>
            Plataforma administrativa da Secretaria Municipal de Assistência Social e
            Cidadania para organizar cadastros funcionais, unidades, usuários e
            relatórios da rede socioassistencial.
          </p>
        </div>
        <div className="about-version-card" aria-label="Versão do sistema">
          <FileText size={34} aria-hidden="true" />
          <strong>Versão 1.0</strong>
          <span>Portal SEMASC</span>
        </div>
      </section>

      <div className="about-card-grid">
        <article className="about-card">
          <span className="about-card-icon">
            <Info size={22} aria-hidden="true" />
          </span>
          <span className="about-card-kicker">Institucional</span>
          <h3>Sobre o projeto</h3>
          <p>
            O sistema foi criado para apoiar a gestão de funcionários da Assistência
            Social, centralizando informações importantes em uma interface segura,
            organizada e simples de consultar.
          </p>
          <p>
            A proposta é reduzir controles manuais, melhorar a atualização dos dados e
            facilitar o acompanhamento das equipes, unidades e vínculos profissionais.
          </p>
        </article>

        <article className="about-card">
          <span className="about-card-icon">
            <UserCog size={22} aria-hidden="true" />
          </span>
          <span className="about-card-kicker">Equipe responsável</span>
          <h3>Desenvolvimento</h3>
          <dl className="about-definition-list">
            <div>
              <dt>Responsável</dt>
              <dd>Alessandro Araújo</dd>
            </div>
            <div>
              <dt>Setor</dt>
              <dd>Vigilância Socioassistencial</dd>
            </div>
            <div>
              <dt>Secretaria</dt>
              <dd>SEMASC - Secretaria Municipal de Assistência Social e Cidadania</dd>
            </div>
          </dl>
          <p>
            Cada funcionalidade foi pensada para atender às rotinas internas da
            secretaria, com foco em praticidade, segurança e clareza no uso diário.
          </p>
        </article>
      </div>

      <section className="about-feature-panel" aria-labelledby="aboutFeaturesTitle">
        <div>
          <span className="about-card-kicker">O que o sistema organiza</span>
          <h3 id="aboutFeaturesTitle">Base funcional integrada</h3>
        </div>
        <div className="about-feature-grid">
          <AboutFeature
            icon={<Users size={20} aria-hidden="true" />}
            title="Funcionários"
            text="Cadastros, situação funcional, contatos e vínculos profissionais."
          />
          <AboutFeature
            icon={<Building2 size={20} aria-hidden="true" />}
            title="Unidades"
            text="Equipamentos, setores, coordenadores e vínculos com equipes."
          />
          <AboutFeature
            icon={<ShieldCheck size={20} aria-hidden="true" />}
            title="Acessos"
            text="Perfis de usuário e controle administrativo do sistema."
          />
          <AboutFeature
            icon={<FileText size={20} aria-hidden="true" />}
            title="Relatórios"
            text="Informações consolidadas para consulta, gestão e monitoramento."
          />
        </div>
      </section>

      <footer className="about-footer-bar">
        <strong>Sistema de Funcionários</strong>
        <span>Prefeitura Municipal de Belford Roxo</span>
        <span>Desenvolvido por Alessandro Araújo</span>
        <span>Vigilância Socioassistencial</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

function AboutFeature({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="about-feature-card">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}

function EmployeeRow({ employee }: { employee: FuncionarioListItem }) {
  return (
    <tr>
      <td className="employee-name">
        <div className="employee-identity">
          <span className="employee-avatar">{getInitials(employee.nome)}</span>
          <span>
            <strong title={employee.nome}>{formatPersonName(employee.nome)}</strong>
            <small>Admissão: {formatDate(employee.admissao) || "não informada"}</small>
          </span>
        </div>
      </td>
      <td className="nowrap">{employee.cpf || "-"}</td>
      <td className="employee-role">
        <strong>{employee.cargo || "Não informado"}</strong>
        <small>{employee.escolaridade || "Escolaridade não informada"}</small>
      </td>
      <td>{employee.unidade_nome || "Sem unidade"}</td>
      <td>{employee.setor || "-"}</td>
      <td>
        <span className={`status-pill ${statusClass(employee.status)}`}>
          {formatStatusLabel(employee.status)}
        </span>
      </td>
      <td className="employee-contact">
        <span>{employee.telefone || "Sem telefone"}</span>
        <small>{employee.email || "Sem e-mail"}</small>
      </td>
      <td>
        <EmployeeActionsMenu employeeId={employee.id} employeeName={employee.nome} />
      </td>
    </tr>
  );
}

function EmployeeDialog({
  employee,
  units,
}: {
  employee: FuncionarioListItem | null;
  units: UnidadeRow[];
}) {
  return (
    <dialog id="employeeDialog" className="modal" open>
      <form id="employeeForm" className="employee-modal-form" action={saveFuncionarioAction}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">
              <UserPlus size={30} aria-hidden="true" />
            </span>
            <div>
              <h2 id="employeeFormTitle">
                {employee ? "Editar funcionário" : "Novo funcionário"}
              </h2>
              <p>Preencha as informações para manter o cadastro atualizado.</p>
            </div>
          </div>
          <Link
            id="closeEmployeeDialog"
            className="icon-button modal-close-button"
            href="/funcionarios?view=employees"
            aria-label="Fechar"
          >
            <X size={24} aria-hidden="true" />
          </Link>
        </div>
        <input type="hidden" id="employeeId" name="id" value={employee?.id ?? ""} />
        <div className="employee-modal-body">
          <aside className="employee-modal-rail" aria-label="Informações do cadastro">
            <span className="rail-main-icon">
              <UserPlus size={34} aria-hidden="true" />
            </span>
            <h3>{employee ? "Vamos atualizar este funcionário" : "Vamos cadastrar um novo funcionário"}</h3>
            <p>
              Preencha corretamente os dados para manter nossas informações
              sempre atualizadas.
            </p>
            <div className="rail-note">
              <ShieldCheck size={24} aria-hidden="true" />
              <span>
                <strong>Dados protegidos</strong>
                Acesso restrito a usuários autorizados.
              </span>
            </div>
            <div className="rail-note">
              <FileText size={24} aria-hidden="true" />
              <span>
                <strong>Cadastro rápido</strong>
                Preencha os dados e o sistema cuida do restante.
              </span>
            </div>
            <div className="rail-note">
              <Info size={24} aria-hidden="true" />
              <span>
                <strong>Informações importantes</strong>
                Revise os campos antes de salvar.
              </span>
            </div>
          </aside>
          <div className="form-sections employee-modal-sections">
          <fieldset className="form-section">
            <legend>
              <UserRound size={18} aria-hidden="true" />
              Dados pessoais
            </legend>
            <div className="section-grid">
              <label className="field-wide">
                Nome completo
                <input
                  id="employeeName"
                  name="nome"
                  placeholder="Digite o nome completo do funcionário"
                  required
                  defaultValue={employee?.nome ?? ""}
                />
              </label>
              <label>
                CPF
                <input
                  id="employeeCpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  autoComplete="off"
                  defaultValue={employee?.cpf ?? ""}
                />
              </label>
              <label>
                Data de nascimento
                <input
                  id="employeeBirth"
                  name="nascimento"
                  type="date"
                  defaultValue={employee?.nascimento ?? ""}
                />
              </label>
              <label>
                Escolaridade
                <input
                  id="employeeEducation"
                  name="escolaridade"
                  placeholder="Informe a escolaridade"
                  defaultValue={employee?.escolaridade ?? ""}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>
              <BriefcaseBusiness size={18} aria-hidden="true" />
              Vínculo profissional
            </legend>
            <div className="section-grid">
              <label>
                Cargo / Profissão
                <input
                  id="employeeRole"
                  name="cargo"
                  placeholder="Digite o cargo ou profissão"
                  defaultValue={employee?.cargo ?? ""}
                />
              </label>
              <label>
                Setor
                <input
                  id="employeeSector"
                  name="setor"
                  placeholder="Informe o setor"
                  defaultValue={employee?.setor ?? ""}
                />
              </label>
              <label>
                Unidade vinculada
                <select
                  id="employeeUnit"
                  name="unidade_id"
                  defaultValue={employee?.unidade_id ?? ""}
                >
                  <option value="">Sem unidade</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo de vínculo
                <input
                  id="employeeContract"
                  name="vinculo"
                  placeholder="Efetivo, contrato, comissionado..."
                  defaultValue={employee?.vinculo ?? ""}
                />
              </label>
              <label>
                Carga horária
                <input
                  id="employeeWorkload"
                  name="carga_horaria"
                  placeholder="40h semanais"
                  defaultValue={employee?.carga_horaria ?? ""}
                />
              </label>
              <label>
                Data de admissão
                <input
                  id="employeeAdmission"
                  name="admissao"
                  type="date"
                  defaultValue={employee?.admissao ?? ""}
                />
              </label>
              <label>
                Situação funcional
                <select
                  id="employeeStatus"
                  name="status"
                  defaultValue={employee?.status ?? "Ativo"}
                >
                  <option>Ativo</option>
                  <option>Exonerado</option>
                  <option value="Licenca">Licença</option>
                  <option>Transferido</option>
                  <option>Afastado</option>
                </select>
              </label>
              <label>
                Observação do histórico
                <input
                  name="historico_observacao"
                  placeholder="Opcional ao alterar a situação funcional"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="form-section">
            <legend>
              <FileText size={18} aria-hidden="true" />
              Contato e observações
            </legend>
            <div className="section-grid">
              <label>
                Telefone
                <input
                  id="employeePhone"
                  name="telefone"
                  inputMode="tel"
                  autoComplete="tel"
                  defaultValue={employee?.telefone ?? ""}
                />
              </label>
              <label>
                E-mail
                <input
                  id="employeeEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={employee?.email ?? ""}
                />
              </label>
              <label className="field-wide">
                Observações
                <textarea
                  id="employeeNotes"
                  name="observacoes"
                  rows={4}
                  defaultValue={employee?.observacoes ?? ""}
                />
              </label>
            </div>
          </fieldset>
          <div className="modal-required-note">
            <Info size={24} aria-hidden="true" />
            <span>
              <strong>Importante</strong>
              Confira os dados antes de salvar o cadastro.
            </span>
          </div>
          </div>
        </div>
        <div className="form-actions employee-modal-actions">
          <Link
            className="ghost-action"
            id="cancelEmployeeBtn"
            href="/funcionarios?view=employees"
          >
            Cancelar
          </Link>
          <button className="primary-action" type="submit">
            <Save size={18} aria-hidden="true" />
            Salvar funcionário
          </button>
        </div>
      </form>
    </dialog>
  );
}

function HistoryDialog({
  employee,
  history,
}: {
  employee: FuncionarioListItem;
  history: HistoricoMovimentacaoRow[];
}) {
  return (
    <dialog id="historyDialog" className="modal small-modal" open>
      <div className="modal-header">
        <div>
          <p className="eyebrow">Movimentações</p>
          <h2 id="historyTitle">{employee.nome}</h2>
        </div>
        <Link
          id="closeHistoryDialog"
          className="icon-button"
          href="/funcionarios?view=employees"
          aria-label="Fechar"
        >
          Fechar
        </Link>
      </div>
      <div id="historyList" className="history-list">
        {history.length ? (
          history.map((item) => (
            <article key={item.id} className="history-item">
              <strong>
                {formatStatusLabel(item.status_anterior || "Início")} -&gt; {formatStatusLabel(item.status_novo)}
              </strong>
              <span>{formatDateTime(item.data_movimentacao)}</span>
              <span>{item.observacao || "Sem observação"}</span>
            </article>
          ))
        ) : (
          <div className="empty-state">Sem movimentações registradas.</div>
        )}
      </div>
    </dialog>
  );
}

function DeleteEmployeeDialog({ employee }: { employee: FuncionarioListItem }) {
  return (
    <dialog className="modal small-modal" open>
      <form action={softDeleteFuncionarioAction}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Confirmação</p>
            <h2>Arquivar funcionário?</h2>
          </div>
          <Link
            id="closeEmployeeDialog"
            className="icon-button"
            href="/funcionarios?view=employees"
            aria-label="Fechar"
          >
            Fechar
          </Link>
        </div>
        <input type="hidden" name="id" value={employee.id} />
        <p className="view-subtitle">
          O registro de {formatPersonName(employee.nome)} será ocultado da lista ativa e preservado
          para auditoria.
        </p>
        <div className="form-actions">
          <button className="primary-action" type="submit">
            Confirmar arquivamento
          </button>
          <Link className="ghost-action" href="/funcionarios?view=employees">
            Cancelar
          </Link>
        </div>
      </form>
    </dialog>
  );
}

function UnitDialog({ unit }: { unit: UnidadeRow | null }) {
  const isEditing = Boolean(unit);

  return (
    <dialog id="unitDialog" className="modal unit-modal" open>
      <form id="unitForm" className="unit-modal-form" action={saveUnidadeAction}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">
              <Building2 size={26} aria-hidden="true" />
            </span>
            <div>
              <h2 id="unitFormTitle">
                {isEditing ? "Editar unidade" : "Nova unidade"}
              </h2>
              <p>
                {isEditing
                  ? "Atualize os dados reais da unidade selecionada."
                  : "Preencha as informações para cadastrar uma nova unidade."}
              </p>
            </div>
          </div>
          <Link
            id="closeUnitDialog"
            className="icon-button modal-close-button"
            href="/funcionarios?view=units"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>

        <div className="unit-modal-body">
          <aside className="unit-modal-rail" aria-label="Orientações do cadastro">
            <span className="rail-main-icon">
              <Building2 size={30} aria-hidden="true" />
            </span>
            <h3>{isEditing ? "Revise a unidade" : "Vamos cadastrar uma unidade"}</h3>
            <p>
              Mantenha nome, tipo, situação e contato alinhados com a base oficial
              do sistema.
            </p>
            <div className="rail-note">
              <ShieldCheck size={20} aria-hidden="true" />
              <div>
                <strong>Dados protegidos</strong>
                <span>Cadastro restrito a administradores autorizados.</span>
              </div>
            </div>
            <div className="rail-note">
              <Info size={20} aria-hidden="true" />
              <div>
                <strong>Campos obrigatórios</strong>
                <span>Nome e tipo são necessários para salvar.</span>
              </div>
            </div>
          </aside>

          <div className="form-sections unit-modal-sections">
            <section className="form-section unit-form-section">
              <div className="section-title">
                <span>
                  <Building2 size={17} aria-hidden="true" />
                </span>
                <h3>Identificação da unidade</h3>
              </div>
              <input type="hidden" id="unitId" name="id" value={unit?.id ?? ""} />
              <div className="form-grid">
                <label className="full-width">
                  Nome da unidade <span aria-hidden="true">*</span>
                  <input
                    id="unitName"
                    name="nome"
                    required
                    placeholder="Digite o nome da unidade"
                    defaultValue={unit?.nome ?? ""}
                  />
                </label>
                <label>
                  Tipo <span aria-hidden="true">*</span>
                  <select
                    id="unitType"
                    name="tipo"
                    required
                    defaultValue={unit?.tipo ?? "CRAS"}
                  >
                    <option>CRAS</option>
                    <option>CREAS</option>
                    <option>Centro POP</option>
                    <option>Secretaria</option>
                    <option>Abrigo</option>
                    <option>Outra</option>
                  </select>
                </label>
                <label>
                  Situação
                  <select
                    id="unitStatus"
                    name="status"
                    defaultValue={unitStatusFormValue(unit?.status)}
                  >
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="form-section unit-form-section">
              <div className="section-title">
                <span>
                  <Info size={17} aria-hidden="true" />
                </span>
                <h3>Contato e localização</h3>
              </div>
              <div className="form-grid">
                <label className="full-width">
                  Endereço
                  <input
                    id="unitAddress"
                    name="endereco"
                    placeholder="Informe o endereço da unidade"
                    defaultValue={unit?.endereco ?? ""}
                  />
                </label>
                <label>
                  Coordenador
                  <input
                    id="unitCoordinator"
                    name="coordenador"
                    placeholder="Nome do coordenador"
                    defaultValue={unit?.coordenador ?? ""}
                  />
                </label>
                <label>
                  Telefone
                  <input
                    id="unitPhone"
                    name="telefone"
                    type="tel"
                    placeholder="(21) 00000-0000"
                    defaultValue={unit?.telefone ?? ""}
                  />
                </label>
              </div>
            </section>

            <div className="modal-required-note">
              <Info size={22} aria-hidden="true" />
              <div>
                <strong>Importante</strong>
                <span>Todos os campos com * são obrigatórios.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions unit-modal-actions">
          <Link className="ghost-action" href="/funcionarios?view=units">
            Cancelar
          </Link>
          <button className="primary-action" type="submit">
            <Save size={17} aria-hidden="true" />
            {isEditing ? "Salvar alterações" : "Salvar unidade"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function UnitDetailsDialog({
  unit,
  linkedCount,
  canManage,
}: {
  unit: UnidadeRow;
  linkedCount: number;
  canManage: boolean;
}) {
  return (
    <dialog className="modal small-modal unit-details-modal" open>
      <div className="unit-details-dialog">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Detalhes da unidade</p>
            <h2>{unit.nome}</h2>
          </div>
          <Link
            className="icon-button modal-close-button"
            href="/funcionarios?view=units"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>

        <div className="unit-details-grid">
          <UnitDetailItem label="Tipo" value={unit.tipo} />
          <UnitDetailItem label="Situação" value={formatUnitStatus(unit.status)} />
          <UnitDetailItem
            label="Funcionários vinculados"
            value={formatEmployeeCount(linkedCount)}
            href={`/funcionarios?view=employees&unidade_id=${unit.id}`}
          />
          <UnitDetailItem
            label="Coordenador"
            value={unit.coordenador || "Sem coordenador"}
          />
          <UnitDetailItem label="Telefone" value={unit.telefone || "Sem telefone"} />
          <UnitDetailItem
            label="Endereço"
            value={unit.endereco || "Endereço não informado"}
            wide
          />
        </div>

        <div className="form-actions">
          <Link className="ghost-action" href="/funcionarios?view=units">
            Fechar
          </Link>
          <Link
            className="ghost-action"
            href={`/funcionarios?view=employees&unidade_id=${unit.id}`}
          >
            <Users size={16} aria-hidden="true" />
            Ver funcionários
          </Link>
          {canManage ? (
            <Link
              className="primary-action"
              href={`/funcionarios?view=units&modal=unit&unitId=${unit.id}`}
            >
              Editar unidade
            </Link>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

function UnitDetailItem({
  label,
  value,
  href,
  wide = false,
}: {
  label: string;
  value: string;
  href?: string;
  wide?: boolean;
}) {
  return (
    <div className={`unit-detail-item${wide ? " wide" : ""}`}>
      <span>{label}</span>
      {href ? <Link href={href}>{value}</Link> : <strong>{value}</strong>}
    </div>
  );
}

function DeleteUnitDialog({
  unit,
  linkedCount,
}: {
  unit: UnidadeRow;
  linkedCount: number;
}) {
  if (linkedCount > 0) {
    return (
      <dialog className="modal small-modal unit-delete-modal" open>
        <div className="unit-delete-dialog">
          <div className="modal-header">
            <div>
              <p className="eyebrow">Exclusão bloqueada</p>
              <h2>Unidade com vínculos</h2>
            </div>
            <Link
              className="icon-button modal-close-button"
              href="/funcionarios?view=units"
              aria-label="Fechar"
            >
              <X size={22} aria-hidden="true" />
            </Link>
          </div>
          <div className="unit-delete-warning">
            <Info size={22} aria-hidden="true" />
            <div>
              <strong>{unit.nome}</strong>
              <span>
                Esta unidade possui {formatEmployeeCount(linkedCount)}{" "}
                {linkedCount === 1 ? "vinculado" : "vinculados"}.
                Remova ou transfira os vínculos antes de excluir.
              </span>
            </div>
          </div>
          <div className="form-actions">
            <Link className="ghost-action" href="/funcionarios?view=units">
              Cancelar
            </Link>
            <Link
              className="primary-action"
              href={`/funcionarios?view=employees&unidade_id=${unit.id}`}
            >
              Ver funcionários vinculados
            </Link>
          </div>
        </div>
      </dialog>
    );
  }

  return (
    <dialog className="modal small-modal" open>
      <form action={deleteUnidadeAction}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Confirmação</p>
            <h2>Excluir unidade</h2>
          </div>
          <Link
            id="closeUnitDeleteDialog"
            className="icon-button modal-close-button"
            href="/funcionarios?view=units"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>
        <input type="hidden" name="id" value={unit.id} />
        <p className="view-subtitle">
          A unidade {unit.nome} não possui funcionários vinculados e poderá ser
          removida do cadastro.
        </p>
        <div className="form-actions">
          <button className="primary-action" type="submit">
            Confirmar exclusão
          </button>
          <Link className="ghost-action" href="/funcionarios?view=units">
            Cancelar
          </Link>
        </div>
      </form>
    </dialog>
  );
}

function UserDialog({
  user,
  currentProfileId,
  protectedAdmin,
}: {
  user: ProfileListItem | null;
  currentProfileId: string;
  protectedAdmin: boolean;
}) {
  const isEditing = Boolean(user);
  const isSelf = user?.id === currentProfileId;

  return (
    <dialog id="userDialog" className="modal user-modal" open>
      <form
        id="userForm"
        className="user-modal-form"
        action={isEditing ? updateUserAction : createUserAction}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">
              <UserRoundPlus size={26} aria-hidden="true" />
            </span>
            <div>
              <h2 id="userFormTitle">
                {isEditing ? "Editar usuário" : "Novo usuário"}
              </h2>
              <p>
                {isEditing
                  ? "Atualize as informações e o perfil de acesso do usuário."
                  : "Cadastre um usuário e defina seu nível de acesso ao sistema."}
              </p>
            </div>
          </div>
          <Link
            className="icon-button modal-close-button"
            href="/funcionarios?view=users"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>

        <div className="user-modal-body">
          <aside className="user-modal-rail" aria-label="Segurança do cadastro">
            <span className="rail-main-icon">
              <ShieldCheck size={30} aria-hidden="true" />
            </span>
            <h3>Administração de acesso</h3>
            <p>
              Usuários do sistema devem ter perfil compatível com as ações que
              realmente precisam executar.
            </p>
            <div className="rail-note">
              <Shield size={20} aria-hidden="true" />
              <div>
                <strong>Validação no servidor</strong>
                <span>Perfis e situação são conferidos antes de salvar.</span>
              </div>
            </div>
            <div className="rail-note">
              <KeyRound size={20} aria-hidden="true" />
              <div>
                <strong>Senha protegida</strong>
                <span>A senha só é informada no cadastro e nunca é exibida.</span>
              </div>
            </div>
          </aside>

          <div className="form-sections user-modal-sections">
            <section className="form-section user-form-section">
              <div className="section-title">
                <span>
                  <UserRound size={17} aria-hidden="true" />
                </span>
                <h3>Dados do usuário</h3>
              </div>
              <input type="hidden" name="id" value={user?.id ?? ""} />
              {isSelf ? (
                <input type="hidden" name="confirm_self_change" value="true" />
              ) : null}
              <div className="form-grid">
                <label>
                  Nome completo <span aria-hidden="true">*</span>
                  <input
                    name="full_name"
                    required
                    placeholder="Digite o nome completo"
                    defaultValue={user?.full_name ?? ""}
                    autoComplete="name"
                  />
                </label>
                <label>
                  E-mail <span aria-hidden="true">*</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="usuario@semasc.gov.br"
                    defaultValue={user?.email ?? ""}
                    autoComplete="email"
                  />
                </label>
                {!isEditing ? (
                  <>
                    <label>
                      Senha temporária <span aria-hidden="true">*</span>
                      <input
                        name="password"
                        type="password"
                        minLength={6}
                        required
                        placeholder="Mínimo de 6 caracteres"
                        autoComplete="new-password"
                      />
                    </label>
                    <label>
                      Confirmar senha <span aria-hidden="true">*</span>
                      <input
                        name="password_confirmation"
                        type="password"
                        minLength={6}
                        required
                        placeholder="Repita a senha temporária"
                        autoComplete="new-password"
                      />
                    </label>
                  </>
                ) : null}
              </div>
            </section>

            <section className="form-section user-form-section">
              <div className="section-title">
                <span>
                  <Shield size={17} aria-hidden="true" />
                </span>
                <h3>Perfil de acesso</h3>
              </div>
              <RoleRadioGroup
                defaultRole={user?.role ?? "operador"}
                protectedAdmin={protectedAdmin}
              />
            </section>

            <section className="form-section user-form-section">
              <div className="section-title">
                <span>
                  <CircleCheck size={17} aria-hidden="true" />
                </span>
                <h3>Situação</h3>
              </div>
              <div className="user-status-options">
                <label>
                  <input
                    type="radio"
                    name="is_active"
                    value="true"
                    defaultChecked={user?.is_active ?? true}
                  />
                  <span>
                    <strong>Ativo</strong>
                    <small>Usuário pode acessar o sistema.</small>
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="is_active"
                    value="false"
                    defaultChecked={user ? !user.is_active : false}
                    disabled={protectedAdmin}
                  />
                  <span>
                    <strong>Inativo</strong>
                    <small>Acesso bloqueado, histórico preservado.</small>
                  </span>
                </label>
              </div>
              {isSelf ? (
                <div className="self-access-warning">
                  <Info size={18} aria-hidden="true" />
                  Você está alterando seu próprio acesso. Essa ação pode encerrar
                  sua sessão ou limitar suas permissões.
                </div>
              ) : null}
              {protectedAdmin ? (
                <div className="self-access-warning">
                  <Info size={18} aria-hidden="true" />
                  Não é possível remover este acesso administrativo. O sistema
                  precisa manter pelo menos um administrador ativo.
                </div>
              ) : null}
            </section>
          </div>
        </div>

        <div className="form-actions user-modal-actions">
          <Link className="ghost-action" href="/funcionarios?view=users">
            Cancelar
          </Link>
          <button className="primary-action" type="submit">
            <Save size={17} aria-hidden="true" />
            {isEditing ? "Salvar alterações" : "Criar usuário"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function UserDetailsDialog({
  user,
  currentProfileId,
  canManageAccess,
}: {
  user: ProfileListItem;
  currentProfileId: string;
  canManageAccess: boolean;
}) {
  return (
    <dialog className="modal small-modal user-details-modal" open>
      <div className="user-details-dialog">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Detalhes do usuário</p>
            <h2>{getUserDisplayName(user)}</h2>
          </div>
          <Link
            className="icon-button modal-close-button"
            href="/funcionarios?view=users"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>

        <div className="user-details-identity">
          <span>{getInitials(getUserDisplayName(user) || user.email)}</span>
          <div>
            <strong>
              {getUserDisplayName(user)}
              {user.id === currentProfileId ? <small>Você</small> : null}
            </strong>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="user-details-grid">
          <UserDetailItem label="Perfil" value={roleLabels[user.role]} />
          <UserDetailItem
            label="Situação"
            value={user.is_active ? "Ativo" : "Inativo"}
          />
          {user.last_sign_in_at ? (
            <UserDetailItem
              label="Último acesso"
              value={formatDateTime(user.last_sign_in_at)}
            />
          ) : null}
          <UserDetailItem label="Criado em" value={formatDateTime(user.created_at)} />
          <UserDetailItem
            label="Atualizado em"
            value={formatDateTime(user.updated_at)}
          />
        </div>

        <div className="form-actions">
          <Link className="ghost-action" href="/funcionarios?view=users">
            Fechar
          </Link>
          {canManageAccess ? (
            <Link
              className="primary-action"
              href={`/funcionarios?view=users&modal=user&userId=${user.id}`}
            >
              <Pencil size={16} aria-hidden="true" />
              Editar usuário
            </Link>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

function ChangeUserRoleDialog({
  user,
  currentProfileId,
  protectedAdmin,
}: {
  user: ProfileListItem;
  currentProfileId: string;
  protectedAdmin: boolean;
}) {
  const isSelf = user.id === currentProfileId;

  return (
    <dialog className="modal small-modal user-sensitive-modal" open>
      <form action={changeUserRoleAction}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Ação sensível</p>
            <h2>Alterar perfil</h2>
          </div>
          <Link
            className="icon-button modal-close-button"
            href="/funcionarios?view=users"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>
        <input type="hidden" name="id" value={user.id} />
        {isSelf ? <input type="hidden" name="confirm_self_change" value="true" /> : null}
        <p className="view-subtitle">
          Defina o novo perfil de {getUserDisplayName(user)}. Promoções e remoções
          de acesso administrativo são validadas no servidor.
        </p>
        <RoleRadioGroup
          defaultRole={user.role}
          compact
          protectedAdmin={protectedAdmin}
        />
        {protectedAdmin ? (
          <div className="self-access-warning">
            <Info size={18} aria-hidden="true" />
            Não é possível remover este acesso administrativo. O sistema precisa
            manter pelo menos um administrador ativo.
          </div>
        ) : null}
        {isSelf ? (
          <div className="self-access-warning">
            <Info size={18} aria-hidden="true" />
            Você está alterando seu próprio acesso. Confirme apenas se tiver
            certeza.
          </div>
        ) : null}
        <div className="form-actions">
          <Link className="ghost-action" href="/funcionarios?view=users">
            Cancelar
          </Link>
          <button className="primary-action" type="submit">
            <Shield size={16} aria-hidden="true" />
            Confirmar alteração
          </button>
        </div>
      </form>
    </dialog>
  );
}

function UserAccessDialog({
  user,
  currentProfileId,
  nextActive,
  protectedAdmin,
}: {
  user: ProfileListItem;
  currentProfileId: string;
  nextActive: boolean;
  protectedAdmin: boolean;
}) {
  const isSelf = user.id === currentProfileId;

  return (
    <dialog className="modal small-modal user-sensitive-modal" open>
      <form action={setUserActiveAction}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Confirmação</p>
            <h2>{nextActive ? "Reativar acesso?" : "Desativar acesso?"}</h2>
          </div>
          <Link
            className="icon-button modal-close-button"
            href="/funcionarios?view=users"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>
        <input type="hidden" name="id" value={user.id} />
        <input type="hidden" name="is_active" value={String(nextActive)} />
        {isSelf ? <input type="hidden" name="confirm_self_change" value="true" /> : null}
        <p className="view-subtitle">
          {nextActive
            ? "O usuário poderá entrar novamente no sistema com o perfil atualmente definido."
            : "O usuário não poderá mais entrar no sistema, mas seu histórico de ações será preservado."}
        </p>
        <div className={nextActive ? "access-confirm-card" : "access-confirm-card danger"}>
          {nextActive ? (
            <UserRoundCheck size={22} aria-hidden="true" />
          ) : (
            <UserRoundX size={22} aria-hidden="true" />
          )}
          <div>
            <strong>{getUserDisplayName(user)}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        {isSelf ? (
          <div className="self-access-warning">
            <Info size={18} aria-hidden="true" />
            Você está alterando seu próprio acesso. Essa ação pode encerrar sua
            sessão.
          </div>
        ) : null}
        {protectedAdmin && !nextActive ? (
          <div className="self-access-warning">
            <Info size={18} aria-hidden="true" />
            Não é possível remover este acesso administrativo. O sistema precisa
            manter pelo menos um administrador ativo.
          </div>
        ) : null}
        <div className="form-actions">
          <Link className="ghost-action" href="/funcionarios?view=users">
            Cancelar
          </Link>
          <button className="primary-action" type="submit" disabled={protectedAdmin && !nextActive}>
            {nextActive ? (
              <UserRoundCheck size={16} aria-hidden="true" />
            ) : (
              <UserRoundX size={16} aria-hidden="true" />
            )}
            {nextActive ? "Reativar usuário" : "Desativar usuário"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function PasswordChangeDialog({ user }: { user: ProfileListItem }) {
  return (
    <dialog className="modal small-modal user-sensitive-modal" open>
      <form action={updateUserPasswordAction}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Segurança do acesso</p>
            <h2>Alterar senha do usuário</h2>
          </div>
          <Link
            className="icon-button modal-close-button"
            href="/funcionarios?view=users"
            aria-label="Fechar"
          >
            <X size={22} aria-hidden="true" />
          </Link>
        </div>
        <input type="hidden" name="id" value={user.id} />
        <p className="view-subtitle">
          Defina uma nova senha para este usuário. A senha anterior nunca é
          exibida e o acesso passa a usar a nova senha imediatamente.
        </p>
        <div className="access-confirm-card">
          <KeyRound size={22} aria-hidden="true" />
          <div>
            <strong>{getUserDisplayName(user)}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <div className="form-grid password-change-grid">
          <label>
            Nova senha <span aria-hidden="true">*</span>
            <input
              name="password"
              type="password"
              minLength={6}
              required
              placeholder="Mínimo de 6 caracteres"
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirmar senha <span aria-hidden="true">*</span>
            <input
              name="password_confirmation"
              type="password"
              minLength={6}
              required
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />
          </label>
        </div>
        <div className="self-access-warning">
          <Info size={18} aria-hidden="true" />
          Informe uma senha provisória segura e comunique ao usuário por um canal
          interno autorizado.
        </div>
        <div className="form-actions">
          <Link className="ghost-action" href="/funcionarios?view=users">
            Cancelar
          </Link>
          <button className="primary-action" type="submit">
            <KeyRound size={16} aria-hidden="true" />
            Salvar nova senha
          </button>
        </div>
      </form>
    </dialog>
  );
}

function RoleRadioGroup({
  defaultRole,
  compact = false,
  protectedAdmin = false,
}: {
  defaultRole: UserRole;
  compact?: boolean;
  protectedAdmin?: boolean;
}) {
  return (
    <div className={`role-radio-grid${compact ? " compact" : ""}`}>
      {(["administrador", "operador", "consulta"] as UserRole[]).map((role) => (
        <label key={role} className={`role-radio-card role-${role}`}>
          <input
            type="radio"
            name="role"
            value={role}
            defaultChecked={defaultRole === role}
            disabled={protectedAdmin && role !== "administrador"}
          />
          <span className="role-radio-icon">
            {role === "administrador" ? (
              <ShieldCheck size={18} aria-hidden="true" />
            ) : role === "operador" ? (
              <UserCog size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </span>
          <span>
            <strong>{roleLabels[role]}</strong>
            <small>{roleHelp[role]}</small>
          </span>
        </label>
      ))}
    </div>
  );
}

function UserDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="user-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
  trend,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
  trend: string;
  tone: "blue" | "green" | "orange" | "purple";
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-card-main">
        <span className="metric-icon">{icon}</span>
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{note}</small>
        </div>
      </div>
      <Sparkline tone={tone} />
      <span className="metric-trend">{trend}</span>
    </article>
  );
}

function EmployeeStat({
  className,
  label,
  value,
  note,
}: {
  className: string;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <article className={`employee-stat ${className}`}>
      <div className="employee-stat-head">
        <span className="stat-icon" aria-hidden="true" />
        <div>
          <small>{label}</small>
          <strong>{value}</strong>
          <span>{note}</span>
        </div>
      </div>
      <MiniTrendLine />
      <span className="employee-stat-badge">
        {className === "stat-license" ? "Sem alteração" : note}
      </span>
    </article>
  );
}

function MiniTrendLine() {
  return (
    <svg
      className="employee-stat-line"
      viewBox="0 0 220 54"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 38 C18 34 25 29 39 30 C52 29 59 25 70 24 C82 22 91 24 101 18 C113 12 121 20 132 16 C144 12 156 9 168 18 C181 27 193 18 218 10"
        fill="none"
        pathLength="1"
      />
    </svg>
  );
}

function BarList({
  rows,
  compact = false,
  showPercent = false,
  total = 0,
}: {
  rows: ChartRow[];
  compact?: boolean;
  showPercent?: boolean;
  total?: number;
}) {
  if (!rows.length) {
    return <div className="empty-state">Sem dados para exibir.</div>;
  }

  const max = Math.max(...rows.map((row) => row.total), 1);

  return (
    <div className={`bar-list${compact ? " compact" : ""}`}>
      {rows.map((row) => (
        <div key={row.label} className="bar-row">
          <div className="bar-label">
            <span className="bar-name">
              {showPercent ? <Building2 size={15} aria-hidden="true" /> : null}
              {row.label}
            </span>
            <strong>
              {row.total}
              {showPercent ? <small>{percentage(row.total, total)}%</small> : null}
            </strong>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.max((row.total / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankedRoleList({ rows, total }: { rows: ChartRow[]; total: number }) {
  if (!rows.length) {
    return <div className="empty-state">Sem dados para exibir.</div>;
  }

  const max = Math.max(...rows.map((row) => row.total), 1);

  return (
    <div className="ranked-role-list">
      {rows.map((row, index) => (
        <article key={row.label} className="ranked-role-card">
          <span className="rank-number">{index + 1}</span>
          <strong>{row.label}</strong>
          <div className="rank-meta">
            <span>{row.total}</span>
            <small>{percentage(row.total, total)}%</small>
          </div>
          <div className="rank-track">
            <span style={{ width: `${Math.max((row.total / max) * 100, 8)}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusChart({ rows }: { rows: ChartRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  if (!total) {
    return <div className="empty-state">Sem dados para exibir.</div>;
  }

  const colors = ["#0d63d8", "#f5b700", "#7c5cff", "#0bb885", "#e05050"];
  const gradient = rows
    .map((row, index) => {
      const start = rows
        .slice(0, index)
        .reduce((sum, item) => sum + (item.total / total) * 100, 0);
      const end = start + (row.total / total) * 100;
      return `${colors[index % colors.length]} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div id="statusChart" className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="donut-total">
          <strong>{total}</strong>
          <span>funcionários</span>
        </div>
      </div>
      <div className="legend">
        {rows.map((row, index) => (
          <div key={row.label} className="legend-row">
            <span>
              <i style={{ background: colors[index % colors.length] }} />
              {formatStatusLabel(row.label)}
            </span>
            <strong>
              {row.total}
              <small>{Math.round((row.total / total) * 100)}%</small>
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

type QuickInfo = {
  label: string;
  value: string;
  note: string;
  tone: "blue" | "green" | "purple" | "orange";
  icon: ReactNode;
};

function QuickInfoGrid({ stats }: { stats: QuickInfo[] }) {
  return (
    <div className="quick-info-grid">
      {stats.map((stat) => (
        <article key={stat.label} className={`quick-info-card quick-${stat.tone}`}>
          <span className="quick-icon">{stat.icon}</span>
          <div>
            <small>{stat.label}</small>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function Sparkline({ tone }: { tone: "blue" | "green" | "orange" | "purple" }) {
  return (
    <svg
      className={`metric-sparkline sparkline-${tone}`}
      viewBox="0 0 220 54"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 39 C18 32 22 35 34 28 C48 18 56 44 71 30 C83 19 89 23 99 28 C112 35 123 23 135 30 C147 37 158 44 169 31 C184 14 197 30 218 18"
        fill="none"
        pathLength="1"
      />
      <path
        d="M2 39 C18 32 22 35 34 28 C48 18 56 44 71 30 C83 19 89 23 99 28 C112 35 123 23 135 30 C147 37 158 44 169 31 C184 14 197 30 218 18 L218 54 L2 54 Z"
        pathLength="1"
      />
    </svg>
  );
}

const menuIcons: Record<ViewName, LucideIcon> = {
  dashboard: LayoutDashboard,
  employees: UserRound,
  units: Building2,
  users: Users,
  reports: FileText,
  about: Info,
};

function MenuLink({
  view,
  activeView,
  children,
}: {
  view: ViewName;
  activeView: ViewName;
  children: string;
}) {
  const isActive = activeView === view;
  const Icon = menuIcons[view];

  return (
    <Link
      className={`menu-item${isActive ? " active" : ""}`}
      data-view={view}
      href={`/funcionarios?view=${view}`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={19} aria-hidden="true" />
      {children}
    </Link>
  );
}

function PaginationLink({
  label,
  ariaLabel,
  page,
  filters,
  active = false,
  disabled = false,
}: {
  label: string;
  ariaLabel?: string;
  page: number;
  filters: FuncionarioFilters;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <button type="button" disabled>
        <span className="sr-only">{ariaLabel}</span>
        {label}
      </button>
    );
  }

  return (
    <Link
      className={active ? "active" : undefined}
      href={employeeListHref(filters, page)}
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
    >
      {label}
    </Link>
  );
}

function employeeListHref(filters: FuncionarioFilters, page: number) {
  const params = new URLSearchParams();
  params.set("view", "employees");
  params.set("page", String(page));
  params.set("pageSize", String(filters.pageSize));
  if (filters.search) params.set("search", filters.search);
  if (filters.unidadeId) params.set("unidade_id", filters.unidadeId);
  if (filters.cargo) params.set("cargo", filters.cargo);
  if (filters.status) params.set("status", filters.status);
  return `/funcionarios?${params.toString()}`;
}

function paginationItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function buildQuickStats(data: FuncionariosWorkspaceData): QuickInfo[] {
  const today = new Date();
  const ages = data.employees
    .map((employee) => yearsBetween(employee.nascimento, today))
    .filter((value): value is number => value !== null);
  const serviceTimes = data.employees
    .map((employee) => yearsBetween(employee.admissao, today))
    .filter((value): value is number => value !== null);
  const monthAdmissions = data.employees.filter((employee) =>
    isSameMonth(employee.admissao, today),
  ).length;
  const withoutUnit = data.employees.filter(
    (employee) => normalizeText(employee.unidade_nome || "Sem unidade") === "sem unidade",
  ).length;

  return [
    {
      label: "Média de idade",
      value: ages.length ? `${average(ages)} anos` : "-",
      note: "Idade média dos funcionários",
      tone: "blue",
      icon: <Users size={24} aria-hidden="true" />,
    },
    {
      label: "Tempo médio de serviço",
      value: serviceTimes.length ? `${average(serviceTimes, 1)} anos` : "-",
      note: "Tempo médio na instituição",
      tone: "green",
      icon: <Clock3 size={24} aria-hidden="true" />,
    },
    {
      label: "Admissões no mês",
      value: String(monthAdmissions),
      note: "Novos registros no período",
      tone: "blue",
      icon: <UserPlus size={24} aria-hidden="true" />,
    },
    {
      label: "Sem unidade",
      value: String(withoutUnit),
      note: "Cadastros para revisar",
      tone: "purple",
      icon: <Building2 size={24} aria-hidden="true" />,
    },
  ];
}

function countEmployeesForUnit(
  employees: FuncionarioListItem[],
  unitId: string,
) {
  return employees.filter((employee) => employee.unidade_id === unitId).length;
}

function unitStatusFormValue(status: string | null | undefined) {
  return normalizeText(status || "ativa") === "inativa" ? "inativa" : "ativa";
}

function formatUnitStatus(status: string | null) {
  const normalized = normalizeText(status || "ativa");
  if (normalized === "inativa") return "Inativa";
  if (normalized === "ativa") return "Ativa";
  return status || "Ativa";
}

function formatEmployeeCount(total: number) {
  return `${total} ${total === 1 ? "funcionário" : "funcionários"}`;
}

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function average(values: number[], digits = 0) {
  if (!values.length) return 0;
  const result = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Number(result.toFixed(digits)).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function yearsBetween(value: string | null, today: Date) {
  if (!value) return null;
  const date = parseDate(value);
  if (!date) return null;
  let years = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    years -= 1;
  }
  return years >= 0 && years < 120 ? years : null;
}

function isSameMonth(value: string | null, today: Date) {
  const date = parseDate(value);
  return (
    !!date &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
}

function parseDate(value: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatLastUpdated(date: Date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatusLabel(status: string | null) {
  const normalized = normalizeText(status || "");
  const labels: Record<string, string> = {
    ativo: "Ativo",
    exonerado: "Exonerado",
    licenca: "Licença",
    transferido: "Transferido",
    afastado: "Afastado",
    inicio: "Início",
  };
  return labels[normalized] ?? (status || "Não informado");
}

function formatPersonName(value: string) {
  const lowerWords = new Set(["da", "de", "do", "das", "dos", "e"]);

  return value
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && lowerWords.has(word)
        ? word
        : `${word.charAt(0).toLocaleUpperCase("pt-BR")}${word.slice(1)}`,
    )
    .join(" ");
}

function getUserDisplayName(user: ProfileListItem) {
  const fullName = String(user.full_name ?? "").trim();
  return fullName && normalizeText(fullName) !== normalizeText(user.email)
    ? fullName
    : "Nome não informado";
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return (parts.map((part) => part[0]).join("") || "U").toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function statusClass(status: string) {
  const normalized = normalizeText(status);
  if (normalized === "ativo") return "status-ativo";
  if (normalized === "exonerado") return "status-exonerado";
  if (normalized === "licenca") return "status-licenca";
  if (normalized === "transferido") return "status-transferido";
  if (normalized === "afastado") return "status-afastado";
  return "";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
