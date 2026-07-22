import type { Metadata } from "next";
import { ContactSection } from "@/components/home/contact-section";
import { PortalChrome } from "@/components/layout/portal-chrome";

export const metadata: Metadata = {
  title: "Contato",
};

export default function ContatoPage() {
  return (
    <PortalChrome>
      <main id="conteudo">
        <ContactSection showPageLink={false} />
      </main>
    </PortalChrome>
  );
}
