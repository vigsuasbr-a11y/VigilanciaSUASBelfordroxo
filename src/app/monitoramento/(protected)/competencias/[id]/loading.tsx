import { Skeleton } from "@/monitoramento/components/ui/skeleton";

export default function CompetencyWizardLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-32 border border-border bg-white" />
      <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
        <Skeleton className="h-[520px] border border-border bg-white" />
        <div className="space-y-4">
          <Skeleton className="h-32 border border-border bg-white" />
          <Skeleton className="h-56 border border-border bg-white" />
          <Skeleton className="h-56 border border-border bg-white" />
        </div>
      </div>
    </div>
  );
}
