import type { Metadata } from "next";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { PublicacoesNewsClient } from "@/components/publicacoes/publicacoes-news-client";
import { publicationCategories, publicationNews } from "@/data/publicacoes";

export const metadata: Metadata = {
  title: "Publicações",
};

export default function PublicacoesPage() {
  return (
    <PortalChrome>
      <main id="conteudo">
        <PublicacoesNewsClient news={publicationNews} categories={publicationCategories} />
      </main>
    </PortalChrome>
  );
}
