"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Newspaper,
  Search,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PublicationNews } from "@/types/publicacoes";

type PublicacoesNewsClientProps = {
  news: PublicationNews[];
  categories: string[];
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export function PublicacoesNewsClient({ news, categories }: PublicacoesNewsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const filteredNews = useMemo(() => {
    const normalizedTerm = normalize(searchTerm);

    return news.filter((item) => {
      const categoryMatches =
        selectedCategory === "Todas" ||
        item.category === selectedCategory ||
        item.tags.includes(selectedCategory);
      const termMatches =
        !normalizedTerm ||
        normalize([item.title, item.excerpt, item.category, ...item.tags].join(" ")).includes(
          normalizedTerm,
        );

      return categoryMatches && termMatches;
    });
  }, [news, searchTerm, selectedCategory]);

  const featuredNews = news.find((item) => item.featured) ?? news[0];
  const selectedNews = news.find((item) => item.slug === selectedSlug) ?? null;
  const selectedIndex = selectedNews
    ? news.findIndex((item) => item.slug === selectedNews.slug)
    : -1;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedNews) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedSlug(null);
      }

      if (event.key === "ArrowRight") {
        setSelectedSlug(news[(selectedIndex + 1) % news.length].slug);
      }

      if (event.key === "ArrowLeft") {
        setSelectedSlug(news[(selectedIndex - 1 + news.length) % news.length].slug);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [news, selectedIndex, selectedNews]);

  return (
    <>
      <section className="bg-[#f5f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.025em] text-[#074fb8]">
                <Newspaper className="size-4" aria-hidden="true" />
                Jornal da Vigilância
              </span>
              <h1 className="mt-4 max-w-3xl text-[28px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#06285f] sm:text-4xl">
                Publicações e notícias da Assistência Social de Belford Roxo
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#60708a]">
                Matérias oficiais, registros institucionais e conteúdos da Vigilância
                Socioassistencial reunidos em um formato de leitura rápido e organizado.
              </p>
            </div>

            <div className="grid gap-3 rounded-lg border border-[#dbe5f1] bg-white p-4 shadow-sm sm:grid-cols-3">
              <Metric value={news.length} label="notícias reunidas" />
              <Metric value="2026" label="ano de cobertura" />
              <Metric value="SEMASC" label="foco editorial" />
            </div>
          </div>

          {featuredNews ? (
            <button
              type="button"
              data-testid="featured-news-open"
              onClick={() => setSelectedSlug(featuredNews.slug)}
              className="group mt-8 grid w-full overflow-hidden rounded-lg border border-[#cfe0f4] bg-white text-left shadow-[0_18px_42px_rgba(8,39,85,0.10)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(8,39,85,0.14)] lg:grid-cols-[1.05fr_0.95fr]"
            >
              <span className="relative block min-h-[280px] overflow-hidden bg-[#06285f]">
                <Image
                  src={featuredNews.image}
                  alt={featuredNews.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute left-5 top-5 rounded-full bg-[#0a84ff] px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  Destaque
                </span>
              </span>
              <span className="flex min-h-[280px] flex-col justify-center p-6 sm:p-8">
                <NewsMeta item={featuredNews} />
                <strong className="mt-4 block text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#06285f] sm:text-3xl">
                  {featuredNews.title}
                </strong>
                <span className="mt-4 block text-sm leading-6 text-[#60708a]">
                  {featuredNews.excerpt}
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#074fb8]">
                  Abrir leitura
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </button>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-4 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <label className="relative block">
                <span className="sr-only">Buscar notícia</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#074fb8]" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por tema, equipamento, projeto ou palavra-chave"
                  className="h-12 w-full rounded-lg border border-[#cfe0f4] bg-white pl-12 pr-4 text-sm text-[#10213a] outline-none transition placeholder:text-[#7d8da6] focus:border-[#0a84ff] focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-semibold transition",
                      selectedCategory === category
                        ? "border-[#074fb8] bg-[#074fb8] text-white shadow-md shadow-blue-950/10"
                        : "border-[#cfe0f4] bg-white text-[#38506f] hover:border-[#0a84ff] hover:text-[#074fb8]",
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#06285f]">Todas as notícias</h2>
              <p className="mt-1 text-sm text-[#60708a]">
                {filteredNews.length} registros encontrados para a seleção atual.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredNews.map((item) => (
              <NewsCard key={item.slug} item={item} onOpen={() => setSelectedSlug(item.slug)} />
            ))}
          </div>
        </div>
      </section>

      {selectedNews && isMounted
        ? createPortal(
            <NewsModal
              item={selectedNews}
              onClose={() => setSelectedSlug(null)}
              onPrevious={() =>
                setSelectedSlug(news[(selectedIndex - 1 + news.length) % news.length].slug)
              }
              onNext={() => setSelectedSlug(news[(selectedIndex + 1) % news.length].slug)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg bg-[#f5f8fc] p-4">
      <strong className="block text-2xl font-bold leading-none tracking-[-0.03em] text-[#06285f]">
        {value}
      </strong>
      <span className="mt-2 block text-xs leading-5 text-[#60708a]">{label}</span>
    </div>
  );
}

function NewsCard({ item, onOpen }: { item: PublicationNews; onOpen: () => void }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[#dbe5f1] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#bcd5f4] hover:shadow-[0_18px_38px_rgba(8,39,85,0.12)]">
      <button
        type="button"
        data-testid={`news-card-${item.slug}`}
        onClick={onOpen}
        className="block w-full text-left"
      >
        <span className="relative block aspect-[16/10] overflow-hidden bg-[#06285f]">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#074fb8] shadow-sm">
            {item.category}
          </span>
        </span>
        <span className="block p-5">
          <NewsMeta item={item} />
          <strong className="mt-3 line-clamp-3 block text-base font-semibold leading-snug text-[#06285f]">
            {item.title}
          </strong>
          <span className="mt-3 line-clamp-3 block text-sm leading-6 text-[#60708a]">
            {item.excerpt}
          </span>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#074fb8]">
            Ler notícia
            <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </span>
      </button>
    </article>
  );
}

function NewsMeta({ item }: { item: PublicationNews }) {
  return (
    <span className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#60708a]">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-4 text-[#074fb8]" aria-hidden="true" />
        {formatDate(item.date)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Tag className="size-4 text-[#00a67e]" aria-hidden="true" />
        {item.sourceLabel}
      </span>
    </span>
  );
}

function NewsModal({
  item,
  onClose,
  onPrevious,
  onNext,
}: {
  item: PublicationNews;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.scrollTo({ top: 0 });
  }, [item.slug]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[120] overflow-y-auto bg-[#031b45]/78 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#dbe5f1] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#06285f]">
            <Newspaper className="size-4 text-[#074fb8]" aria-hidden="true" />
            Jornal da Vigilância
          </span>
          <button
            type="button"
            data-testid="news-modal-close"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-[#dbe5f1] bg-[#f5f8fc] text-[#06285f] hover:bg-blue-50"
            aria-label="Fechar notícia"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <article>
          <div className="relative min-h-[300px] bg-[#06285f] sm:min-h-[420px]">
            <Image src={item.image} alt={item.imageAlt} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031b45]/88 via-[#031b45]/22 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
              <span className="rounded-full bg-[#0a84ff] px-3 py-1 text-xs font-semibold">
                {item.category}
              </span>
              <h2 className="mt-4 max-w-4xl text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                {item.title}
              </h2>
              <div className="mt-4 text-blue-50">
                <NewsMeta item={item} />
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[1fr_260px]">
            <div>
              <p className="border-l-4 border-[#0a84ff] pl-4 text-lg leading-8 text-[#38506f]">
                {item.excerpt}
              </p>
              <div className="mt-6 space-y-5 text-base leading-8 text-[#263a57]">
                {item.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-4">
                <h3 className="text-sm font-semibold text-[#06285f]">Informações</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.025em] text-[#60708a]">
                      Data
                    </dt>
                    <dd className="mt-1 text-[#10213a]">{formatDate(item.date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.025em] text-[#60708a]">
                      Fonte
                    </dt>
                    <dd className="mt-1 text-[#10213a]">{item.sourceLabel}</dd>
                  </div>
                </dl>
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#074fb8]"
                  >
                    Abrir fonte oficial
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              <div className="rounded-lg border border-[#dbe5f1] bg-white p-4">
                <h3 className="text-sm font-semibold text-[#06285f]">Temas</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#074fb8]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </article>

        <div className="flex items-center justify-between gap-3 border-t border-[#dbe5f1] bg-[#f8fbff] px-4 py-4 sm:px-6">
          <button
            type="button"
            data-testid="news-modal-previous"
            onClick={onPrevious}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cfe0f4] bg-white px-4 text-sm font-semibold text-[#06285f] hover:bg-blue-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Anterior
          </button>
          <button
            type="button"
            data-testid="news-modal-next"
            onClick={onNext}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#074fb8] px-4 text-sm font-semibold text-white hover:bg-[#063f92]"
          >
            Próxima notícia
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
