/* eslint-disable @next/next/no-css-tags */
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { EmployeeLoginForm } from "@/components/funcionarios/employee-login-form";
import { WelcomeSessionReset } from "@/components/funcionarios/welcome-toast";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LoginAccessArt, LoginIdentityArt, LoginNetwork } from "./login-art";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Login - Sistema de Funcionários",
};

export const dynamic = "force-dynamic";

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
      <main id="loginScreen" className={`funcionarios-system ${styles.screen}`}>
        <WelcomeSessionReset />
        <header className={styles.identity}>
          <LoginIdentityArt />
          <LoginNetwork />
          <div className={styles.municipality}>
            <Image
              className={styles.crest}
              src="/funcionarios/assets/iconebelford-web.png"
              alt=""
              width={56}
              height={56}
              priority
            />
            <div>
              <span>Prefeitura de</span>
              <strong>Belford Roxo</strong>
            </div>
          </div>
          <div className={styles.intro}>
            <h1>Sistema de Funcionários</h1>
            <p>Secretaria Municipal de Assistência Social e Cidadania</p>
          </div>
        </header>
        <div className={styles.access}>
          <LoginAccessArt />
          <section className={styles.card} aria-labelledby="accessTitle">
            <h2 id="accessTitle">
              <span className={styles.accessIcon}>
                <UsersRound aria-hidden="true" strokeWidth={2.2} />
              </span>
              Acesse sua conta
            </h2>
            <EmployeeLoginForm redirectTo={redirectTo} isSupabaseReady={isReady} />
          </section>
          <footer className={styles.footer}>
            <span>Criado por Alessandro Araújo</span>
            <span className={styles.footerLine} aria-hidden="true" />
            <span>Versão 2.0.0</span>
          </footer>
        </div>
      </main>
    </>
  );
}
