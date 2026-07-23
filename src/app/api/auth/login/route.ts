import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
  redirectTo?: unknown;
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

function applyCookies(response: NextResponse, pendingCookies: PendingCookie[]) {
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}

function getSafeRedirectTo(value: unknown) {
  const redirectTo = typeof value === "string" ? value : "";

  if (!redirectTo.startsWith("/funcionarios")) {
    return "/funcionarios";
  }

  if (redirectTo.startsWith("//") || redirectTo.includes("://")) {
    return "/funcionarios";
  }

  return redirectTo;
}

function finishLoginRequest(
  request: NextRequest,
  expectsJson: boolean,
  body: { ok: boolean; message?: string },
  status: number,
  pendingCookies: PendingCookie[],
  redirectTo: string,
) {
  if (expectsJson) {
    return loginResponse(body, status, pendingCookies);
  }

  const target = body.ok
    ? redirectTo
    : `/login?redirectTo=${encodeURIComponent(redirectTo)}&error=login`;
  const response = NextResponse.redirect(new URL(target, request.url), 303);

  return applyCookies(response, pendingCookies);
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const expectsJson = contentType.includes("application/json");

  if (!isSupabaseConfigured()) {
    return finishLoginRequest(
      request,
      expectsJson,
      {
        ok: false,
        message: "Configure a conexão de acesso antes de entrar no módulo.",
      },
      503,
      [],
      "/funcionarios",
    );
  }

  const body = expectsJson
    ? ((await request.json().catch(() => ({}))) as LoginPayload)
    : Object.fromEntries(await request.formData()) as LoginPayload;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const redirectTo = getSafeRedirectTo(body.redirectTo);

  if (!email.includes("@")) {
    return finishLoginRequest(
      request,
      expectsJson,
      {
        ok: false,
        message: "Informe o e-mail autorizado para acessar o sistema.",
      },
      400,
      [],
      redirectTo,
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
    return finishLoginRequest(
      request,
      expectsJson,
      {
        ok: false,
        message: "Usuário ou senha inválidos.",
      },
      401,
      pendingCookies,
      redirectTo,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    await supabase.auth.signOut();

    return finishLoginRequest(
      request,
      expectsJson,
      {
        ok: false,
        message: "Usuário sem perfil ativo. Procure um administrador.",
      },
      403,
      pendingCookies,
      redirectTo,
    );
  }

  return finishLoginRequest(
    request,
    expectsJson,
    { ok: true },
    200,
    pendingCookies,
    redirectTo,
  );
}
