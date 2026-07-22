import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, BadgeInfo, BarChart3, Network, UsersRound } from "lucide-react";
import { projectContent } from "@/content/project";

export function ProjectAboutHero() {
  return (
    <section className="relative overflow-hidden bg-[#f5f8fc]">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#eaf4ff] to-transparent" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-14">
        <div>
          <nav className="text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#06285f]">
              Início
            </Link>
            <span className="mx-2 text-[#60708a]">/</span>
            <span>{projectContent.pageTitle}</span>
          </nav>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8] shadow-sm">
            <BadgeInfo className="size-4" aria-hidden="true" />
            {projectContent.pageSubtitle}
          </span>
          <h1 className="mt-5 max-w-3xl text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#06285f] sm:text-5xl">
            {projectContent.heroTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#38506f]">
            {projectContent.heroText}
          </p>
          <Link
            href="/servicos"
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#074fb8] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/10 hover:-translate-y-0.5 hover:bg-[#0a84ff]"
          >
            Acessar serviços
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#cfe0f4] bg-white p-4 shadow-[0_22px_50px_rgba(8,39,85,0.12)]">
          <ProjectIllustration />
        </div>
      </div>
    </section>
  );
}

function ProjectIllustration() {
  return (
    <svg
      className="h-auto w-full text-[#074fb8]"
      viewBox="0 0 720 420"
      fill="none"
      role="img"
      aria-label="Ilustração de rede de dados, pessoas e indicadores"
    >
      <rect width="720" height="420" rx="24" fill="#F5F8FC" />
      <path
        d="M86 299C136 240 169 221 240 227C302 232 324 163 382 134C469 91 575 126 634 190"
        stroke="#B8D7F8"
        strokeWidth="2"
      />
      <g className="project-svg-line">
        <path d="M160 251L274 184L392 232L512 149" stroke="#0A84FF" strokeWidth="3" strokeLinecap="round" />
        <path d="M274 184L320 92L512 149L584 228" stroke="#00A67E" strokeWidth="3" strokeLinecap="round" />
      </g>
      {[
        [160, 251],
        [274, 184],
        [320, 92],
        [392, 232],
        [512, 149],
        [584, 228],
      ].map(([cx, cy], index) => (
        <g
          key={`${cx}-${cy}`}
          className="project-svg-point"
          style={{ "--project-point-delay": `${index * 90}ms` } as CSSProperties}
        >
          <circle cx={cx} cy={cy} r="18" fill="#EAF4FF" />
          <circle cx={cx} cy={cy} r="7" fill="#0A84FF" />
          <circle cx={cx} cy={cy} r="3" fill="white" />
        </g>
      ))}
      <g transform="translate(72 82)">
        <rect width="164" height="118" rx="18" fill="white" stroke="#CFE0F4" />
        <foreignObject x="24" y="24" width="116" height="70">
          <div className="flex h-full items-center gap-3 text-[#074fb8]">
            <Network className="size-8" aria-hidden="true" />
            <div>
              <span className="block text-xs font-semibold uppercase tracking-[0.025em] text-[#60708a]">
                Rede
              </span>
              <span className="block text-lg font-semibold text-[#06285f]">
                Conectada
              </span>
            </div>
          </div>
        </foreignObject>
      </g>
      <g transform="translate(438 254)">
        <rect width="206" height="104" rx="18" fill="white" stroke="#CFE0F4" />
        <foreignObject x="22" y="20" width="162" height="64">
          <div className="flex h-full items-center gap-3 text-[#00a67e]">
            <BarChart3 className="size-8" aria-hidden="true" />
            <div>
              <span className="block text-xs font-semibold uppercase tracking-[0.025em] text-[#60708a]">
                Indicadores
              </span>
              <span className="block text-lg font-semibold text-[#06285f]">
                Para decidir
              </span>
            </div>
          </div>
        </foreignObject>
      </g>
      <g transform="translate(404 46)">
        <rect width="188" height="86" rx="18" fill="#031B45" />
        <foreignObject x="22" y="18" width="144" height="50">
          <div className="flex h-full items-center gap-3 text-white">
            <UsersRound className="size-8 text-[#4ee7ff]" aria-hidden="true" />
            <div>
              <span className="block text-xs font-medium text-blue-100">
                Pessoas
              </span>
              <span className="block text-base font-semibold">
                e gestão
              </span>
            </div>
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}
