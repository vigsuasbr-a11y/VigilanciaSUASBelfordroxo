import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getPublicEnvStatus } from "@/monitoramento/lib/env";

export async function createSupabaseServerClient() {
  const env = getPublicEnvStatus();

  if (!env.supabaseConfigured || !env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot always set cookies; middleware refreshes the session.
        }
      },
    },
  });
}

