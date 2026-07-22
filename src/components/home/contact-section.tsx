import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/section-heading";

type ContactSectionProps = {
  showPageLink?: boolean;
};

export function ContactSection({ showPageLink = true }: ContactSectionProps) {
  return (
    <section className="bg-[#f5f8fc] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-lg border border-[#dbe5f1] bg-white p-7 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            as="h1"
            centered={false}
            eyebrow="Contato"
            title="Fale com a Vigilância"
            description="Use os canais institucionais para dúvidas, informações e orientações sobre o portal."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <ContactItem
              icon={<Mail className="size-5" aria-hidden="true" />}
              label="E-mail"
              value={siteConfig.email}
              href={`mailto:${siteConfig.email}`}
            />
            <ContactItem
              icon={<Phone className="size-5" aria-hidden="true" />}
              label="Telefone"
              value={siteConfig.phone}
              href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
            />
            <ContactItem
              icon={<MapPin className="size-5" aria-hidden="true" />}
              label="Endereço"
              value={siteConfig.address}
            />
          </div>
          {showPageLink ? (
            <Link
              href="/contato"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#074fb8] lg:col-start-2"
            >
              Ver página de contato
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-[#074fb8]">
        {icon}
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#60708a]">
          {label}
        </span>
        <span className="mt-1 block text-sm font-semibold leading-5 text-[#06285f]">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex gap-3 rounded-lg border border-[#e6edf7] p-4 hover:bg-[#f8fbff]">
        {content}
      </a>
    );
  }

  return (
    <div className="flex gap-3 rounded-lg border border-[#e6edf7] p-4">
      {content}
    </div>
  );
}
