"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Accessibility,
  ArrowRight,
  CircleHelp,
  Grid2X2,
  LockKeyhole,
  Mail,
  Menu,
  Search,
  X,
} from "lucide-react";
import { navItems } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { PortalLogo } from "./portal-logo";

type SearchItem = {
  label: string;
  description: string;
  href: string;
  keywords: string[];
};

const portalSearchItems: SearchItem[] = [
  {
    label: "A Vigilância Socioassistencial",
    description: "Entenda a função da Vigilância na política de Assistência Social.",
    href: "/a-vigilancia",
    keywords: ["vigilancia", "sobre", "suas", "territorios", "proteção social"],
  },
  {
    label: "Indicadores",
    description: "Consulte os números institucionais acompanhados pelo portal.",
    href: "/indicadores",
    keywords: ["indicadores", "dados", "numeros", "cras", "creas", "centro pop"],
  },
  {
    label: "Gestão de Funcionários",
    description: "Acesso ao sistema restrito de funcionários da SEMASC.",
    href: "/login?redirectTo=/funcionarios",
    keywords: ["funcionarios", "gestao", "servidor", "login", "sistema"],
  },
  {
    label: "Publicações e documentos",
    description: "Relatórios, boletins, orientações técnicas e documentos.",
    href: "/publicacoes",
    keywords: ["publicacoes", "documentos", "relatorios", "boletins", "biblioteca"],
  },
  {
    label: "Serviços e ferramentas",
    description: "Sistemas e serviços disponíveis ou em preparação.",
    href: "/servicos",
    keywords: ["servicos", "ferramentas", "sistemas", "monitoramento"],
  },
  {
    label: "Contato",
    description: "Canais institucionais da Vigilância Socioassistencial.",
    href: "/contato",
    keywords: ["contato", "email", "telefone", "endereco", "fale conosco"],
  },
];

