import { AppIcon } from "@/monitoramento/components/ui/app-icon";

export default function ProtectedLoading() {
  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="surface-panel mx-auto max-w-7xl overflow-hidden rounded-[var(--radius-2xl)] p-5 shadow-[var(--shadow-panel)]">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-blue-100 text-blue-800">
            <AppIcon className="animate-pulse" name="monitoring" size="lg" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-normal text-blue-800">
              Carregando
            </p>
            <h1 className="mt-1 text-xl font-bold text-blue-950">
              Preparando as informações da tela
            </h1>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-blue-100">
          <div className="h-full w-1/2 animate-[loading-bar_1.2s_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,#0066cc,#32b7ff)]" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-[var(--radius-xl)] border border-blue-100 bg-white/75 p-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                className="h-12 animate-pulse rounded-[14px] bg-blue-50"
                key={index}
              />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-36 animate-pulse rounded-[var(--radius-xl)] border border-blue-100 bg-white/75" />
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  className="h-28 animate-pulse rounded-[var(--radius-xl)] border border-blue-100 bg-white/75"
                  key={index}
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-[var(--radius-xl)] border border-blue-100 bg-white/75" />
          </div>
        </div>
      </section>
    </div>
  );
}
