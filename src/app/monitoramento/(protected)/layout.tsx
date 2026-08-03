import type { ReactNode } from "react";

import { AdminShell } from "@/monitoramento/components/layout/admin-shell";
import { requireActiveSession } from "@/monitoramento/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireActiveSession();

  return <AdminShell context={context}>{children}</AdminShell>;
}
