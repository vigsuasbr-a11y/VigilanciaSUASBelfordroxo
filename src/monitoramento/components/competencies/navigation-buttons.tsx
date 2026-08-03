"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/monitoramento/components/ui/button";
import type { CompletionStats } from "@/monitoramento/features/competencies/wizard/utils";

export function NavigationButtons({
  isFirst,
  isLast,
  canEdit,
  canSubmit,
  stats,
  saveSummary,
  lastSavedLabel,
  onPrevious,
  onNext,
  onSave,
  onSubmit,
}: {
  isFirst: boolean;
  isLast: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  stats: CompletionStats;
  saveSummary: "saved" | "dirty" | "saving" | "error";
  lastSavedLabel?: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onSubmit: () => void;
}) {
  const savedText = {
    saved: lastSavedLabel
      ? `Último salvamento: ${lastSavedLabel}`
      : "Aguardando primeiro salvamento",
    dirty: "Existem alterações pendentes",
    saving: "Salvando alterações",
    error: "Há campos com erro de salvamento",
  } satisfies Record<typeof saveSummary, string>;

  return (
    <div className="sticky bottom-0 z-20 -mx-4 rounded-t-[18px] border border-blue-100 bg-white/88 px-4 py-4 shadow-[0_-18px_42px_rgba(15,23,42,0.10)] backdrop-blur-xl md:bottom-4 md:mx-0 md:rounded-[18px]">
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.75fr)_minmax(260px,1fr)_auto] xl:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#2585ff,#075fdc)] text-white shadow-[0_12px_28px_rgba(0,102,204,0.22)]">
            <Save className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-blue-700">
              Progresso da competência
            </p>
            <p className="mt-0.5 text-xl font-semibold text-blue-950">
              {stats.informed + stats.notApplicable} de {stats.total} campos
            </p>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center gap-3">
            <div className="h-2.5 min-w-32 flex-1 overflow-hidden rounded-full bg-blue-50">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#167be7,#12b76a)] shadow-[0_0_14px_rgba(22,123,231,0.28)] transition-all duration-300 ease-out"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {stats.informed + stats.notApplicable} de {stats.total} campos
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck
              className={`h-4 w-4 ${saveSummary === "error" ? "text-red-600" : saveSummary === "dirty" ? "text-amber-600" : "text-emerald-600"}`}
              aria-hidden="true"
            />
            {savedText[saveSummary]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-blue-100 bg-white/92 px-3 py-2 text-sm font-semibold text-blue-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 active:translate-y-0 active:scale-[0.985]"
            href="/monitoramento/competencias"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Link>

          <Button
            disabled={isFirst}
            onClick={onPrevious}
            type="button"
            variant="secondary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </Button>
          <Button
            disabled={!canEdit}
            onClick={onSave}
            type="button"
            variant="secondary"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Validar etapa
          </Button>
          {isLast ? (
            <Button disabled={!canSubmit} onClick={onSubmit} type="button">
              <Send className="h-4 w-4" aria-hidden="true" />
              Enviar revisão
            </Button>
          ) : (
            <Button onClick={onNext} type="button">
              Próxima etapa
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
