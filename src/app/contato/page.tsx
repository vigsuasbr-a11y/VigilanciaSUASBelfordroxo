import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Route,
  ShieldCheck,
} from "lucide-react";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contato",
};

const phoneDigits = siteConfig.phone.replace(/\D/g, "");
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  siteConfig.address,
)}`;

const contactChannels = [
  {
    title: "E-mail institucional",
    description: "Envie solicitações, dúvidas sobre dados e demandas relacionadas ao portal.",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    action: "Enviar e-mail",
    tone: "blue",
  },
  {
    title: "Telefone",
    description: "Canal direto para orientações e encaminhamentos da equipe responsável.",
    value: siteConfig.phone,
    href: `tel:+55${phoneDigits}`,
    icon: Phone,
    action: "Ligar agora",
    tone: "green",
  },
  {
    title: "Localização",
    description: "Atendimento institucional vinculado à Secretaria Municipal.",
    value: "Vila Medeiros, Belford Roxo - RJ",
    href: mapsUrl,
    icon: MapPin,
    action: "Abrir mapa",
    tone: "amber",
  },
];

const requestTopics = [
  "Informações sobre indicadores socioassistenciais",
  "Orientações sobre sistemas da Vigilância",
  "Apoio a publicações, relatórios e diagnósticos",
  "Atualização de dados institucionais da rede",
];

export default function ContatoPage() {
  return (
    <PortalChrome>
      <main id="conteudo" className="bg-[#f5f8fc]">
        <section className="border-b border-[#dbe5f1] bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
                <MessageSquareText className="size-4" aria-hidden="true" />
                Atendimento institucional
              </span>
              <h1 className="mt-5 max-w-3xl text-[30px] font-semibold leading-[1.12] tracking-[-0.025em] text-[#06285f] sm:text-5xl">
                Fale com a Vigilância Socioassistencial
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#4d5f7a]">
                Use os canais oficiais para solicitar informações, tirar dúvidas sobre o
                Portal da Vigilância e encaminhar demandas relacionadas aos dados da rede
                socioassistencial.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#075bd8] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(7,91,216,0.22)] transition hover:-translate-y-0.5 hover:bg-[#064cad]"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  Enviar mensagem
                </a>
                <a
                  href={`tel:+55${phoneDigits}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#cfe0f4] bg-white px-5 text-sm font-semibold text-[#06285f] transition hover:-translate-y-0.5 hover:border-[#91bdf0] hover:bg-blue-50"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {siteConfig.phone}
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-[#cfe0f4] bg-[#06285f] p-6 text-white shadow-[0_24px_60px_rgba(8,39,85,0.18)]">
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
              <div className="absolute -right-12 -top-16 size-48 rounded-full bg-[#38bdf8]/25 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-lg bg-white/[0.12] text-cyan-200">
                    <Building2 className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <strong className="block text-lg font-semibold">
                      {siteConfig.department}
                    </strong>
                    <span className="text-sm text-blue-100">{siteConfig.secretary}</span>
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  <InfoLine
                    icon={<Mail className="size-4" aria-hidden="true" />}
                    label="E-mail"
                    value={siteConfig.email}
                  />
                  <InfoLine
                    icon={<Phone className="size-4" aria-hidden="true" />}
                    label="Telefone"
                    value={siteConfig.phone}
                  />
                  <InfoLine
                    icon={<Clock3 className="size-4" aria-hidden="true" />}
                    label="Atendimento"
                    value="Segunda a sexta, em horário administrativo"
                  />
                  <InfoLine
                    icon={<MapPin className="size-4" aria-hidden="true" />}
                    label="Endereço"
                    value={siteConfig.address}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;

                return (
                  <a
                    key={channel.title}
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                    className="group flex min-h-64 flex-col rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#91bdf0] hover:shadow-[0_18px_42px_rgba(8,39,85,0.12)]"
                  >
                    <span
                      className={`grid size-12 place-items-center rounded-lg ${
                        channel.tone === "green"
                          ? "bg-emerald-50 text-emerald-700"
                          : channel.tone === "amber"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-[#074fb8]"
                      }`}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <strong className="mt-5 text-base font-semibold text-[#06285f]">
                      {channel.title}
                    </strong>
                    <span className="mt-2 text-sm leading-6 text-[#60708a]">
                      {channel.description}
                    </span>
                    <span className="mt-4 block text-sm font-semibold leading-6 text-[#102d5d]">
                      {channel.value}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#074fb8]">
                      {channel.action}
                      {channel.href.startsWith("http") ? (
                        <ExternalLink className="size-4" aria-hidden="true" />
                      ) : (
                        <ArrowRight
                          className="size-4 transition group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-10">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.025em] text-[#00a67e]">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Como podemos ajudar
              </span>
              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#06285f]">
                Encaminhe sua solicitação com clareza
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#60708a]">
                Para agilizar o retorno, informe o assunto, unidade ou serviço relacionado,
                além de um telefone ou e-mail para contato. Demandas técnicas são analisadas
                pela equipe responsável antes de publicação ou atualização no portal.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {requestTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex gap-3 rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-4"
                >
                  <CheckCircle2 className="mt-0.5 size-5 flex-none text-[#00a67e]" aria-hidden="true" />
                  <span className="text-sm leading-6 text-[#263a57]">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="rounded-lg border border-[#dbe5f1] bg-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
                <Route className="size-4" aria-hidden="true" />
                Localização
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[#06285f]">
                SEMASC - Secretaria de Assistência Social e Cidadania
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#60708a]">{siteConfig.address}</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cfe0f4] bg-white px-4 text-sm font-semibold text-[#074fb8] transition hover:-translate-y-0.5 hover:border-[#91bdf0] hover:bg-blue-50"
              >
                Abrir rota no mapa
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>

            <div className="rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-6">
              <span className="grid size-12 place-items-center rounded-lg bg-white text-[#074fb8] shadow-sm">
                <CalendarCheck className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#06285f]">
                Retorno e acompanhamento
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#60708a]">
                As mensagens recebidas são direcionadas para análise da equipe da Vigilância
                Socioassistencial. Quando necessário, o retorno poderá solicitar dados
                complementares para qualificar o atendimento.
              </p>
              <div className="mt-5 rounded-lg border border-[#dbe5f1] bg-white p-4 text-sm leading-6 text-[#263a57]">
                Para assuntos urgentes ou dúvidas operacionais imediatas, dê preferência ao
                telefone institucional.
              </div>
            </div>
          </div>
        </section>
      </main>
    </PortalChrome>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-3">
      <span className="mt-0.5 text-cyan-200">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.025em] text-blue-100">
          {label}
        </span>
        <span className="mt-1 block text-sm leading-6 text-white">{value}</span>
      </span>
    </div>
  );
}
