import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type FuncionarioRow = Database["public"]["Tables"]["funcionarios"]["Row"];
export type UnidadeRow = Database["public"]["Tables"]["unidades"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileListItem = ProfileRow & {
  last_sign_in_at: string | null;
};
export type HistoricoMovimentacaoRow =
  Database["public"]["Tables"]["historico_movimentacoes"]["Row"];

export type FuncionarioFilters = {
  search: string;
  unidadeId: string;
  cargo: string;
  status: string;
  page: number;
  pageSize: number;
};

export type FuncionarioListItem = FuncionarioRow & {
  unidade_nome: string | null;
  unidade_tipo: string | null;
};

export type ChartRow = {
  label: string;
  total: number;
};

export type FuncionariosWorkspaceData = {
  employees: FuncionarioListItem[];
  filteredEmployees: FuncionarioListItem[];
  paginatedEmployees: FuncionarioListItem[];
  units: UnidadeRow[];
  profiles: ProfileListItem[];
  summary: {
    total: number;
    ativos: number;
    exonerados: number;
    unidades: number;
    porUnidade: ChartRow[];
    porCargo: ChartRow[];
    porStatus: ChartRow[];
  };
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    start: number;
    end: number;
  };
  errors: string[];
};

const defaultPageSize = 25;
const allowedPageSizes = new Set([25, 50, 100]);

export function parseFuncionarioFilters(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): FuncionarioFilters {
  const pageSize = Number(readParam(searchParams?.pageSize)) || defaultPageSize;

  return {
    search: readParam(searchParams?.search),
    unidadeId: readParam(searchParams?.unidade_id),
    cargo: readParam(searchParams?.cargo),
    status: readParam(searchParams?.status),
    page: Math.max(Number(readParam(searchParams?.page)) || 1, 1),
    pageSize: allowedPageSizes.has(pageSize) ? pageSize : defaultPageSize,
  };
}

export async function getFuncionariosWorkspaceData(
  supabase: SupabaseClient<Database>,
  filters: FuncionarioFilters,
): Promise<FuncionariosWorkspaceData> {
  const [employeeResult, unitResult, profileResult] = await Promise.all([
    supabase
      .from("funcionarios")
      .select("*")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    supabase.from("unidades").select("*").order("tipo").order("nome"),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const errors = [
    employeeResult.error?.message,
    unitResult.error?.message,
    profileResult.error?.message,
  ].filter(Boolean) as string[];

  const units = unitResult.data ?? [];
  const profiles = await attachAuthAccessMetadata(profileResult.data ?? []);
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const employees = (employeeResult.data ?? []).map((employee) => {
    const unit = employee.unidade_id ? unitsById.get(employee.unidade_id) : null;
    return {
      ...employee,
      unidade_nome: unit?.nome ?? null,
      unidade_tipo: unit?.tipo ?? null,
    };
  });
  const filteredEmployees = filterEmployees(employees, filters);
  const totalPages = Math.max(Math.ceil(filteredEmployees.length / filters.pageSize), 1);
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * filters.pageSize;
  const end = Math.min(start + filters.pageSize, filteredEmployees.length);

  return {
    employees,
    filteredEmployees,
    paginatedEmployees: filteredEmployees.slice(start, end),
    units,
    profiles,
    summary: buildSummary(employees, units),
    pagination: {
      page,
      pageSize: filters.pageSize,
      totalPages,
      start,
      end,
    },
    errors,
  };
}

async function attachAuthAccessMetadata(
  profiles: ProfileRow[],
): Promise<ProfileListItem[]> {
  const admin = createSupabaseAdminClient();

  if (!admin || !profiles.length) {
    return profiles.map((profile) => ({
      ...profile,
      last_sign_in_at: null,
    }));
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return profiles.map((profile) => ({
      ...profile,
      last_sign_in_at: null,
    }));
  }

  const usersById = new Map(data.users.map((user) => [user.id, user]));

  return profiles.map((profile) => ({
    ...profile,
    last_sign_in_at: usersById.get(profile.id)?.last_sign_in_at ?? null,
  }));
}

function filterEmployees(
  employees: FuncionarioListItem[],
  filters: FuncionarioFilters,
) {
  const search = normalizeForSearch(filters.search);
  const cargo = normalizeForSearch(filters.cargo);

  return employees.filter((employee) => {
    if (filters.unidadeId && employee.unidade_id !== filters.unidadeId) {
      return false;
    }

    if (filters.status && employee.status !== filters.status) {
      return false;
    }

    if (cargo && !normalizeForSearch(employee.cargo).includes(cargo)) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      employee.nome,
      employee.cpf,
      employee.cargo,
      employee.setor,
      employee.escolaridade,
      employee.unidade_nome,
    ].some((value) => normalizeForSearch(value).includes(search));
  });
}

function buildSummary(employees: FuncionarioListItem[], units: UnidadeRow[]) {
  return {
    total: employees.length,
    ativos: employees.filter((employee) => employee.status === "Ativo").length,
    exonerados: employees.filter((employee) => employee.status === "Exonerado")
      .length,
    unidades: units.length,
    porUnidade: countBy(
      employees,
      (employee) => employee.unidade_nome || "Sem unidade",
    ),
    porCargo: countBy(employees, (employee) => employee.cargo || "").slice(0, 8),
    porStatus: countBy(employees, (employee) => employee.status || "Sem status"),
  };
}

function countBy<T>(rows: T[], getLabel: (row: T) => string) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const label = getLabel(row).trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, "pt-BR"));
}

function normalizeForSearch(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
