import { getPublicEnvStatus } from "@/monitoramento/lib/env";
import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import { getIndicatorStats } from "@/monitoramento/services/indicators";
import { listUnits } from "@/monitoramento/services/units";

export type DiagnosticSnapshot = {
  environment: string;
  appVersion: string;
  supabaseConfigured: boolean;
  supabaseConnection: "configured" | "missing_env" | "query_failed";
  units: number;
  groups: number;
  indicators: number;
  featuredIndicators: number;
  activeFormVersion: string | null;
  lastMigration: string | null;
  status: "ok" | "needs_configuration" | "attention";
};

export async function getDiagnosticSnapshot(): Promise<DiagnosticSnapshot> {
  const env = getPublicEnvStatus();
  const supabase = await createSupabaseServerClient();
  const packageVersion = process.env.npm_package_version ?? "0.2.0";

  if (!env.supabaseConfigured || !supabase) {
    return {
      environment: process.env.NODE_ENV,
      appVersion: packageVersion,
      supabaseConfigured: false,
      supabaseConnection: "missing_env",
      units: 0,
      groups: 0,
      indicators: 0,
      featuredIndicators: 0,
      activeFormVersion: null,
      lastMigration: null,
      status: "needs_configuration",
    };
  }

  try {
    const [units, stats] = await Promise.all([listUnits(), getIndicatorStats()]);

    return {
      environment: process.env.NODE_ENV,
      appVersion: packageVersion,
      supabaseConfigured: true,
      supabaseConnection: "configured",
      units: units.length,
      groups: stats.groups,
      indicators: stats.indicators,
      featuredIndicators: stats.featuredIndicators,
      activeFormVersion: stats.activeFormVersion?.code ?? null,
      lastMigration: "015_multisector_support.sql",
      status: "ok",
    };
  } catch {
    return {
      environment: process.env.NODE_ENV,
      appVersion: packageVersion,
      supabaseConfigured: true,
      supabaseConnection: "query_failed",
      units: 0,
      groups: 0,
      indicators: 0,
      featuredIndicators: 0,
      activeFormVersion: null,
      lastMigration: "015_multisector_support.sql",
      status: "attention",
    };
  }
}
