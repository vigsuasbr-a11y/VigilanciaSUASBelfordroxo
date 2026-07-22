import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type CurrentProfile =
  Database["public"]["Tables"]["profiles"]["Row"] | null;

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      user: null,
      profile: null as CurrentProfile,
      isSupabaseReady: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null as CurrentProfile,
      isSupabaseReady: true,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile ?? null,
    isSupabaseReady: true,
  };
}
