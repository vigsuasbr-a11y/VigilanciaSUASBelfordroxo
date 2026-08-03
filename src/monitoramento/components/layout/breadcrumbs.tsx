"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppIcon } from "@/monitoramento/components/ui/app-icon";

const LABELS = new Map<string, string>([
  ["inicio", "Início"],
  ["unidades", "Unidades"],
  ["grupos", "Grupos"],
  ["indicadores", "Indicadores"],
  ["competencias", "Competências"],
  ["monitoramento", "Monitoramento"],
  ["executivo", "Executivo"],
  ["nova", "Nova competência"],
  ["usuarios", "Usuários"],
  ["permissoes", "Permissões"],
  ["auditoria", "Auditoria"],
  ["diagnostico", "Diagnóstico"],
  ["ajuda", "Ajuda"],
  ["sobre", "Sobre"],
  ["formularios", "Formulários"],
]);

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
        <li className="min-w-0">
          {parts.length === 0 || pathname === "/monitoramento/inicio" ? (
            <span
              aria-current="page"
              className="font-bold text-blue-950"
              title="Início"
            >
              Início
            </span>
          ) : (
            <Link
              className="font-medium transition hover:text-blue-900"
              href="/monitoramento/inicio"
            >
              Início
            </Link>
          )}
        </li>
        {parts
          .filter((part) => part !== "inicio")
          .map((part, index, filteredParts) => {
            const originalIndex = parts.indexOf(part);
            const href =
              `/${parts.slice(0, originalIndex + 1).join("/")}` as Route;
            const label = labelForSegment(part, parts[originalIndex - 1]);
            const current = index === filteredParts.length - 1;

            return (
              <li className="flex min-w-0 items-center gap-1.5" key={href}>
                <AppIcon className="text-slate-400" name="open" size="xs" />
                {current ? (
                  <span
                    aria-current="page"
                    className="max-w-[220px] truncate font-bold text-blue-950 sm:max-w-none"
                    title={label}
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    className="max-w-[180px] truncate font-medium transition hover:text-blue-900 sm:max-w-none"
                    href={href}
                    title={label}
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
      </ol>
    </nav>
  );
}

function labelForSegment(part: string, previousPart?: string): string {
  const staticLabel = LABELS.get(part);

  if (staticLabel) {
    return staticLabel;
  }

  if (isUuid(part)) {
    if (previousPart === "competencias") {
      return "Detalhe da competência";
    }

    return "Detalhe";
  }

  if (previousPart === "indicadores") {
    return "Detalhe do indicador";
  }

  return humanizeSegment(part);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function humanizeSegment(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
