import type { SupabaseClient } from "@supabase/supabase-js";

import { serviceTypeFromFormCode, type ServiceType } from "@/monitoramento/lib/service-types";
import type { FormVersion } from "@/monitoramento/types/domain";

export const RETIRED_FORM_VERSION_CODES = new Set(["cras-2026-v1"]);

const BASE_FORM_VERSION_COLUMNS =
  "id, code, name, year, version, status, valid_from, valid_until, active, created_at, published_at, archived_at";
const MULTISECTOR_FORM_VERSION_COLUMNS = `${BASE_FORM_VERSION_COLUMNS}, service_type, source_metadata`;

export type FormVersionQueryOptions = {
  activeOnly?: boolean;
  status?: FormVersion["status"];
  serviceType?: ServiceType;
};

export async function listFormVersions(
  supabase: SupabaseClient,
  options: FormVersionQueryOptions = {},
): Promise<FormVersion[]> {
  const withServiceType = await selectFormVersions(supabase, MULTISECTOR_FORM_VERSION_COLUMNS, options);

  if (!withServiceType.missingColumn) {
    return withServiceType.rows.filter(isVisibleFormVersion);
  }

  return (
    await selectFormVersions(supabase, BASE_FORM_VERSION_COLUMNS, options)
  ).rows.filter(isVisibleFormVersion);
}

async function selectFormVersions(
  supabase: SupabaseClient,
  columns: string,
  options: FormVersionQueryOptions,
): Promise<{ rows: FormVersion[]; missingColumn: boolean }> {
  let query = supabase.from("form_versions").select(columns);

  if (columns.includes("service_type")) {
    query = query.order("service_type", { ascending: true });
  }

  query = query.order("year", { ascending: false }).order("version", { ascending: false });

  if (options.activeOnly) {
    query = query.eq("active", true);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.serviceType && columns.includes("service_type")) {
    query = query.eq("service_type", options.serviceType);
  }

  if (options.serviceType && options.serviceType !== "cras" && !columns.includes("service_type")) {
    return { rows: [], missingColumn: false };
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingMultisectorColumns(error)) {
      return { rows: [], missingColumn: true };
    }

    throw new Error("Não foi possível carregar as versões de formulário.");
  }

  return {
    rows: ((data ?? []) as unknown as FormVersion[]).map(normalizeFormVersion),
    missingColumn: false,
  };
}

function isMissingMultisectorColumns(error: { code?: string | null; details?: string | null; hint?: string | null; message?: string }): boolean {
  const message = [error.message, error.details, error.hint].filter(Boolean).join(" ").toLowerCase();

  return (
    error.code === "PGRST204"
    || message.includes("service_type")
    || message.includes("source_metadata")
    || message.includes("schema cache")
  );
}

export function normalizeFormVersion(formVersion: FormVersion): FormVersion {
  return {
    ...formVersion,
    service_type: formVersion.service_type ?? serviceTypeFromFormCode(formVersion.code),
    source_metadata: formVersion.source_metadata ?? {},
  };
}

export function isVisibleFormVersion(formVersion: Pick<FormVersion, "code">): boolean {
  return !RETIRED_FORM_VERSION_CODES.has(formVersion.code);
}
