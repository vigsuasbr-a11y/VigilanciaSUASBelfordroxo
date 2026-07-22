import Link from "next/link";
import { Grid2X2, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { projectContent } from "@/content/project";
import { PortalLogo } from "./portal-logo";

export function SiteFooter() {
  return (
    <footer className="bg-[#031b45] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.15fr_1.25fr_0.8fr_0.9fr] lg:px-8">
        <div>
          <PortalLogo compact />
          <p className="mt-4 max-w-xs text-sm leading-6 text-blue-100">
            {siteConfig.secretary}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold">Vigilância Socioassistencial</h2>
          <ul className="mt-4 space-y-3 text-sm text-blue-100">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{siteConfig.address}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <a href={`tel:${siteConfig.phone.replace(/\D/g, "")}`} className="hover:text-white">
                {siteConfig.phone}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold">Links rápidos</h2>
          <ul className="mt-4 space-y-2 text-sm text-blue-100">
            <li>
              <Link href="/a-vigilancia" className="hover:text-white">
                A Vigilância
              </Link>
            </li>
            <li>
              <Link href="/servicos" className="hover:text-white">
                Serviços
              </Link>
            </li>
            <li>
              <Link href="/indicadores" className="hover:text-white">
                Indicadores
              </Link>
            </li>
            <li>
              <Link href="/publicacoes" className="hover:text-white">
                Publicações
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-white">
                Contato
              </Link>
            </li>
            <li>
              <Link href="/sobre-o-projeto" className="hover:text-white">
                Sobre o projeto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold">Acesso aos sistemas</h2>
          <p className="mt-4 text-sm leading-6 text-blue-100">
            O portal é público. Sistemas internos solicitam autenticação apenas no
            momento do acesso.
          </p>
          <Link
            href="/sistemas"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#074fb8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0a84ff]"
          >
            <Grid2X2 className="size-4" aria-hidden="true" />
            Acessar sistemas
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-blue-100 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Prefeitura de Belford Roxo. Todos os direitos reservados.</span>
            <span>Portal público da Vigilância Socioassistencial.</span>
          </div>
          <div className="flex flex-col gap-1 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/sobre-o-projeto" className="hover:text-white">
              {projectContent.footerCredit}
            </Link>
            <span className="text-blue-200/80">{projectContent.footerNote}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
