import type { ComponentType } from "react";
import {
  CheckCircle2,
  Globe2,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { SystemAccessButton } from "@/components/systems/system-access-button";
import { SystemIcon } from "@/components/systems/system-icon";
import { SystemIllustration } from "@/components/systems/system-illustration";
import { cn } from "@/lib/utils/cn";
import type { PortalSystem } from "@/types/domain";

export function SystemDetailCard({ system }: { system: PortalSystem }) {
  const isGreen = system.color === "green";

  return (
    <article className="group min-w-0 overflow-hidden rounded-lg border border-[#dbe5f1] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#91bdf0] hover:shadow-[0_22px_54px_rgba(8,39,85,0.12)]">
      <div
        className={cn(
          "grid gap-6 border-b p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto]",
          isGreen
            ? "border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50"
            : "border-blue-100 bg-gradient-to-br from-white via-white to-blue-50",
        )}
      >
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:gap-5">
          <SystemIcon system={system} className="size-14 sm:size-16" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  isGreen
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-[#074fb8]",
                )}
              >
                <LockKeyhole className="size-3.5" aria-hidden="true" />
                {system.accessType}
              </span>
              <StatusBadge status={system.status} />
            </div>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#06285f]">
              {system.name}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4d5f7a]">
              {system.description}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-stretch gap-4 lg:w-[min(18rem,100%)]">
          <SystemAccessButton
            systemSlug={system.slug}
            status={system.status}
            url={system.url}
            color={system.color}
            className="w-full"
          />
          <SystemIllustration color={system.color} />
        </div>
      </div>

      <div className="grid min-w-0 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.025em] text-[#06285f]">
            Principais recursos
          </h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {system.details.map((detail) => (
              <li
                key={detail}
                className="flex min-w-0 gap-3 rounded-lg border border-[#e6edf7] bg-[#f8fbff] p-3 text-sm leading-6 text-[#4d5f7a]"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-[#00a67e]"
                  aria-hidden="true"
                />
                <span className="min-w-0 break-words">{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="grid min-w-0 gap-3">
          <InfoBlock
            icon={Globe2}
            title="Tipo de acesso"
            description={system.accessType}
          />
          <InfoBlock
            icon={MapPinned}
            title="Endereço"
            description={system.addressLabel}
          />
          <InfoBlock
            icon={UsersRound}
            title="Público autorizado"
            description={system.authorizedAudience}
          />
        </aside>
      </div>

      <div
        className={cn(
          "mx-5 mb-5 flex gap-3 rounded-lg border p-4 text-sm leading-6 sm:mx-6 sm:mb-6",
          isGreen
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-blue-200 bg-blue-50 text-[#06285f]",
        )}
      >
        <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Mensagem de restrição:</strong>{" "}
          {system.restrictionMessage}
        </p>
      </div>
    </article>
  );
}

type InfoBlockProps = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
};

function InfoBlock({ icon: Icon, title, description }: InfoBlockProps) {
  return (
    <div className="rounded-lg border border-[#e6edf7] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#f1f6fd] text-[#074fb8]">
          <Icon className="size-5" aria-hidden={true} />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[0.025em] text-[#60708a]">
            {title}
          </span>
          <span className="mt-1 block break-words text-sm font-semibold leading-6 text-[#102d5d]">
            {description}
          </span>
        </span>
      </div>
    </div>
  );
}
