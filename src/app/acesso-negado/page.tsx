import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PortalChrome } from "@/components/layout/portal-chrome";

export const metadata: Metadata = {
  title: "Acesso negado",
};

export default function AcessoNegadoPage() {
  return (
    <PortalChrome>
      <main id="conteudo" className="bg-[#f5f8fc]">
      <section className="mx-auto grid min-h-[62vh] max-w-4xl place-items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-lg border border-[#dbe5f1] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-16 place-items-center rounded-lg bg-red-50 text-red-700">
            <ShieldAlert className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-black text-[#06285f]">Acesso negado</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#60708a]">
            Seu usuário não possui perfil ativo ou permissão para acessar esta
            área. Procure um administrador do sistema.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#dbe5f1] px-5 py-3 text-sm font-bold text-[#06285f] hover:bg-blue-50"
            >
              Voltar ao portal
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#074fb8] px-5 py-3 text-sm font-bold text-white hover:bg-[#063f93]"
            >
              Ir para login
            </Link>
          </div>
        </div>
      </section>
      </main>
    </PortalChrome>
  );
}
