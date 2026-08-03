import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-md border border-border bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-red-50 text-red-700">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua sessão não possui permissão ativa para acessar esta área.
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          href="/monitoramento/login"
        >
          Voltar ao login
        </Link>
      </div>
    </main>
  );
}
