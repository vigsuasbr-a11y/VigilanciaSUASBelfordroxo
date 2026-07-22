import { CheckCircle2, Globe2, ShieldCheck, UsersRound } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { SystemAccessButton } from "@/components/systems/system-access-button";
import { SystemIcon } from "@/components/systems/system-icon";
import { cn } from "@/lib/utils/cn";
import type { PortalSystem } from "@/types/domain";

export function SystemDetailCard({ system }: { system: PortalSystem }) {
  return (
    <article className="rounded-lg border border-[#dbe5f1] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-5">
          <SystemIcon system={system} />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-[#06285f]">{system.name}</h2>
              <StatusBadge status={system.status} />
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#10213a]">
              {system.description}
            </p>
          </div>
        </div>
        <SystemAccessButton
          systemSlug={system.slug}
          status={system.status}
          url={system.url}
          color={system.color}
          className="lg:min-w-60"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoBlock
          icon={Globe2}
          title="Tipo de acesso"
          description={system.accessType}
        />
        <InfoBlock
          icon={ShieldCheck}
          title="Endereço"
          description={system.addressLabel}
        />
        <InfoBlock
          icon={UsersRound}
          title="Público autorizado"
          description={system.authorizedAudience}
        />
      </div>

      <div
        className={cn(
          "mt-6 rounded-lg border p-4 text-sm leading-6",
          system.color === "green"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-blue-200 bg-blue-50 text-[#06285f]",
        )}
      >
        <strong>Mensagem de restrição:</strong> {system.restrictionMessage}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-black text-[#10213a]">Principais recursos</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {system.details.map((detail) => (
            <li key={detail} className="flex gap-2 text-sm leading-6 text-[#60708a]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#00a67e]" aria-hidden="true" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

type InfoBlockProps = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
};

function InfoBlock({ icon: Icon, title, description }: InfoBlockProps) {
  return (
    <div className="rounded-lg border border-[#e6edf7] bg-[#f7f9fd] p-4">
      <Icon className="size-5 text-[#074fb8]" aria-hidden={true} />
      <h3 className="mt-3 text-xs font-black uppercase text-[#60708a]">{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#10213a]">{description}</p>
    </div>
  );
}
