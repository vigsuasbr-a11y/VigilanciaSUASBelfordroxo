import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import type { AuditLog } from "@/monitoramento/types/domain";

export async function listAuditLogs(limit = 80): Promise<AuditLog[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, user_id, action, entity_type, entity_id, unit_id, competency_id, indicator_id, old_value, new_value, reason, session_identifier, ip_address, user_agent, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Não foi possível carregar a auditoria.");
  }

  return (data ?? []) as AuditLog[];
}

