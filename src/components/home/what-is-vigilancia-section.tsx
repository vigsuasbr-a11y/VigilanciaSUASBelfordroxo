import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Database,
  MapPinned,
  SearchCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const highlights = [
  {
    title: "Conhecer os territórios",
    description: "Leitura de vulnerabilidades, demandas e características locais.",
    icon: MapPinned,
  },
  {
    title: "Acompanhar os serviços",
    description: "Monitoramento da oferta, execução e resultados da rede.",
    icon: SearchCheck,
  },
  {
    title: "Apoiar decisões",
    description: "Dados qualificados para planejamento e definição de prioridades.",
    icon: BarChart3,
  },
];

export function WhatIsVigilanciaSection() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          as="h1"
          eyebrow="A Vigilância"
          title="O que é a Vigilância Socioassistencial"
          description="Uma função estratégica da Política de Assistência Social voltada à produção, análise e disseminação de informações."
        />

        <div className="mt-9 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="rounded-lg border border-[#dbe5f1] bg-[#f7f9fd] p-7 shadow-sm">
            <p className="text-base leading-8 text-[#10213a]">
              A Vigilância Socioassistencial é responsável pela produção,
              sistematização, análise e disseminação de informações sobre os
              territórios, as vulnerabilidades e a oferta de serviços da Assistência
              Social.
            </p>
            <p className="mt-4 text-base leading-8 text-[#10213a]">
              Seu trabalho ajuda a transformar registros e dados da rede em
              conhecimento útil para orientar decisões, qualificar o planejamento e
              fortalecer a proteção social no município.
            </p>
            <Link
              href="/a-vigilancia"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#074fb8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063f93]"
            >
              Saiba mais
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-4">
            <VigilanciaIllustration />
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm"
                  >
                    <Icon className="size-8 text-[#074fb8]" aria-hidden="true" />
                    <h3 className="mt-4 text-sm font-semibold text-[#06285f]">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-[#60708a]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VigilanciaIllustration() {
  return (
    <svg
      className="h-auto w-full rounded-lg border border-[#dbe5f1] bg-white shadow-sm"
      viewBox="0 0 720 320"
      role="img"
      aria-label="Ilustração de dados, território e decisões conectadas"
    >
      <rect width="720" height="320" fill="#F8FBFF" />
      <path d="M80 236C132 150 205 106 292 126C386 148 421 67 512 92C584 112 632 169 646 242" fill="none" stroke="#C8DDF4" strokeWidth="18" strokeLinecap="round" />
      <path d="M88 234C140 154 210 118 292 136C386 158 424 86 510 108C575 125 622 174 638 238" fill="none" stroke="#0A84FF" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(72 74)">
        <rect width="154" height="132" rx="14" fill="#FFFFFF" stroke="#CFE0F4" />
        <Database x="30" y="28" width="34" height="34" color="#074FB8" aria-hidden="true" />
        <rect x="30" y="78" width="92" height="8" rx="4" fill="#D8EAFD" />
        <rect x="30" y="96" width="72" height="8" rx="4" fill="#D8EAFD" />
      </g>
      <g transform="translate(292 52)">
        <rect width="156" height="156" rx="18" fill="#FFFFFF" stroke="#CFE0F4" />
        <path d="M42 96L76 48L114 96L88 96L88 120H68V96H42Z" fill="#EAF4FF" stroke="#074FB8" strokeWidth="3" />
        <circle cx="78" cy="78" r="14" fill="#4EE7FF" opacity="0.45" />
        <circle cx="78" cy="78" r="5" fill="#074FB8" />
      </g>
      <g transform="translate(512 92)">
        <rect width="142" height="124" rx="14" fill="#FFFFFF" stroke="#CFE0F4" />
        <rect x="30" y="70" width="14" height="28" rx="4" fill="#0A84FF" />
        <rect x="58" y="52" width="14" height="46" rx="4" fill="#00A67E" />
        <rect x="86" y="34" width="14" height="64" rx="4" fill="#6ED4FF" />
        <path d="M28 104H112" stroke="#B8D3F2" strokeWidth="3" strokeLinecap="round" />
      </g>
      {[88, 292, 510, 638].map((x, index) => {
        const y = [234, 136, 108, 238][index];
        return <circle key={x} cx={x} cy={y} r="8" fill="#00A67E" stroke="#FFFFFF" strokeWidth="4" />;
      })}
    </svg>
  );
}
