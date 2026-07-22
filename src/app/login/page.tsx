/* eslint-disable @next/next/no-css-tags */
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  BarChart3,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { EmployeeLoginForm } from "@/components/funcionarios/employee-login-form";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login - Sistema de Funcionários",
};

export const dynamic = "force-dynamic";

const loginFeatures = [
  {
    title: "Acesso seguro",
    description: "Proteção de dados e autenticação para usuários autorizados.",
    icon: ShieldCheck,
  },
  {
    title: "Gestão eficiente",
    description: "Controle de perfis, permissões e responsabilidades.",
    icon: UsersRound,
  },
  {
    title: "Monitoramento",
    description: "Acompanhamento de acessos e atividades do sistema.",
    icon: BarChart3,
  },
];

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSafeRedirectTo(value: string | string[] | undefined) {
  const redirectTo = Array.isArray(value) ? value[0] : value;

  if (!redirectTo?.startsWith("/funcionarios")) {
    return "/funcionarios";
  }

  if (redirectTo.startsWith("//") || redirectTo.includes("://")) {
    return "/funcionarios";
  }

  return redirectTo;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const isReady = isSupabaseConfigured();
  const params = await searchParams;
  const redirectTo = getSafeRedirectTo(params?.redirectTo);

  if (isReady) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase!.auth.getUser();

    if (user) {
      const { data: profile } = await supabase!
        .from("profiles")
        .select("is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.is_active) {
        redirect(redirectTo);
      }
    }
  }

  return (
    <>
      <link rel="stylesheet" href="/funcionarios/styles.css" />
      <section id="loginScreen" className="login-screen">
        <div className="login-ambient login-ambient-one" aria-hidden="true" />
        <div className="login-ambient login-ambient-two" aria-hidden="true" />
        <div className="login-particles" aria-hidden="true" />
        <svg className="login-network-art" viewBox="0 0 920 520" aria-hidden="true">
          <path d="M24 430C152 480 254 455 388 408C556 350 626 386 884 304" />
          <path d="M42 462C218 424 298 502 456 420C588 352 680 306 900 336" />
          <circle cx="62" cy="444" r="6" />
          <circle cx="286" cy="452" r="5" />
          <circle cx="422" cy="394" r="5" />
          <circle cx="596" cy="344" r="6" />
          <circle cx="764" cy="324" r="5" />
        </svg>
        <div className="login-layout">
          <aside className="login-intro" aria-label="Apresentação do sistema">
            <p className="login-intro-kicker">
              <ShieldCheck className="size-5" aria-hidden="true" />
              Sistema central em rede
            </p>
            <h1>
              <span>Assistência</span>
              <span>Social</span>
            </h1>
            <span className="login-intro-line" aria-hidden="true" />
            <p className="login-intro-subtitle">Gerenciamento de funcionários</p>
            <p className="login-intro-description">
              Gerenciamento inteligente de funcionários da Secretaria Municipal
              de Assistência Social.
            </p>

            <div className="login-feature-grid">
              {loginFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article key={feature.title} className="login-feature-card">
                    <span className="login-feature-icon">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{feature.title}</strong>
                      <span>{feature.description}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="login-bottom-note">
              <LockKeyhole className="size-4" aria-hidden="true" />
              Sistema restrito a usuários autorizados da SEMASC.
            </div>
          </aside>

          <div className="login-card">
            <div className="login-brand">
              <Image
                src="/funcionarios/assets/iconebelford-web.png"
                alt="Brasão de Belford Roxo"
                width={104}
                height={104}
                priority
              />
              <div className="login-brand-name">
                <span>Prefeitura de</span>
                <strong>
                  Belford <em>Roxo</em>
                </strong>
              </div>
              <p className="eyebrow">Sistema central em rede</p>
              <h1>Assistência Social</h1>
              <span>Gerenciamento de funcionários</span>
            </div>
            <div className="login-divider" aria-hidden="true">
              <span>
                <UsersRound className="size-5" aria-hidden="true" />
              </span>
            </div>
            <EmployeeLoginForm redirectTo={redirectTo} isSupabaseReady={isReady} />
            <div className="login-credit">
              <div>
                <strong>
                  Criado por <b>Alessandro Araújo</b>
                </strong>
                <small>Tecnologia a serviço de quem mais precisa.</small>
              </div>
            </div>
          </div>

          <div className="login-footer">
            <span>
              <Sparkles className="size-4" aria-hidden="true" />
              Tecnologia a serviço de quem mais precisa
            </span>
            <span>
              Versão 1.0.0
              <i aria-hidden="true" />
              2026 SEMASC
              <Network className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
