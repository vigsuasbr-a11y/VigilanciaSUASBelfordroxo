"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  FilterX,
  MapPin,
  Plus,
  Search,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { DocumentLink as Link } from "@/components/funcionarios/document-link";
import { UnitActionsMenu } from "@/components/funcionarios/unit-actions-menu";
import type {
  FuncionarioListItem,
  UnidadeRow,
} from "@/services/funcionarios";

type UnitsClientViewProps = {
  units: UnidadeRow[];
  employees: FuncionarioListItem[];
  canManage: boolean;
};

type UnitListRow = {
  unit: UnidadeRow;
  employeeCount: number;
};

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZES = [10, 25, 50];

export function UnitsClientView({
  units,
  employees,
  canManage,
}: UnitsClientViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const employeeCountByUnit = useMemo(() => {
    const counts = new Map<string, number>();

    for (const employee of employees) {
      if (!employee.unidade_id) continue;
      counts.set(employee.unidade_id, (counts.get(employee.unidade_id) ?? 0) + 1);
    }

    return counts;
  }, [employees]);

  const rows = useMemo<UnitListRow[]>(() => {
    return units
      .map((unit) => ({
        unit,
        employeeCount: employeeCountByUnit.get(unit.id) ?? 0,
      }))
      .sort((a, b) => a.unit.nome.localeCompare(b.unit.nome, "pt-BR"));
  }, [employeeCountByUnit, units]);

  const typeOptions = useMemo(() => {
    return Array.from(new Set(units.map((unit) => unit.tipo).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [units]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(units.map((unit) => statusKey(unit.status))))
      .sort((a, b) => formatUnitStatus(a).localeCompare(formatUnitStatus(b), "pt-BR"));
  }, [units]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = normalizeForSearch(search);

    return rows.filter(({ unit }) => {
      if (typeFilter && unit.tipo !== typeFilter) return false;
      if (statusFilter && statusKey(unit.status) !== statusFilter) return false;

      if (!normalizedSearch) return true;

      return [
        unit.nome,
        unit.tipo,
        unit.status,
        unit.endereco,
        unit.coordenador,
        unit.telefone,
      ].some((value) => normalizeForSearch(value).includes(normalizedSearch));
    });
  }, [rows, search, statusFilter, typeFilter]);

  const totalPages = Math.max(Math.ceil(filteredRows.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRows.length);
  const visibleRows = filteredRows.slice(startIndex, endIndex);
  const hasFilters = Boolean(search || typeFilter || statusFilter);
  const activeUnits = rows.filter(({ unit }) => statusKey(unit.status) === "ativa").length;
  const linkedEmployees = Array.from(employeeCountByUnit.values()).reduce(
    (sum, total) => sum + total,
    0,
  );
  const unitsWithoutCoordinator = rows.filter(
    ({ unit }) => !String(unit.coordenador ?? "").trim(),
  ).length;

  function resetFilters() {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setPage(1);
  }

  return (
    <div className="units-shell">
      <section className="units-metric-grid" aria-label="Indicadores de unidades">
        <UnitMetricCard
          icon={<Building2 size={24} aria-hidden="true" />}
          label="Total de unidades"
          value={units.length}
          note="equipamentos cadastrados"
          tone="blue"
        />
        <UnitMetricCard
          icon={<BadgeCheck size={24} aria-hidden="true" />}
          label="Unidades ativas"
          value={activeUnits}
          note={`${percentage(activeUnits, units.length)}% do cadastro`}
          tone="green"
        />
        <UnitMetricCard
          icon={<UsersRound size={24} aria-hidden="true" />}
          label="Funcionários vinculados"
          value={linkedEmployees}
          note="profissionais com unidade"
          tone="purple"
        />
        <UnitMetricCard
          icon={<UserRoundX size={24} aria-hidden="true" />}
          label="Sem coordenador"
          value={unitsWithoutCoordinator}
          note="unidades para revisar"
          tone="orange"
        />
      </section>

      <section className="units-filter-panel" aria-labelledby="unitsFilterTitle">
        <div className="units-filter-heading">
          <div>
            <h2 id="unitsFilterTitle">Filtros de busca</h2>
            <p>Consulte por dados reais cadastrados na base de unidades.</p>
          </div>
          {hasFilters ? (
            <button className="ghost-action units-clear-button" type="button" onClick={resetFilters}>
              <FilterX size={15} aria-hidden="true" />
              Limpar filtros
            </button>
          ) : null}
        </div>

        <div className="units-filter-grid">
          <label className="filter-search units-search-field">
            <span>Buscar</span>
            <span className="filter-search-field">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Busque por nome, tipo, endereço ou coordenador"
              />
              <Search size={18} aria-hidden="true" />
            </span>
          </label>

          <label>
            <span>Tipo</span>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos os tipos</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
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
              <option value="">Todas as situações</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatUnitStatus(status)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="units-table-panel" aria-labelledby="unitsListTitle">
        <div className="units-list-heading">
          <div>
            <p className="eyebrow">Unidades</p>
            <h2 id="unitsListTitle">Unidades cadastradas</h2>
            <span>
              Mostrando {filteredRows.length} de {units.length} unidade
              {units.length === 1 ? "" : "s"}.
            </span>
          </div>
          <div className="units-list-actions">
            <span className="result-count">
              {filteredRows.length} registro{filteredRows.length === 1 ? "" : "s"}
            </span>
            <label className="units-page-size">
              <span>Itens por página</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            {canManage ? (
              <Link className="primary-action units-inline-action" href="/funcionarios?view=units&modal=unit">
                <Plus size={16} aria-hidden="true" />
                Nova unidade
              </Link>
            ) : null}
          </div>
        </div>

        <div className="units-table-scroll">
          <table className="units-table">
            <thead>
              <tr>
                <th scope="col">Unidade</th>
                <th scope="col">Tipo</th>
                <th scope="col">Coordenador</th>
                <th scope="col">Funcionários vinculados</th>
                <th scope="col">Endereço</th>
                <th scope="col">Situação</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length ? (
                visibleRows.map(({ unit, employeeCount }) => (
                  <UnitTableRow
                    key={unit.id}
                    unit={unit}
                    employeeCount={employeeCount}
                    canManage={canManage}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <UnitEmptyState canManage={canManage} hasFilters={hasFilters} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="unit-card-grid" aria-label="Unidades cadastradas em cartões">
          {visibleRows.length ? (
            visibleRows.map(({ unit, employeeCount }) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                employeeCount={employeeCount}
                canManage={canManage}
              />
            ))
          ) : (
            <UnitEmptyState canManage={canManage} hasFilters={hasFilters} />
          )}
        </div>

        <div className="units-pagination">
          <span>
            {filteredRows.length
              ? `Mostrando ${startIndex + 1} a ${endIndex} de ${filteredRows.length}`
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
    </div>
  );
}

function UnitTableRow({
  unit,
  employeeCount,
  canManage,
}: {
  unit: UnidadeRow;
  employeeCount: number;
  canManage: boolean;
}) {
  return (
    <tr>
      <td>
        <div className="unit-name-cell">
          <span className="unit-avatar">
            <Building2 size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>{unit.nome}</strong>
            <small>{unit.sigla || "Cadastro sem sigla"}</small>
          </div>
        </div>
      </td>
      <td>
        <span className="unit-type-badge">{unit.tipo}</span>
      </td>
      <td>{unit.coordenador || "Sem coordenador"}</td>
      <td>
        <Link className="unit-linked-count" href={`/funcionarios?view=employees&unidade_id=${unit.id}`}>
          <UsersRound size={15} aria-hidden="true" />
          {formatEmployeeCount(employeeCount)}
        </Link>
      </td>
      <td>
        <span className="unit-address">
          <MapPin size={14} aria-hidden="true" />
          {unit.endereco || "Endereço não informado"}
        </span>
      </td>
      <td>
        <span className={`unit-status-badge status-${statusKey(unit.status)}`}>
          {formatUnitStatus(unit.status)}
        </span>
      </td>
      <td>
        <UnitActionsMenu
          unitId={unit.id}
          unitName={unit.nome}
          employeeCount={employeeCount}
          canManage={canManage}
        />
      </td>
    </tr>
  );
}

function UnitCard({
  unit,
  employeeCount,
  canManage,
}: {
  unit: UnidadeRow;
  employeeCount: number;
  canManage: boolean;
}) {
  return (
    <article className="unit-card">
      <div className="unit-card-top">
        <div className="unit-name-cell">
          <span className="unit-avatar">
            <Building2 size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>{unit.nome}</strong>
            <small>{unit.tipo}</small>
          </div>
        </div>
        <UnitActionsMenu
          unitId={unit.id}
          unitName={unit.nome}
          employeeCount={employeeCount}
          canManage={canManage}
        />
      </div>
      <div className="unit-card-details">
        <span>
          <strong>Coordenador</strong>
          {unit.coordenador || "Sem coordenador"}
        </span>
        <span>
          <strong>Funcionários</strong>
          <Link href={`/funcionarios?view=employees&unidade_id=${unit.id}`}>
            {formatEmployeeCount(employeeCount)}
          </Link>
        </span>
        <span>
          <strong>Contato</strong>
          {unit.telefone || "Sem telefone"}
        </span>
        <span>
          <strong>Situação</strong>
          <span className={`unit-status-badge status-${statusKey(unit.status)}`}>
            {formatUnitStatus(unit.status)}
          </span>
        </span>
      </div>
      <p>
        <MapPin size={14} aria-hidden="true" />
        {unit.endereco || "Endereço não informado"}
      </p>
    </article>
  );
}

function UnitMetricCard({
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
  tone: "blue" | "green" | "orange" | "purple";
}) {
  return (
    <article className={`unit-metric-card unit-metric-${tone}`}>
      <span className="unit-metric-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function UnitEmptyState({
  canManage,
  hasFilters,
}: {
  canManage: boolean;
  hasFilters: boolean;
}) {
  return (
    <div className="unit-empty-state">
      <Building2 size={24} aria-hidden="true" />
      <strong>
        {hasFilters ? "Nenhuma unidade encontrada" : "Nenhuma unidade cadastrada"}
      </strong>
      <span>
        {hasFilters
          ? "Revise os filtros aplicados para ampliar a consulta."
          : "Cadastre a primeira unidade para organizar os vínculos dos funcionários."}
      </span>
      {canManage && !hasFilters ? (
        <Link className="primary-action" href="/funcionarios?view=units&modal=unit">
          <Plus size={16} aria-hidden="true" />
          Nova unidade
        </Link>
      ) : null}
    </div>
  );
}

function normalizeForSearch(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function statusKey(status: string | null) {
  const normalized = normalizeForSearch(status || "ativa").replace(/\s+/g, "-");
  return normalized || "ativa";
}

function formatUnitStatus(status: string | null) {
  const key = statusKey(status);

  if (key === "ativa") return "Ativa";
  if (key === "inativa") return "Inativa";

  return key
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatEmployeeCount(total: number) {
  return `${total} ${total === 1 ? "funcionário" : "funcionários"}`;
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
