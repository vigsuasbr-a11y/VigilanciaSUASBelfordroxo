import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";
import type { Unit } from "@/monitoramento/types/domain";

export async function listUnits(): Promise<Unit[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("units")
    .select(
      "id, code, roman_number, name, full_name, acronym, unit_type, display_order, active, created_at, updated_at, deactivated_at",
    )
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar as unidades.");
  }

  return (data ?? []) as Unit[];
}

