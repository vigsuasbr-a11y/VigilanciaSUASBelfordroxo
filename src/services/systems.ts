import { fallbackSystems } from "@/config/systems";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PortalSystem } from "@/types/domain";

const internalSystemOverrides = new Map(
  fallbackSystems.map((system) => [system.slug, system]),
);

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

  return data.map((system) => {
    const mappedSystem: PortalSystem = {
      slug: system.slug,
      name: system.name,
      shortName: system.short_name,
      description: system.description,
      details: system.details,
      iconName: system.icon_name,
      accessType: system.access_type,
      status: system.status,
      url: system.url,
      addressLabel: system.address_label,
      authorizedAudience: system.authorized_audience,
      restrictionMessage: system.restriction_message,
      color: system.color,
      sortOrder: system.sort_order,
    };

    const override = internalSystemOverrides.get(system.slug);

    if (!override) {
      return mappedSystem;
    }

    return {
      ...mappedSystem,
      accessType: override.accessType,
      addressLabel: override.addressLabel,
      authorizedAudience: override.authorizedAudience,
      details: override.details,
      restrictionMessage: override.restrictionMessage,
      status: override.status,
      url: override.url,
    };
  });
}

export async function getSystemBySlug(slug: string) {
  const systems = await getSystems();
  return systems.find((system) => system.slug === slug) ?? null;
}
