import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SystemStatus } from "@/types/domain";

type RegisterAccessLogInput = {
  systemSlug: string;
  status: SystemStatus | null;
  success: boolean;
  userAgent: string | null;
  ipAddress: string | null;
  metadata?: Record<string, string | boolean | null>;
};

export async function registerAccessLog(input: RegisterAccessLogInput) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: true, skipped: true };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("access_logs").insert({
    user_id: user?.id ?? null,
    system_slug: input.systemSlug,
    status: input.status,
    success: input.success,
    user_agent: input.userAgent,
    ip_address: input.ipAddress,
    metadata: input.metadata ?? null,
  });

  if (error) {
    return { ok: false, skipped: false, error: error.message };
  }

  return { ok: true, skipped: false };
}
