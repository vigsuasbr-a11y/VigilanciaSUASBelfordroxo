import { fallbackSystems } from "@/config/systems";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PortalSystem } from "@/types/domain";

export async function getSystems(): Promise<PortalSystem[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallbackSystems;
  }

  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return fallbackSystems;
  }

  return data.map((system) => ({
    slug: system.slug,
    name: system.name,
    shortName: system.short_name,
    description: system.description,
    details: system.details,
    iconName: system.icon_name,
    accessType: system.access_type,
    status: system.status,
    url:
      system.slug === "gestao-funcionarios"
        ? "/login?redirectTo=/funcionarios"
        : system.url,
    addressLabel:
      system.slug === "gestao-funcionarios"
        ? "Login protegido /login"
        : system.address_label,
    authorizedAudience:
      system.slug === "gestao-funcionarios"
        ? "Equipe autorizada Vigilância"
        : system.authorized_audience,
    restrictionMessage: system.restriction_message,
    color: system.color,
    sortOrder: system.sort_order,
  }));
}

export async function getSystemBySlug(slug: string) {
  const systems = await getSystems();
  return systems.find((system) => system.slug === slug) ?? null;
}