export function HeaderClient() {
  const pathname = usePathname();
  const router = useRouter();
  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const suggestions = getSearchSuggestions(searchTerm);

  useEffect(() => {
    const updateHeaderState = () => setIsScrolled(window.scrollY > 24);

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  useEffect(() => {
    function closeSearchSuggestions(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const isInsideDesktopSearch = desktopSearchRef.current?.contains(target);
      const isInsideMobileSearch = mobileSearchRef.current?.contains(target);

      if (!isInsideDesktopSearch && !isInsideMobileSearch) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("pointerdown", closeSearchSuggestions);

    return () => document.removeEventListener("pointerdown", closeSearchSuggestions);
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [firstSuggestion] = suggestions;

    if (firstSuggestion) {
      router.push(firstSuggestion.href);
      setIsMenuOpen(false);
      setIsSearchFocused(false);
    }
  }

  return (
    <header
      className={cn(
        "public-site-header sticky top-0 z-50 border-b border-[#e6edf7]/70 bg-white text-[#06285f] transition-[background-color,box-shadow,backdrop-filter] duration-300",
        isScrolled && "bg-white/95 shadow-[0_12px_32px_rgba(6,40,95,0.14)] backdrop-blur-xl",
      )}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#06285f]"
      >
        Ir para o conteúdo
      </a>

      <div className="bg-[#031b45] text-white">
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between px-4 text-xs font-medium transition-[padding] duration-300 sm:px-6 lg:px-8",
            isScrolled ? "py-1.5" : "py-2",
          )}
        >
          <div className="flex items-center gap-5">
            <a href="#conteudo" className="inline-flex items-center gap-2 text-blue-100 hover:text-white">
              <Accessibility className="size-4" aria-hidden="true" />
              Acessibilidade
            </a>
            <Link href="/contato" className="hidden items-center gap-2 text-blue-100 hover:text-white sm:inline-flex">
              <Mail className="size-4" aria-hidden="true" />
              Fale conosco
            </Link>
            <Link href="/a-vigilancia" className="hidden items-center gap-2 text-blue-100 hover:text-white md:inline-flex">
              <CircleHelp className="size-4" aria-hidden="true" />
              Perguntas frequentes
            </Link>
          </div>
          <Link
            href="/sistemas"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white"
          >
            <LockKeyhole className="size-4" aria-hidden="true" />
            Acesso aos sistemas
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center gap-8 px-4 transition-[padding] duration-300 sm:px-6 lg:px-8",
          isScrolled ? "py-2.5" : "py-4",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-7">
          <PortalLogo compact tone="dark" />
          <span className="hidden max-w-56 border-l border-[#dbe5f1] pl-7 text-sm font-medium leading-5 text-[#10213a] md:block">
            Secretaria Municipal de Assistência Social e Cidadania
          </span>
        </div>

        <form
          ref={desktopSearchRef}
          onSubmit={handleSearch}
          className="relative hidden min-w-80 max-w-xl flex-[1.2] lg:block"
          role="search"
        >
          <div className="flex items-center gap-3 rounded-lg border border-[#dbe5f1] bg-white px-4 py-3 text-[#10213a] shadow-sm">
            <Search className="size-5 text-[#074fb8]" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsSearchFocused(false);
                }
              }}
              placeholder="O que você deseja encontrar?"
              className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#60708a]"
            />
          </div>
          {isSearchFocused ? (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={() => setIsSearchFocused(false)}
            />
          ) : null}
        </form>

        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          className="grid size-11 place-items-center rounded-lg border border-[#dbe5f1] bg-[#f5f8fc] text-[#06285f] lg:hidden"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <nav className="hidden border-t border-[#e6edf7] bg-white/95 lg:block" aria-label="Menu principal">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center gap-2 px-4 text-sm font-medium text-[#06285f] transition-[padding,color,background-color] duration-300 hover:bg-[#f5f8fc]",
                  isScrolled ? "py-3" : "py-4",
                  active && "text-[#0a5fd7]",
                  item.featured && "font-semibold",
                )}
              >
                {item.featured ? <Grid2X2 className="size-4" aria-hidden="true" /> : null}
                {item.label}
                {active ? (
                  <span className="nav-active-line absolute inset-x-4 bottom-0 h-1 rounded-t bg-[#0a84ff]" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-[#e6edf7] bg-white px-4 pb-5 lg:hidden">
          <form ref={mobileSearchRef} onSubmit={handleSearch} className="mt-4" role="search">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-[#10213a]">
              <Search className="size-5 text-[#074fb8]" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchFocused(false);
                  }
                }}
                placeholder="O que você deseja encontrar?"
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#60708a]"
              />
            </div>
            {isSearchFocused ? (
              <div className="mt-2 rounded-lg border border-white/10 bg-white">
                {suggestions.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsSearchFocused(false);
                    }}
                    className="flex items-center justify-between gap-3 border-b border-[#e6edf7] px-4 py-3 text-sm text-[#10213a] last:border-b-0"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-4 text-[#074fb8]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : null}
          </form>

          <div className="mt-3 rounded-lg border border-[#e6edf7] bg-[#f8fbff] p-2">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-[#06285f]",
                    active && "bg-[#eaf4ff] text-[#074fb8]",
                  )}
                >
                  {item.label}
                  {item.featured ? <Grid2X2 className="size-4" aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SearchSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: SearchItem[];
  onSelect: () => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-lg border border-[#dbe5f1] bg-white text-[#10213a] shadow-xl">
      <div className="border-b border-[#e6edf7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#60708a]">
        Sugestões
      </div>
      {suggestions.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onSelect}
          className="group flex items-start justify-between gap-3 border-b border-[#edf2f8] px-4 py-3 last:border-b-0 hover:bg-[#f5f8fc]"
        >
          <span>
            <span className="block text-sm font-semibold text-[#06285f]">{item.label}</span>
            <span className="mt-1 block text-xs leading-5 text-[#60708a]">{item.description}</span>
          </span>
          <ArrowRight className="mt-1 size-4 shrink-0 text-[#074fb8] group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

function getSearchSuggestions(term: string) {
  const normalizedTerm = normalizeSearch(term);

  if (!normalizedTerm) {
    return portalSearchItems.slice(0, 5);
  }

  return portalSearchItems
    .filter((item) => {
      const haystack = normalizeSearch(
        [item.label, item.description, ...item.keywords].join(" "),
      );
      return haystack.includes(normalizedTerm);
    })
    .slice(0, 6);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
