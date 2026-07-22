import type { UserRole } from "@/types/database.types";

export const roleLabels: Record<UserRole, string> = {
  administrador: "Administrador",
  operador: "Operador",
  consulta: "Visualização",
};

export function canAccessAdmin(role?: string | null) {
  return role === "administrador";
}

export function canAccessPanel(role?: string | null) {
  return Boolean(role);
}
