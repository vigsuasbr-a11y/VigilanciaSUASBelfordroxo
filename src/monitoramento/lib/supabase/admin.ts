import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnvStatus } from "@/monitoramento/lib/env";

export function createSupabaseAdminClient() {
  const env = getPublicEnvStatus();
  const adminKey = process.env.MONITORAMENTO_SUPABASE_SERVICE_ROLE_KEY;

  if (!env.supabaseConfigured || !env.supabaseUrl || !adminKey) {
    return null;
  }

  return createClient(env.supabaseUrl, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
