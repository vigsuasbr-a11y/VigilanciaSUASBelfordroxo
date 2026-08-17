import { NextResponse } from "next/server";

import { getPublicEnvStatus } from "@/monitoramento/lib/env";
import { createSupabaseAdminClient } from "@/monitoramento/lib/supabase/admin";

export async function GET() {
  const env = getPublicEnvStatus();

  if (!env.supabaseConfigured) {
    return NextResponse.json(
      {
        status: "missing_env",
        system: "monitoramento-socioassistencial",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 503,
      },
    );
  }

  const admin = createSupabaseAdminClient();

  if (!admin) {
    return NextResponse.json(
      {
        status: "partial",
        system: "monitoramento-socioassistencial",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const { error } = await admin
    .from("form_versions")
    .select("id", { count: "exact", head: true })
    .limit(1);

  if (error) {
    return NextResponse.json(
      {
        status: "query_failed",
        system: "monitoramento-socioassistencial",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 503,
      },
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      system: "monitoramento-socioassistencial",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
