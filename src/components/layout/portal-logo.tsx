import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

type PortalLogoProps = {
  compact?: boolean;
  tone?: "light" | "dark";
};

export function PortalLogo({ compact = false, tone = "light" }: PortalLogoProps) {
  const isDark = tone === "dark";

  return (
    <Link href="/" className="group flex items-center gap-3">
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-lg border bg-white p-1 shadow-sm",
          isDark ? "border-[#dbe5f1]" : "border-white/18",
        )}
      >
        <Image
          src="/funcionarios/assets/iconebelford-web.png"
          alt="Brasão da Prefeitura de Belford Roxo"
          width={52}
          height={52}
          priority={!compact}
        />
      </span>
      <span className={cn("leading-none", isDark ? "text-[#06285f]" : "text-white")}>
        <span
          className={cn(
            "block text-[0.62rem] font-semibold uppercase tracking-[0.04em]",
            isDark ? "text-[#074fb8]" : "text-sky-200",
          )}
        >
          Prefeitura de
        </span>
        <span className="mt-1 block text-xl font-bold uppercase leading-5 tracking-[-0.02em]">
          Belford
          <br />
          Roxo
        </span>
        {!compact ? (
          <span
            className={cn(
              "mt-2 block max-w-44 text-xs leading-4",
              isDark ? "text-[#38506f]" : "text-blue-100",
            )}
          >
            {siteConfig.secretary}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
