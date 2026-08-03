export const PERMISSION_CODES = [
  "dashboard.view",
  "dashboard.executive.view",
  "indicators.view",
  "indicators.manage",
  "units.view",
  "units.manage",
  "competencies.view",
  "competencies.create",
  "competencies.edit_draft",
  "competencies.submit_review",
  "competencies.review",
  "competencies.publish",
  "competencies.reopen",
  "competencies.cancel",
  "users.view",
  "users.manage",
  "reports.view",
  "reports.export",
  "audit.view",
  "settings.manage",
] as const;

export type PermissionCode = (typeof PERMISSION_CODES)[number];

export function hasPermission(permissions: readonly string[], permission: PermissionCode): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: readonly string[], required: readonly PermissionCode[]): boolean {
  return required.some((permission) => hasPermission(permissions, permission));
}

