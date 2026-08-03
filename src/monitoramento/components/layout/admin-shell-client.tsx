"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type MouseEvent,
  type RefObject,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Breadcrumbs } from "@/monitoramento/components/layout/breadcrumbs";
import { AppIcon, type AppIconName } from "@/monitoramento/components/ui/app-icon";
import { cn } from "@/monitoramento/lib/utils/cn";

export type AdminNavSection = {
  items: Array<{
    href: Route;
    icon: AppIconName;
    label: string;
  }>;
  label: string;
};

type AdminShellClientProps = {
  appName: string;
  appVersion: string;
  children: ReactNode;
  environmentLabel: string | null;
  sections: AdminNavSection[];
  signOutAction: () => Promise<void>;
  user: {
    displayName: string;
    email: string | null;
    roles: string[];
  };
};

const SIDEBAR_STORAGE_KEY = "smas-sidebar-collapsed";

export function AdminShellClient({
  appName,
  appVersion,
  children,
  environmentLabel,
  sections,
  signOutAction,
  user,
}: AdminShellClientProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!userMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query, sections]);

  function closeMobileMenu() {
    setMobileOpen(false);
    window.setTimeout(() => mobileButtonRef.current?.focus(), 0);
  }

  return (
    <div
      className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(22,123,231,0.10),transparent_34rem),radial-gradient(circle_at_100%_100%,rgba(7,148,85,0.06),transparent_28rem),linear-gradient(135deg,#fbfdff_0%,#f7faff_45%,#edf4fb_100%)] lg:grid"
      style={{
        gridTemplateColumns: collapsed
          ? "80px minmax(0,1fr)"
          : "clamp(248px,21vw,280px) minmax(0,1fr)",
      }}
    >
      <aside className="sticky top-0 hidden h-dvh min-h-0 overflow-hidden border-r border-blue-900/20 bg-[radial-gradient(circle_at_30%_4%,rgba(77,156,241,0.34),transparent_18rem),linear-gradient(180deg,#075ba5_0%,#003d7a_52%,#062a56_100%)] text-white shadow-[18px_0_46px_rgba(0,41,82,0.15)] lg:flex lg:flex-col">
        <SidebarContent
          appName={appName}
          appVersion={appVersion}
          collapsed={collapsed}
          environmentLabel={environmentLabel}
          onCollapse={() => setCollapsed((current) => !current)}
          pathname={pathname}
          query={query}
          sections={visibleSections}
          setQuery={setQuery}
          user={user}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-950/52 backdrop-blur-[2px]"
            onClick={closeMobileMenu}
            type="button"
          />
          <aside
            aria-label="Menu principal"
            aria-modal="true"
            className="absolute inset-y-0 left-0 flex w-[min(88vw,320px)] flex-col overflow-hidden bg-[radial-gradient(circle_at_30%_4%,rgba(77,156,241,0.34),transparent_18rem),linear-gradient(180deg,#075ba5_0%,#003d7a_52%,#062a56_100%)] text-white shadow-[24px_0_80px_rgba(15,23,42,0.28)]"
            role="dialog"
          >
            <SidebarContent
              appName={appName}
              appVersion={appVersion}
              collapsed={false}
              environmentLabel={environmentLabel}
              onCollapse={closeMobileMenu}
              pathname={pathname}
              query={query}
              sections={visibleSections}
              setQuery={setQuery}
              user={user}
              mobile
            />
          </aside>
        </div>
      ) : null}

      <div className="monitoramento-shell-main min-w-0 overflow-x-hidden">
        <header className="sticky top-0 z-30 flex min-h-16 min-w-0 items-center justify-between gap-3 border-b border-blue-100/70 bg-white/84 px-4 shadow-[0_10px_28px_rgba(15,23,42,0.065)] backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Abrir menu"
              className="icon-surface inline-flex h-10 w-10 items-center justify-center rounded-[12px] text-blue-800 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
              onClick={() => setMobileOpen(true)}
              ref={mobileButtonRef}
              type="button"
            >
              <AppIcon name="menu" size="sm" />
            </button>
            <div className="min-w-0">
              <Breadcrumbs />
              {environmentLabel ? (
                <p className="mt-1 text-xs font-semibold uppercase text-amber-700">
                  {environmentLabel}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-[linear-gradient(135deg,#f7fffb,#ecfdf3)] px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:inline-flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(18,183,106,0.14)]" />
              Sistema online
            </span>
            <Link
              className="icon-surface hidden h-10 w-10 items-center justify-center rounded-[12px] text-blue-800 transition hover:-translate-y-0.5 lg:inline-flex"
              href="/monitoramento/ajuda"
              title="Ajuda"
            >
              <AppIcon name="help" size="sm" />
              <span className="sr-only">Ajuda</span>
            </Link>
            <UserMenu
              open={userMenuOpen}
              setOpen={setUserMenuOpen}
              signOutAction={signOutAction}
              user={user}
              userMenuRef={userMenuRef}
            />
          </div>
        </header>

        <main className="mx-auto min-w-0 w-full max-w-[var(--app-content-max)] px-4 py-5 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
          {children}
        </main>
        <span className="sr-only">{appName}</span>
      </div>
    </div>
  );
}

function SidebarContent({
  appName,
  appVersion,
  collapsed,
  environmentLabel,
  mobile = false,
  onCollapse,
  pathname,
  query,
  sections,
  setQuery,
  user,
}: {
  appName: string;
  appVersion: string;
  collapsed: boolean;
  environmentLabel: string | null;
  mobile?: boolean;
  onCollapse: () => void;
  pathname: string;
  query: string;
  sections: AdminNavSection[];
  setQuery: (value: string) => void;
  user: AdminShellClientProps["user"];
}) {
  return (
    <>
      <div className="relative flex min-h-20 items-center gap-3 border-b border-white/10 px-4">
        <span
          className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent"
          aria-hidden="true"
        />
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/18 bg-white/92 text-blue-700 shadow-[0_14px_30px_rgba(0,20,41,0.2)] backdrop-blur">
          <AppIcon name="monitoring" size="md" />
        </div>
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold leading-tight">
              Monitoramento
            </p>
            <p className="mt-1 truncate text-xs font-medium text-white/76">
              Socioassistencial
            </p>
          </div>
        ) : null}
        <button
          aria-label={mobile ? "Fechar menu" : "Recolher menu"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-white/80 transition duration-200 hover:bg-white/12 hover:text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={onCollapse}
          type="button"
        >
          <AppIcon
            name={mobile ? "cancel" : collapsed ? "expand" : "collapse"}
            size="sm"
          />
        </button>
      </div>

      {!collapsed ? (
        <div className="border-b border-white/10 px-4 py-3">
          <label className="relative block">
            <span className="sr-only">Buscar no menu</span>
            <AppIcon
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55"
              name="search"
              size="sm"
            />
            <input
              className="h-10 w-full rounded-[12px] border border-white/12 bg-white/10 pl-9 pr-3 text-sm font-medium text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-white/55 hover:border-white/20 focus:border-white/36 focus:bg-white/14 focus:ring-2 focus:ring-white/18"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tela"
              type="search"
              value={query}
            />
          </label>
        </div>
      ) : null}

      <nav
        aria-label="Navegação principal"
        className={cn(
          "monitoramento-sidebar-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5",
          collapsed ? "px-2" : "",
        )}
      >
        {sections.map((section) => (
          <section key={section.label}>
            {!collapsed ? (
              <h2 className="px-2 text-xs font-medium uppercase tracking-wide text-white/56">
                {section.label}
              </h2>
            ) : null}
            <div className="mt-2 space-y-1">
              {section.items.map((item) => (
                <SidebarLink
                  collapsed={collapsed}
                  item={item}
                  key={item.href}
                  pathname={pathname}
                />
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={cn(
            "rounded-[16px] border border-white/12 bg-white/9 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_30px_rgba(0,20,41,0.14)] backdrop-blur",
            collapsed ? "flex justify-center p-2" : "",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={user.displayName} />
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user.displayName}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/70">
                  {user.roles.join(", ") || "Usuário"}
                </p>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-2 text-[11px] font-medium text-white/58">
              <span>v{appVersion}</span>
              {environmentLabel ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{environmentLabel}</span>
                </>
              ) : null}
              <span className="sr-only">{appName}</span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function SidebarLink({
  collapsed,
  item,
  pathname,
}: {
  collapsed: boolean;
  item: AdminNavSection["items"][number];
  pathname: string;
}) {
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-[13px] px-3 text-sm font-medium text-white/84 transition duration-200 ease-out hover:translate-x-0.5 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/45",
        active
          ? "bg-[linear-gradient(90deg,rgba(77,156,241,0.95),rgba(0,82,163,0.92))] text-white shadow-[0_14px_28px_rgba(0,20,41,0.2),inset_0_1px_0_rgba(255,255,255,0.18)]"
          : "",
        collapsed ? "justify-center px-0" : "",
      )}
      href={item.href}
      title={collapsed ? item.label : undefined}
    >
      {active ? (
        <span
          className="absolute left-0 h-7 w-1 rounded-r-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.88)]"
          aria-hidden="true"
        />
      ) : null}
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-[11px] transition duration-200",
          active
            ? "bg-white/16 text-white"
            : "bg-white/0 text-white/82 group-hover:bg-white/12 group-hover:text-white",
        )}
      >
        <AppIcon
          className="transition duration-200 group-hover:scale-105"
          name={item.icon}
          size="sm"
        />
      </span>
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

function UserMenu({
  open,
  setOpen,
  signOutAction,
  user,
  userMenuRef,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  signOutAction: () => Promise<void>;
  user: AdminShellClientProps["user"];
  userMenuRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative min-w-0" ref={userMenuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 min-w-0 items-center gap-3 rounded-[14px] border border-blue-100 bg-white/92 px-2 py-1.5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.055)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50/82 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)] focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <Avatar name={user.displayName} />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-44 truncate text-sm font-semibold text-blue-950">
            {user.displayName}
          </span>
          <span className="block max-w-44 truncate text-xs font-medium text-muted-foreground">
            {user.roles.join(", ") || "Usuário"}
          </span>
        </span>
        <AppIcon
          className="hidden text-muted-foreground sm:block"
          name="open"
          size="xs"
        />
      </button>

      {open ? (
        <div
          className="page-transition absolute right-0 z-[9999] mt-2 w-64 overflow-hidden rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
          role="menu"
        >
          <div className="border-b border-blue-100 bg-blue-50 p-3">
            <p className="truncate text-sm font-semibold text-blue-950">
              {user.displayName}
            </p>
            {user.email ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            ) : null}
          </div>
          <div className="p-2">
            <MenuLink href="/monitoramento/ajuda" icon="help" onClick={() => setOpen(false)}>
              Ajuda
            </MenuLink>
            <MenuLink href="/monitoramento/sobre" icon="about" onClick={() => setOpen(false)}>
              Sobre o sistema
            </MenuLink>
            <form
              action={signOutAction}
              className="mt-2 border-t border-blue-100 pt-2"
            >
              <button
                className="flex min-h-11 w-full items-center gap-2 rounded-[12px] px-3.5 py-2 text-sm font-medium text-red-700 transition duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                role="menuitem"
                type="submit"
              >
                <AppIcon name="logout" size="sm" />
                Encerrar sessão
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  children,
  href,
  icon,
  onClick,
}: {
  children: ReactNode;
  href: Route;
  icon: AppIconName;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      className="flex min-h-11 items-center gap-2 rounded-[12px] px-3.5 py-2 text-sm font-medium text-blue-900 transition duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary"
      href={href}
      onClick={onClick}
      role="menuitem"
    >
      <AppIcon name={icon} size="sm" />
      {children}
    </Link>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4d9cf1,#075ba5)] text-xs font-semibold text-white shadow-[0_10px_22px_rgba(0,82,163,0.22)]">
      {initials(name)}
    </span>
  );
}

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "US";
}

function isActivePath(pathname: string, href: string) {
  if (href === "/monitoramento/inicio") {
    return pathname === "/" || pathname === "/monitoramento/inicio";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
