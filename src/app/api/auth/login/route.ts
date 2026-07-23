import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function loginResponse(
  body: { ok: boolean; message?: string },
  status: number,
  pendingCookies: PendingCookie[] = [],
) {
  const response = NextResponse.json(body, { status });

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return loginResponse(
      {
        ok: false,
        message: "Configure a conexão de acesso antes de entrar no módulo.",
      },
      503,
    );
  }

  const body = (await request.json().catch(() => ({}))) as LoginPayload;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email.includes("@")) {
    return loginResponse(
      {
        ok: false,
        message: "Informe o e-mail autorizado para acessar o sistema.",
      },
      400,
    );
  }

  const pendingCookies: PendingCookie[] = [];
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return loginResponse(
      {
        ok: false,
        message: "Usuário ou senha inválidos.",
      },
      401,
      pendingCookies,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();

    return loginResponse(
      {
        ok: false,
        message: "Usuário sem perfil ativo. Procure um administrador.",
      },
      403,
      pendingCookies,
    );
  }

  return loginResponse({ ok: true }, 200, pendingCookies);
}
