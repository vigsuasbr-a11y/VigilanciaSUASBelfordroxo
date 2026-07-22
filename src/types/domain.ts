import type { LucideIcon } from "lucide-react";

export type SystemStatus =
  | "operacional"
  | "manutencao"
  | "indisponivel"
  | "em_desenvolvimento";

export type SystemColor = "blue" | "green";

export type PortalSystem = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  details: string[];
  iconName: "users" | "chart";
  accessType: string;
  status: SystemStatus;
  url: string | null;
  addressLabel: string;
  authorizedAudience: string;
  restrictionMessage: string;
  color: SystemColor;
  sortOrder: number;
};

export type Notice = {
  id: string;
  title: string;
  description: string;
  status: "ativo" | "rascunho" | "arquivado";
  href: string | null;
  publishedAt: string;
  expiresAt: string | null;
};

export type IconCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};
