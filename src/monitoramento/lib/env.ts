import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_MONITORAMENTO_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_MONITORAMENTO_SUPABASE_ANON_KEY: z.string().min(1).optional().or(z.literal("")),
  NEXT_PUBLIC_MONITORAMENTO_APP_NAME: z.string().min(1).default("Sistema de Monitoramento Socioassistencial"),
  NEXT_PUBLIC_MONITORAMENTO_APP_URL: z.string().url().optional().or(z.literal("")),
});

export type PublicEnvStatus = {
  appName: string;
  appUrl: string | null;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseConfigured: boolean;
  errors: string[];
};

export function getPublicEnvStatus(): PublicEnvStatus {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_MONITORAMENTO_SUPABASE_URL: process.env.NEXT_PUBLIC_MONITORAMENTO_SUPABASE_URL,
    NEXT_PUBLIC_MONITORAMENTO_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_MONITORAMENTO_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MONITORAMENTO_APP_NAME: process.env.NEXT_PUBLIC_MONITORAMENTO_APP_NAME,
    NEXT_PUBLIC_MONITORAMENTO_APP_URL: process.env.NEXT_PUBLIC_MONITORAMENTO_APP_URL,
  });

  if (!parsed.success) {
    return {
      appName: "Sistema de Monitoramento Socioassistencial",
      appUrl: null,
      supabaseUrl: null,
      supabaseAnonKey: null,
      supabaseConfigured: false,
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const supabaseUrl = parsed.data.NEXT_PUBLIC_MONITORAMENTO_SUPABASE_URL || null;
  const supabaseAnonKey = parsed.data.NEXT_PUBLIC_MONITORAMENTO_SUPABASE_ANON_KEY || null;

  return {
    appName: parsed.data.NEXT_PUBLIC_MONITORAMENTO_APP_NAME,
    appUrl: parsed.data.NEXT_PUBLIC_MONITORAMENTO_APP_URL || null,
    supabaseUrl,
    supabaseAnonKey,
    supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    errors: [],
  };
}

