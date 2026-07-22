import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  CalendarDays,
  ChevronRight,
  FileText,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Notice } from "@/types/domain";

const publicationHighlights = [
  {
    title: "Boletim Socioassistencial - Junho/2026",
    description: "Panorama dos principais indicadores da rede.",
    date: "20/07/2026",
    tone: "blue",
  },
  {
    title: "Relatório de Monitoramento - 1º Semestre 2026",
    description: "Análise das metas, serviços e resultados alcançados.",
    date: "18/07/2026",
    tone: "green",
  },
  {
    title: "Plano Municipal de Assistência Social",
    description: "Documento atualizado para o ciclo 2026-2029.",
    date: "10/07/2026",
    tone: "purple",
  },
];

const aboutHighlights = [
  "Informação para transformar realidades",
  "Decisões baseadas em evidências",
  "Transparência e responsabilidade",
  "Fortalecimento da política pública",
];

export function NoticesDevelopmentSection({ notices }: { notices: Notice[] }) {
  return (
    <section className="bg-[#f5f8fc] pb-4 pt-3">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[1.05fr_1.05fr_0.9fr] lg:px-8">
        <article className="rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm">
          <PanelTitle
            icon={<CalendarDays className="size-5" aria-hidden="true" />}
            title="Avisos e agenda"
            href="/publicacoes"
          />
          <div className="mt-3 divide-y divide-[#e6edf7]">
            {notices.slice(0, 3).map((notice) => (
              <NoticeRow key={notice.id} notice={notice} />
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm">
          <PanelTitle
            icon={<FileText className="size-5" aria-hidden="true" />}
            title="Publicações em destaque"
            href="/publicacoes"
          />
          <div className="mt-3 grid gap-3">
            {publicationHighlights.map((item) => (
              <PublicationRow key={item.title} item={item} />
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[#dbe5f1] bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
              <Info className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#06285f]">Sobre a Vigilância</h2>
              <p className="mt-3 text-sm leading-6 text-[#60708a]">
                A Vigilância Socioassistencial é responsável por produzir,
                sistematizar, analisar e disseminar informações sobre os territórios,
                as vulnerabilidades e a oferta de serviços.
              </p>
            </div>
          </div>
          <ul className="mt-5 grid gap-3">
            {aboutHighlights.map((item, index) => (
              <li key={item} className="flex items-center gap-3 text-sm text-[#38506f]">
                <span className="grid size-7 place-items-center rounded-full bg-blue-50 text-[#074fb8]">
                  {index % 2 === 0 ? (
                    <Sparkles className="size-4" aria-hidden="true" />
                  ) : (
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  )}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function PanelTitle({
  icon,
  title,
  href,
}: {
  icon: ReactNode;
  title: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-[#06285f]">
        <span className="text-[#074fb8]">{icon}</span>
        {title}
      </h2>
      <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#074fb8]">
        Ver todas
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function NoticeRow({ notice }: { notice: Notice }) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(notice.publishedAt))
    .replace(".", "")
    .toUpperCase();
  const [day, month] = date.split(" DE ");

  return (
    <Link
      href={notice.href ?? "/publicacoes"}
      className="flex items-center gap-4 py-3 hover:bg-[#f8fbff]"
    >
      <time
        className="grid size-14 shrink-0 place-items-center rounded-lg bg-blue-50 text-center text-[#06285f]"
        dateTime={notice.publishedAt}
      >
        <span>
          <span className="block text-xl font-bold leading-none">{day}</span>
          <span className="mt-1 block text-[0.65rem] font-semibold">{month ?? ""}</span>
        </span>
      </time>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-semibold text-[#10213a]">
          {notice.title}
        </strong>
        <span className="mt-1 line-clamp-1 text-xs text-[#60708a]">{notice.description}</span>
      </span>
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#075aaa]">
        Aviso
      </span>
      <ChevronRight className="size-4 shrink-0 text-[#074fb8]" aria-hidden="true" />
    </Link>
  );
}

function PublicationRow({
  item,
}: {
  item: {
    title: string;
    description: string;
    date: string;
    tone: string;
  };
}) {
  const toneClass =
    item.tone === "green"
      ? "bg-emerald-50 text-[#008b6c]"
      : item.tone === "purple"
        ? "bg-violet-50 text-[#6d38d6]"
        : "bg-blue-50 text-[#074fb8]";

  return (
    <Link href="/publicacoes" className="flex items-center gap-4 rounded-lg p-2 hover:bg-[#f8fbff]">
      <span className={`grid size-14 shrink-0 place-items-center rounded-lg ${toneClass}`}>
        <FileText className="size-7" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-semibold text-[#10213a]">
          {item.title}
        </strong>
        <span className="mt-1 line-clamp-1 text-xs text-[#60708a]">{item.description}</span>
        <span className="mt-1 block text-xs text-[#60708a]">{item.date}</span>
      </span>
      <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-[#06285f]">
        PDF
      </span>
      <ArrowDownToLine className="size-4 shrink-0 text-[#074fb8]" aria-hidden="true" />
    </Link>
  );
}
