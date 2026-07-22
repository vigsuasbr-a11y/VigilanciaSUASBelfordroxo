import { fallbackNotices } from "@/config/home-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Notice } from "@/types/domain";

export async function getActiveNotices(limit = 3): Promise<Notice[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallbackNotices.slice(0, limit);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("status", "ativo")
    .lte("published_at", now)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return fallbackNotices.slice(0, limit);
  }

  return data.map((notice) => ({
    id: notice.id,
    title: notice.title,
    description: notice.description,
    status: notice.status,
    href: notice.href,
    publishedAt: notice.published_at,
    expiresAt: notice.expires_at,
  }));
}
