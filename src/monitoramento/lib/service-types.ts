export const SERVICE_TYPES = ["cras", "creas", "centro_pop"] as const;
export const EXECUTIVE_EXTRA_SERVICE_TYPES = [
  "complexo_cidadania",
  "gestao_suas",
] as const;
export const EXECUTIVE_SERVICE_TYPES = [
  ...SERVICE_TYPES,
  ...EXECUTIVE_EXTRA_SERVICE_TYPES,
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
export type ExecutiveExtraServiceType =
  (typeof EXECUTIVE_EXTRA_SERVICE_TYPES)[number];
export type ExecutiveServiceType = (typeof EXECUTIVE_SERVICE_TYPES)[number];
export type ServiceTypeFilter = ExecutiveServiceType | "all";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  cras: "PSB",
  creas: "PSE",
  centro_pop: "Centro POP",
};

export const EXECUTIVE_EXTRA_SERVICE_TYPE_LABELS: Record<
  ExecutiveExtraServiceType,
  string
> = {
  complexo_cidadania: "Complexo da cidadania",
  gestao_suas: "Gestão SUAS",
};

export function isServiceType(value: unknown): value is ServiceType {
  return SERVICE_TYPES.includes(value as ServiceType);
}

export function isExecutiveExtraServiceType(
  value: unknown,
): value is ExecutiveExtraServiceType {
  return EXECUTIVE_EXTRA_SERVICE_TYPES.includes(
    value as ExecutiveExtraServiceType,
  );
}

export function normalizeServiceType(
  value: unknown,
  fallback: ServiceType = "cras",
): ServiceType {
  return isServiceType(value) ? value : fallback;
}

export function serviceTypeLabel(value: string | null | undefined): string {
  if (isServiceType(value)) {
    return SERVICE_TYPE_LABELS[value];
  }

  if (isExecutiveExtraServiceType(value)) {
    return EXECUTIVE_EXTRA_SERVICE_TYPE_LABELS[value];
  }

  return "Setor";
}

export function serviceTypeFromFormCode(
  code: string | null | undefined,
): ServiceType {
  if (code?.startsWith("creas-")) {
    return "creas";
  }

  if (code?.startsWith("centro-pop-")) {
    return "centro_pop";
  }

  return "cras";
}
