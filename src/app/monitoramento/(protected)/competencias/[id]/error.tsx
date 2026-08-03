"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/monitoramento/components/ui/button";

export default function CompetencyWizardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-5 text-red-900">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        Não foi possível carregar o formulário da competência.
      </div>
      <p className="mt-2 text-sm">
        Confira sua sessão, suas permissões e a conexão de dados, depois tente
        novamente.
      </p>
      <Button
        className="mt-4"
        onClick={reset}
        type="button"
        variant="secondary"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Tentar novamente
      </Button>
    </div>
  );
}
