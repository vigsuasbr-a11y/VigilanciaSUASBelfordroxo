import {
  BarChart3,
  Building2,
  ClipboardList,
  Database,
  FileText,
  HousePlus,
  MapPin,
  Megaphone,
  MonitorCheck,
  Target,
  UsersRound,
} from "lucide-react";
import type { IconCard, Notice } from "@/types/domain";

export const institutionalNumbers = [
  {
    label: "CRAS",
    value: "15",
    description: "Unidades acompanhadas",
    icon: Building2,
  },
  {
    label: "CREAS",
    value: "3",
    description: "Proteção Social Especial",
    icon: UsersRound,
  },
  {
    label: "Centro POP",
    value: "1",
    description: "Atendimento especializado",
    icon: BarChart3,
  },
  {
    label: "Acolhimentos",
    value: "3",
    description: "Unidades de acolhimento",
    icon: HousePlus,
  },
  {
    label: "Unidades cadastradas",
    value: "22",
    description: "Equipamentos e setores da SEMASC",
    icon: ClipboardList,
  },
];

export const vigilanciaRoles: IconCard[] = [
  {
    title: "Produção de informações",
    description: "Coleta, consolidação e organização dos dados da rede socioassistencial.",
    icon: Database,
  },
  {
    title: "Monitoramento dos serviços",
    description: "Acompanhamento da oferta, execução e resultados dos serviços.",
    icon: MonitorCheck,
  },
  {
    title: "Análise territorial",
    description: "Leitura das vulnerabilidades, demandas e características dos territórios.",
    icon: MapPin,
  },
  {
    title: "Apoio ao planejamento",
    description: "Subsídios para definição de prioridades, metas e ações.",
    icon: Target,
  },
  {
    title: "Avaliação e indicadores",
    description: "Construção e acompanhamento de indicadores da política pública.",
    icon: BarChart3,
  },
  {
    title: "Disseminação de informações",
    description: "Produção de relatórios, painéis, boletins e materiais técnicos.",
    icon: Megaphone,
  },
];

export const preparedPublications = [
  {
    type: "Relatórios",
    title: "Relatórios de monitoramento",
    description: "Área preparada para receber relatórios técnicos validados pela equipe.",
    status: "Em organização",
    icon: FileText,
  },
  {
    type: "Boletins",
    title: "Boletins socioassistenciais",
    description: "Espaço destinado a boletins e materiais periódicos da Vigilância.",
    status: "Em organização",
    icon: BarChart3,
  },
  {
    type: "Documentos",
    title: "Biblioteca técnica",
    description: "Planos, orientações, formulários e documentos institucionais.",
    status: "Estrutura preparada",
    icon: ClipboardList,
  },
];

export const networkTypes = [
  {
    title: "CRAS",
    description: "Proteção Social Básica e acompanhamento nos territórios.",
  },
  {
    title: "CREAS",
    description: "Proteção Social Especial para famílias e indivíduos em situações de violação de direitos.",
  },
  {
    title: "Centro POP",
    description: "Atendimento especializado à população em situação de rua.",
  },
  {
    title: "Unidades de acolhimento",
    description: "Proteção e acolhimento institucional conforme a necessidade do usuário.",
  },
];

export const fallbackNotices: Notice[] = [
  {
    id: "fallback-1",
    title: "Reunião de alinhamento - Vigilância e CRAS",
    description: "Encontro técnico para alinhamento das informações prioritárias da rede.",
    status: "ativo",
    href: null,
    publishedAt: "2026-07-18T10:00:00.000Z",
    expiresAt: null,
  },
  {
    id: "fallback-2",
    title: "Atualização do Sistema de Monitoramento",
    description: "Novas melhorias estarão disponíveis após validação da equipe técnica.",
    status: "ativo",
    href: null,
    publishedAt: "2026-07-15T09:00:00.000Z",
    expiresAt: null,
  },
];
