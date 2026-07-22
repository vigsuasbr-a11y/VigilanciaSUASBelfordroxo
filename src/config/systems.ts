import type { PortalSystem } from "@/types/domain";

const monitoringSystemUrl =
  process.env.NEXT_PUBLIC_MONITORING_SYSTEM_URL?.trim() || "/monitoramento";

export const fallbackSystems: PortalSystem[] = [
  {
    slug: "gestao-funcionarios",
    name: "Gestão de Funcionários",
    shortName: "Funcionários",
    description:
      "Cadastro, lotação, situação funcional, vínculos, afastamentos, exonerações e histórico dos profissionais da SEMASC.",
    details: [
      "Cadastro completo dos profissionais",
      "Lotação, vínculos e situação funcional",
      "Histórico de afastamentos e exonerações",
      "Login próprio do Sistema de Funcionários",
    ],
    iconName: "users",
    accessType: "Sistema restrito com login próprio",
    status: "operacional",
    url: "/login?redirectTo=/funcionarios",
    addressLabel: "Login protegido /login",
    authorizedAudience: "Equipe autorizada Vigilância",
    restrictionMessage: "Acesso restrito a usuários autenticados e ativos.",
    color: "blue",
    sortOrder: 1,
  },
  {
    slug: "monitoramento-socioassistencial",
    name: "Monitoramento Socioassistencial",
    shortName: "Monitoramento",
    description:
      "Acompanhamento de indicadores, metas, atividades, unidades, prazos, pendências e relatórios da rede socioassistencial.",
    details: [
      "Indicadores e metas da rede",
      "Acompanhamento de unidades e atividades",
      "Pendências, prazos e relatórios",
      "Módulo preparado para evolução futura",
    ],
    iconName: "chart",
    accessType: "Módulo web planejado",
    status: "em_desenvolvimento",
    url: monitoringSystemUrl,
    addressLabel:
      monitoringSystemUrl === "/monitoramento"
        ? "Rota interna /monitoramento"
        : "Configurado por NEXT_PUBLIC_MONITORING_SYSTEM_URL",
    authorizedAudience: "Gestores, técnicos e equipes autorizadas",
    restrictionMessage:
      "O módulo está em desenvolvimento e será liberado após validação.",
    color: "green",
    sortOrder: 2,
  },
];
