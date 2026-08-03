import { AlertTriangle } from "lucide-react";

import { getPublicEnvStatus } from "@/monitoramento/lib/env";

export function ConfigurationWarning() {
  const env = getPublicEnvStatus();

  if (env.supabaseConfigured) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">Ambiente de acesso ainda não configurado.</p>
        <p className="mt-1 text-amber-800">
          Cadastre as configurações públicas da aplicação para liberar login,
          permissões e gravação dos dados.
        </p>
      </div>
    </div>
  );
}
