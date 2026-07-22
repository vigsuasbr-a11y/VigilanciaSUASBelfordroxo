import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  FuncionariosWorkspace,
  type ViewName,
} from "@/components/funcionarios/funcionarios-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getFuncionariosWorkspaceData,
  parseFuncionarioFilters,
  type HistoricoMovimentacaoRow,
} from "@/services/funcionarios";

export const metadata: Metadata = {
  title: "Sistema de Funcionários",
};

export const dynamic = "force-dynamic";

type FuncionariosPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const validViews: ViewName[] = ["dashboard", "employees", "units", "users", "reports", "about"];

export default async function FuncionariosPage({
  searchParams,
}: FuncionariosPageProps) {
  const params = await searchParams;
  const { user, profile, isSupabaseReady } = await getCurrentUser();

  if (!isSupabaseReady || !user) {
    redirect("/login?redirectTo=/funcionarios");
  }

  if (!profile?.is_active) {
    redirect("/acesso-negado?from=/funcionarios");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/funcionarios");
  }

  const filters = parseFuncionarioFilters(params);
  const requestedView = readParam(params?.view);
  const modal = readParam(params?.modal);
  const employeeId = readParam(params?.id);
  const unitId = readParam(params?.unitId);
  const userId = readParam(params?.userId);
  const activeView = validViews.includes(requestedView as ViewName)
    ? (requestedView as ViewName)
    : "dashboard";
  const data = await getFuncionariosWorkspaceData(supabase, filters);
  const selectedEmployee = employeeId
    ? data.employees.find((employee) => employee.id === employeeId) ?? null
    : null;
  const selectedUnit = unitId
    ? data.units.find((unit) => unit.id === unitId) ?? null
    : null;
  const selectedProfile = userId
    ? data.profiles.find((item) => item.id === userId) ?? null
    : null;
  const history =
    modal === "history" && selectedEmployee
      ? await getHistory(supabase, selectedEmployee.id)
      : [];

  return (
    <FuncionariosWorkspace
      data={data}
      filters={filters}
      activeView={activeView}
      profile={profile}
      notice={noticeMessage(readParam(params?.notice))}
      dialog={{
        kind: dialogKind(modal, selectedEmployee, selectedUnit, selectedProfile),
        employee: selectedEmployee,
        unit: selectedUnit,
        user: selectedProfile,
        history,
      }}
    />
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function getHistory(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  employeeId: string,
): Promise<HistoricoMovimentacaoRow[]> {
  const { data } = await supabase
    .from("historico_movimentacoes")
    .select("*")
    .eq("funcionario_id", employeeId)
    .order("data_movimentacao", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

function dialogKind(
  modal: string,
  selectedEmployee: unknown,
  selectedUnit: unknown,
  selectedProfile: unknown,
) {
  if (modal === "employee") return "employee";
  if (modal === "history" && selectedEmployee) return "history";
  if (modal === "deleteEmployee" && selectedEmployee) return "deleteEmployee";
  if (modal === "unit") return "unit";
  if (modal === "unitDetails" && selectedUnit) return "unitDetails";
  if (modal === "deleteUnit" && selectedUnit) return "deleteUnit";
  if (modal === "user") return "user";
  if (modal === "userDetails" && selectedProfile) return "userDetails";
  if (modal === "changeUserRole" && selectedProfile) return "changeUserRole";
  if (modal === "deactivateUser" && selectedProfile) return "deactivateUser";
  if (modal === "reactivateUser" && selectedProfile) return "reactivateUser";
  if (modal === "changePassword" && selectedProfile) return "changePassword";
  return "none";
}

function noticeMessage(code: string) {
  const messages: Record<string, string> = {
    "funcionario-salvo": "Funcionário salvo com sucesso.",
    "funcionario-excluido": "Funcionário arquivado e removido da lista ativa.",
    "funcionario-nao-encontrado": "Funcionário não encontrado.",
    "erro-salvar-funcionario": "Não foi possível salvar o funcionário. Revise os campos e tente novamente.",
    "erro-criar-funcionario": "Não foi possível concluir o cadastro. Tente novamente.",
    "erro-excluir-funcionario": "Não foi possível arquivar o funcionário. Tente novamente.",
    "nome-obrigatorio": "Informe o nome completo do funcionário.",
    "unidade-salva": "Unidade salva com sucesso.",
    "unidade-excluida": "Unidade excluída com sucesso.",
    "unidade-em-uso": "Não é possível excluir uma unidade vinculada a funcionários.",
    "unidade-obrigatoria": "Informe nome e tipo da unidade.",
    "unidade-nao-encontrada": "Unidade não encontrada.",
    "erro-salvar-unidade": "Não foi possível salvar a unidade. Tente novamente.",
    "erro-excluir-unidade": "Não foi possível excluir a unidade. Tente novamente.",
    "usuario-criado": "Usuário criado. O novo acesso foi cadastrado com sucesso.",
    "usuario-atualizado": "Alterações salvas. As informações do usuário foram atualizadas.",
    "perfil-alterado": "Perfil alterado. As permissões do usuário foram atualizadas.",
    "usuario-desativado": "Acesso desativado. O usuário não poderá mais entrar no sistema.",
    "usuario-reativado": "Acesso reativado. O usuário pode acessar o sistema novamente.",
    "senha-atualizada": "Senha atualizada com sucesso. O usuário já pode entrar com a nova senha.",
    "usuario-nome-obrigatorio": "Informe o nome completo.",
    "usuario-email-invalido": "Digite um e-mail válido.",
    "usuario-perfil-obrigatorio": "Selecione um perfil de acesso.",
    "usuario-senhas-diferentes": "As senhas não coincidem.",
    "usuario-senha-fraca": "A senha não atende aos requisitos mínimos.",
    "usuario-email-existente": "Este e-mail já está cadastrado.",
    "usuario-nao-encontrado": "Usuário não encontrado.",
    "ultimo-admin": "Não é possível remover este acesso administrativo. O sistema precisa manter pelo menos um administrador ativo.",
    "autoalteracao-confirmacao": "Você está alterando seu próprio acesso. Confirme a ação antes de continuar.",
    "config-admin-ausente": "Esta ação exige configuração administrativa segura do Supabase no servidor.",
    "erro-criar-usuario": "Não foi possível criar o usuário. Verifique os dados e tente novamente.",
    "erro-atualizar-usuario": "Não foi possível atualizar o usuário. Tente novamente.",
    "erro-alterar-perfil": "Não foi possível alterar o perfil. Tente novamente.",
    "erro-desativar-usuario": "Não foi possível desativar o acesso. Tente novamente.",
    "erro-reativar-usuario": "Não foi possível reativar o acesso. Tente novamente.",
    "erro-alterar-senha": "Não foi possível alterar a senha. Tente novamente.",
    "acesso-restrito": "Você não possui permissão para realizar esta ação.",
  };

  return messages[code] ?? "";
}
