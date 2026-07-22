import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Grid2X2,
  Home,
  HousePlus,
  MapPin,
  Network,
  UsersRound,
} from "lucide-react";

const territoryLegend = [
  {
    title: "CRAS",
    description: "Proteção Social Básica",
    icon: Home,
    color: "bg-[#0a84ff]",
  },
  {
    title: "CREAS",
    description: "Proteção Social Especial",
    icon: Building2,
    color: "bg-[#7c4dff]",
  },
  {
    title: "Centro POP",
    description: "População em situação de rua",
    icon: UsersRound,
    color: "bg-[#ff7a18]",
  },
  {
    title: "Unidades de Acolhimento",
    description: "Proteção e acolhimento",
    icon: HousePlus,
    color: "bg-[#00a67e]",
  },
  {
    title: "Gestão",
    description: "Planejamento e decisão",
    icon: MapPin,
    color: "bg-[#0ea5e9]",
  },
];

const mapLines = [
  "M154 164L224 138",
  "M224 138L288 170",
  "M288 170L344 116",
  "M344 116L430 148",
  "M430 148L514 136",
  "M288 170L360 218",
  "M344 116L406 84",
  "M224 138L248 92",
];

const mapPoints = [
  [154, 164],
  [224, 138],
  [288, 170],
  [344, 116],
  [430, 148],
  [514, 136],
  [360, 218],
  [406, 84],
  [248, 92],
];

export function HeroSection() {
  return (
    <section className="public-hero relative isolate overflow-hidden bg-[#031b45] text-white">
      <div className="public-hero-bg absolute inset-0" aria-hidden="true" />
      <div className="hero-grid absolute inset-0 opacity-45" aria-hidden="true" />
      <div className="hero-map-light absolute right-[8%] top-[12%] h-64 w-64 rounded-full bg-[#0a84ff]/25 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[330px] max-w-7xl items-center gap-8 px-4 py-9 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="hero-eyebrow mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#4ee7ff]">
            <Network className="size-4" aria-hidden="true" />
            Vigilância Socioassistencial
          </p>
          <h1
            className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl"
            aria-label="Informação que fortalece a gestão do SUAS"
          >
            <span className="hero-title-line block">Informação que fortalece a gestão</span>
            {" "}
            <span className="hero-title-suas mt-1 block text-[#4ee7ff]">do SUAS</span>
          </h1>
          <p className="hero-copy mt-4 max-w-xl text-base leading-7 text-blue-50">
            A Vigilância Socioassistencial transforma dados em conhecimento para
            apoiar o planejamento, o monitoramento e a melhoria dos serviços
            oferecidos à população.
          </p>
          <div className="hero-actions mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/a-vigilancia"
              className="hero-action hero-action-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0a84ff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 hover:bg-[#0474e4]"
            >
              Conheça a Vigilância
              <ArrowRight className="hero-action-arrow size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/indicadores"
              className="hero-action inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/45 bg-white/8 px-5 py-3 text-sm font-semibold text-white hover:bg-white/16"
            >
              <BarChart3 className="hero-action-icon size-4" aria-hidden="true" />
              Consultar indicadores
            </Link>
            <Link
              href="/sistemas"
              className="hero-action hero-action-ghost inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-blue-100 hover:text-white"
            >
              <Grid2X2 className="hero-action-icon size-4" aria-hidden="true" />
              Acessar sistemas
            </Link>
          </div>
        </div>

        <div className="hero-map-shell relative hidden min-h-[280px] lg:block" aria-hidden="true">
          <TerritoryMap />
          <div className="absolute right-0 top-2 grid gap-3">
            {territoryLegend.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="hero-legend-card flex w-72 items-center gap-3"
                  style={{ "--legend-delay": `${720 + index * 80}ms` } as CSSProperties}
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full ${item.color}`}>
                    <Icon className="size-5 text-white" aria-hidden="true" />
                  </span>
                  <span>
                    <strong className="block text-sm font-semibold text-white">{item.title}</strong>
                    <span className="block text-xs leading-5 text-blue-100">{item.description}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TerritoryMap() {
  return (
    <svg
      className="hero-map-visual absolute left-0 top-0 h-[290px] w-[76%] text-sky-200/80"
      viewBox="0 0 640 320"
      fill="none"
    >
      <path
        className="map-shape"
        d="M128 132L178 92L246 76L292 45L350 56L398 84L462 78L510 112L562 138L526 190L476 220L410 210L358 252L294 222L232 230L184 196L126 190L96 160L128 132Z"
        fill="#0A84FF"
        fillOpacity="0.18"
        stroke="#6ED4FF"
        strokeWidth="2"
      />
      {mapLines.map((line, index) => (
        <path
          key={line}
          className="map-line"
          d={line}
          stroke="#4EE7FF"
          strokeOpacity="0.78"
          strokeWidth="1.6"
          style={{ "--line-delay": `${280 + index * 95}ms` } as CSSProperties}
        />
      ))}
      {mapPoints.map(([cx, cy], index) => (
        <g
          key={`${cx}-${cy}`}
          className="map-point"
          style={{ "--point-delay": `${620 + index * 115}ms` } as CSSProperties}
        >
          <circle cx={cx} cy={cy} r="15" fill="#0A84FF" fillOpacity="0.18" />
          <circle className="map-point-core" cx={cx} cy={cy} r="6" fill="#4EE7FF" />
          <circle cx={cx} cy={cy} r="2.5" fill="white" />
        </g>
      ))}
      <g className="map-panel" transform="translate(94 62)">
        <rect width="104" height="58" rx="8" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.12" />
        <path d="M28 37V24M50 37V16M72 37V28" stroke="#4EE7FF" strokeWidth="7" strokeLinecap="round" />
      </g>
      <g className="map-panel" transform="translate(252 188)">
        <rect width="144" height="76" rx="8" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.12" />
        <path d="M24 50V34M52 50V24M80 50V18M108 50V30" stroke="#4EE7FF" strokeWidth="8" strokeLinecap="round" />
      </g>
      <g className="map-panel" transform="translate(420 190)">
        <rect width="126" height="68" rx="8" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.12" />
        <circle cx="38" cy="34" r="16" fill="#0A84FF" fillOpacity="0.45" />
        <path d="M68 26H104M68 42H96" stroke="#6ED4FF" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="map-pin" transform="translate(352 132)">
        <path d="M24 0C37 0 48 10 48 24C48 44 24 68 24 68C24 68 0 44 0 24C0 10 11 0 24 0Z" fill="#0A84FF" />
        <circle cx="24" cy="24" r="9" fill="white" />
      </g>
    </svg>
  );
}
