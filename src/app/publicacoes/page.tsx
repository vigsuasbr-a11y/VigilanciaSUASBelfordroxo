import type { Metadata } from "next";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { PublicacoesNewsClient } from "@/components/publicacoes/publicacoes-news-client";
import { getPortalPublicationNews } from "@/services/publicacoes";

export const metadata: Metadata = {
  title: "Notícias",
};

export const dynamic = "force-dynamic";

export default async function PublicacoesPage() {
  const { categories, news } = await getPortalPublicationNews();

  return (
    <PortalChrome>
      <main id="conteudo">
        <PublicacoesNewsClient news={news} categories={categories} />
      </main>
    </PortalChrome>
  );
}
