import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ToastProvider } from "@/monitoramento/components/ui/toast-provider";
import { getPublicEnvStatus } from "@/monitoramento/lib/env";

export const metadata: Metadata = {
  title: {
    default: "Sistema de Monitoramento Socioassistencial",
    template: "%s | Sistema de Monitoramento Socioassistencial",
  },
  description:
    "Sistema interno para acompanhamento, monitoramento e gestao das informacoes da rede socioassistencial.",
};

export default function MonitoramentoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const env = getPublicEnvStatus();

  return (
    <section className="monitoramento-system min-h-dvh font-sans antialiased">
      {children}
      <ToastProvider />
      <span className="sr-only">{env.appName}</span>
    </section>
  );
}
