import { getCurrentUser } from "@/lib/auth/session";
import { getEmployeeSearchTerm, type EmployeeSuggestion } from "@/lib/funcionarios/search";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const { user, profile, isSupabaseReady } = await getCurrentUser();
  if (!isSupabaseReady) return unavailable();
  if (!user || !profile?.is_active) {
    return Response.json({ error: "Acesso restrito." }, { status: user ? 403 : 401, headers });
  }

  const term = getEmployeeSearchTerm(new URL(request.url).searchParams.get("q") ?? "");
  if (term.length < 2) return Response.json({ results: [] }, { headers });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable();

  // Short prefixes supply usable trigrams where a two-letter substring would not.
  const pattern = term.length === 2 ? `${term}%` : `%${term}%`;
  const { data: employees, error } = await supabase
    .from("funcionarios")
    .select("id,nome,cargo,unidade_id")
    .is("deleted_at", null)
    .ilike("nome", pattern)
    .order("nome")
    .order("id")
    .limit(5)
    .abortSignal(request.signal);

  if (error) return unavailable();

  const unitIds = [...new Set(employees.flatMap(({ unidade_id }) => unidade_id ? [unidade_id] : []))];
  const unitNames = new Map<string, string>();
  if (unitIds.length) {
    const { data: units, error: unitError } = await supabase
      .from("unidades")
      .select("id,nome")
      .in("id", unitIds)
      .abortSignal(request.signal);
    if (unitError) return unavailable();
    units.forEach(({ id, nome }) => unitNames.set(id, nome));
  }

  const results: EmployeeSuggestion[] = employees.map(({ id, nome, cargo, unidade_id }) => ({
    id,
    name: nome,
    role: cargo,
    unit: unidade_id ? unitNames.get(unidade_id) ?? null : null,
  }));
  return Response.json({ results }, { headers });
}

function unavailable() {
  return Response.json({ error: "Não foi possível pesquisar funcionários." }, { status: 503, headers });
}
