import Image from "next/image";
import {
  BarChart3,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { LoginForm } from "@/monitoramento/components/auth/login-form";
import { RealtimeClock } from "@/monitoramento/components/auth/realtime-clock";
import { ConfigurationWarning } from "@/monitoramento/components/feedback/configuration-warning";
import { getPublicEnvStatus } from "@/monitoramento/lib/env";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const prefeituraBrasao = "/assets/belford-roxo-brasao-clean.png";
const allowedErrorCodes = [
  "ambiente-nao-configurado",
  "credenciais-invalidas",
  "sessao-expirada",
  "sem-permissao",
] as const;
const allowedStatusCodes = ["logout"] as const;
const loginFeatures: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Segurança",
    description: "Proteção avançada com criptografia e controle de acesso.",
    icon: ShieldCheck,
  },
  {
    title: "Monitoramento",
    description: "Acompanhe indicadores, metas e desempenho em tempo real.",
    icon: BarChart3,
  },
  {
    title: "Gestão eficiente",
    description: "Ferramentas completas para análise e tomada de decisão.",
    icon: UsersRound,
  },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const env = getPublicEnvStatus();
  const showDevelopmentWarning =
    !env.supabaseConfigured && process.env.NODE_ENV !== "production";
  const initialErrorCode = pickAllowedParam(params.erro, allowedErrorCodes);
  const initialStatusCode = pickAllowedParam(params.status, allowedStatusCodes);
  const redirectTo = sanitizeRedirectParam(params.redirect);
  const currentYear = new Date().getFullYear();

  return (
    <main className="monitoramento-login-page flex min-h-dvh flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(22,123,231,0.18),transparent_35%),linear-gradient(135deg,#031426_0%,#061f3a_50%,#04182e_100%)] px-3 py-3 text-slate-950 lg:h-dvh lg:overflow-hidden lg:px-4 lg:py-4">
      <div className="monitoramento-login-frame mx-auto grid w-full max-w-[1800px] flex-1 overflow-hidden rounded-[22px] border border-white/10 bg-white shadow-[0_28px_80px_rgba(0,20,41,0.34)] lg:min-h-0 lg:grid-cols-[minmax(430px,1.02fr)_minmax(520px,0.98fr)] xl:rounded-[28px]">
        <section className="monitoramento-login-aside login-panel relative hidden h-full min-h-0 overflow-hidden bg-[linear-gradient(145deg,#0066CC_0%,#07417c_40%,#052a54_72%,#041d3b_100%)] p-7 text-white lg:flex lg:flex-col lg:justify-between xl:p-9 [@media(max-height:820px)]:p-6">
          <div
            className="login-panel-orbit absolute inset-0 opacity-90"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_30%,rgba(0,174,255,0.34)_0,rgba(0,174,255,0.34)_0.34rem,transparent_0.38rem),radial-gradient(circle_at_78%_61%,rgba(0,174,255,0.24)_0,rgba(0,174,255,0.24)_0.25rem,transparent_0.29rem),linear-gradient(180deg,rgba(0,20,48,0.08),rgba(0,12,32,0.58))]" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgba(0,28,70,0.72)),repeating-linear-gradient(105deg,rgba(27,177,255,0.14)_0_1px,transparent_1px_22px)]" />
          <div className="absolute -right-36 bottom-10 h-64 w-[580px] rotate-[-8deg] rounded-[50%] border border-cyan-300/20 bg-[radial-gradient(ellipse_at_center,rgba(0,174,255,0.18),transparent_67%)]" />

          <div className="login-enter relative z-10">
            <div className="inline-flex items-center gap-3 rounded-[14px] border border-cyan-100/20 bg-blue-700/35 px-4 py-3 text-sm font-semibold uppercase tracking-[0.02em] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_36px_rgba(0,20,41,0.18)] backdrop-blur [@media(max-height:820px)]:py-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/10 text-cyan-200 [@media(max-height:820px)]:h-9 [@media(max-height:820px)]:w-9">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              Vigilância socioassistencial
            </div>

            <h1 className="monitoramento-login-title mt-8 max-w-[620px] text-[clamp(2.65rem,3.9vw,4.25rem)] font-bold leading-[0.98] [@media(max-height:820px)]:mt-6 [@media(max-height:820px)]:text-[2.55rem]">
              <span className="block">Sistema de</span>
              <span className="block">Monitoramento</span>
              <span className="block bg-[linear-gradient(90deg,#45a6ff,#79c9ff)] bg-clip-text text-transparent">
                Socioassistencial
              </span>
            </h1>
            <div className="mt-6 h-1 w-24 rounded-full bg-amber-400 bg-[linear-gradient(90deg,#ffc107,#ffd54f)] [@media(max-height:820px)]:mt-5" />
            <p className="mt-7 max-w-[640px] text-base font-medium leading-[1.7] text-white/90 [@media(max-height:820px)]:mt-5">
              Ambiente seguro para acompanhamento, monitoramento e gestão das
              informações da rede socioassistencial.
            </p>
          </div>

          <div className="monitoramento-login-feature-grid relative z-10 grid grid-cols-3 gap-4 xl:gap-5 [@media(max-height:820px)]:gap-3">
            {loginFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          <div className="monitoramento-login-info login-enter relative z-10 rounded-[16px] border border-cyan-100/16 bg-white/10 p-4 shadow-[0_14px_34px_rgba(0,20,41,0.14)] backdrop-blur [@media(max-height:820px)]:p-3">
            <RealtimeClock />
            <div className="monitoramento-login-institution-row mt-4 flex items-center gap-4 border-t border-white/10 pt-4 [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:pt-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center [@media(max-height:820px)]:h-10 [@media(max-height:820px)]:w-10">
                <Image
                  src={prefeituraBrasao}
                  alt="Brasão da Prefeitura de Belford Roxo"
                  width={166}
                  height={168}
                  className="h-full w-full object-contain"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold uppercase">
                  Prefeitura Municipal de Belford Roxo
                </p>
                <p className="mt-1 truncate text-sm text-white/75">
                  Secretaria Municipal de Assistência Social e Cidadania
                </p>
              </div>
              <p className="inline-flex shrink-0 items-center gap-2 border-l border-white/10 pl-5 text-sm text-white/75">
                <MapPin className="h-4 w-4 text-cyan-200" aria-hidden="true" />
                Belford Roxo, RJ
              </p>
            </div>
          </div>
        </section>

        <section className="monitoramento-login-content relative flex min-h-dvh items-start justify-center overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(64,145,255,0.08),transparent_35%),#f5f9ff] px-4 py-5 sm:px-6 lg:h-full lg:min-h-0 lg:items-center lg:overflow-y-auto lg:px-8 lg:py-6 xl:px-10 [@media(max-height:820px)]:lg:py-4">
          <div className="w-full max-w-[680px]">
            <div className="login-card-enter mb-4 rounded-[18px] border border-blue-100 bg-white/92 p-4 shadow-[0_18px_45px_rgba(20,54,99,0.12)] backdrop-blur lg:hidden">
              <div className="flex items-center gap-3">
                <Image
                  src={prefeituraBrasao}
                  alt="Brasão da Prefeitura de Belford Roxo"
                  width={166}
                  height={168}
                  className="h-14 w-14 object-contain"
                  priority
                  sizes="56px"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase text-blue-950">
                    Sistema de Monitoramento
                  </p>
                  <p className="mt-1 text-sm font-bold text-blue-700">
                    Vigilância Socioassistencial
                  </p>
                </div>
              </div>
            </div>

            <div className="monitoramento-login-card login-card-enter rounded-[24px] border border-white/80 bg-white/96 p-6 shadow-[0_24px_70px_rgba(20,54,99,0.1)] backdrop-blur sm:p-8 lg:p-7 xl:p-10 [@media(max-height:820px)]:lg:p-5">
              <div className="monitoramento-login-card-logo login-logo-enter mx-auto hidden h-20 w-20 items-center justify-center lg:flex xl:h-24 xl:w-24 [@media(max-height:820px)]:lg:h-14 [@media(max-height:820px)]:lg:w-14">
                <Image
                  src={prefeituraBrasao}
                  alt="Brasão da Prefeitura de Belford Roxo"
                  width={166}
                  height={168}
                  className="h-full w-auto object-contain"
                  priority
                  sizes="112px"
                />
              </div>

              {showDevelopmentWarning ? (
                <div className="mt-5 [@media(max-height:820px)]:mt-3">
                  <ConfigurationWarning />
                </div>
              ) : null}

              <LoginForm
                appName={env.appName}
                initialErrorCode={initialErrorCode}
                initialStatusCode={initialStatusCode}
                redirectTo={redirectTo}
              />

              <div className="mt-6 flex items-center gap-4 text-slate-300 [@media(max-height:820px)]:hidden">
                <span className="h-px flex-1 bg-slate-200" />
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            </div>
          </div>
        </section>
      </div>
      <footer className="monitoramento-login-footer mx-auto flex min-h-8 shrink-0 items-center justify-center gap-2 px-2 pt-2 text-center text-xs font-medium text-white/70 [@media(max-height:820px)]:min-h-7 [@media(max-height:820px)]:pt-1">
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          © {currentYear} Prefeitura Municipal de Belford Roxo • Todos os
          direitos reservados.
        </span>
      </footer>
      <span className="sr-only">{env.appName}</span>
    </main>
  );
}

function FeatureCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="login-feature-card flex min-h-[148px] min-w-0 flex-col p-4 [@media(max-height:820px)]:min-h-[126px] [@media(max-height:820px)]:p-3">
      <div className="flex h-13 w-13 items-center justify-center rounded-[16px] bg-[linear-gradient(145deg,#1e87ff,#075fd3)] text-cyan-100 shadow-[0_10px_24px_rgba(0,91,219,0.32)] [@media(max-height:820px)]:h-11 [@media(max-height:820px)]:w-11">
        <Icon
          className="h-6 w-6 [@media(max-height:820px)]:h-5 [@media(max-height:820px)]:w-5"
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-4 text-base font-semibold [@media(max-height:820px)]:mt-3">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/80 [@media(max-height:820px)]:text-[13px] [@media(max-height:820px)]:leading-5">
        {description}
      </p>
    </article>
  );
}

function pickAllowedParam<const T extends readonly string[]>(
  value: string | string[] | undefined,
  allowed: T,
): T[number] | null {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (normalized && (allowed as readonly string[]).includes(normalized)) {
    return normalized as T[number];
  }

  return null;
}

function sanitizeRedirectParam(value: string | string[] | undefined): string {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (
    !normalized ||
    !normalized.startsWith("/") ||
    !normalized.startsWith("/monitoramento") ||
    normalized.startsWith("//")
  ) {
    return "/monitoramento/inicio";
  }

  return normalized;
}
