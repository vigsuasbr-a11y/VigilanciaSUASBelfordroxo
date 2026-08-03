"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/monitoramento/lib/supabase/server";

export type LoginErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "UNAUTHORIZED"
  | "SERVER_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export type LoginResult =
  | {
      success: true;
      redirectTo: string;
    }
  | {
      success: false;
      code: LoginErrorCode;
    };

export async function signInAction(formData: FormData): Promise<LoginResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { success: false, code: "SERVER_UNAVAILABLE" };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") ?? "/monitoramento/inicio"),
  );

  if (!isValidEmail(email) || password.length < 1 || password.length > 256) {
    return { success: false, code: "VALIDATION_ERROR" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { success: false, code: "INVALID_CREDENTIALS" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      return { success: false, code: "UNAUTHORIZED" };
    }

    if (!profile.active) {
      await supabase.auth.signOut();
      return { success: false, code: "ACCOUNT_DISABLED" };
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", data.user.id)
      .limit(1);

    if (!roles?.length) {
      await supabase.auth.signOut();
      return { success: false, code: "UNAUTHORIZED" };
    }

    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id);

    return { success: true, redirectTo };
  } catch {
    return { success: false, code: "UNKNOWN_ERROR" };
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/monitoramento/login?status=logout");
}

function sanitizeRedirectPath(value: string): string {
  if (
    !value.startsWith("/") ||
    !value.startsWith("/monitoramento") ||
    value.startsWith("//")
  ) {
    return "/monitoramento/inicio";
  }

  return value;
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
