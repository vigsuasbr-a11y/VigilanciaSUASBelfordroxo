import { NextRequest, NextResponse } from "next/server";
import { registerAccessLog } from "@/services/access-logs";
import { getSystemBySlug } from "@/services/systems";

type AccessLogPayload = {
  systemSlug?: string;
  metadata?: Record<string, string | boolean | null>;
};

export async function POST(request: NextRequest) {
  let payload: AccessLogPayload;

  try {
    payload = (await request.json()) as AccessLogPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Payload inválido." }, { status: 400 });
  }

  if (!payload.systemSlug) {
    return NextResponse.json({ ok: false, message: "Sistema não informado." }, { status: 400 });
  }

  const system = await getSystemBySlug(payload.systemSlug);
  const allowed = Boolean(system?.url && system.status === "operacional");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");

  const result = await registerAccessLog({
    systemSlug: payload.systemSlug,
    status: system?.status ?? null,
    success: allowed,
    userAgent: request.headers.get("user-agent"),
    ipAddress,
    metadata: {
      ...payload.metadata,
      statusCheckedOnServer: true,
      systemFound: Boolean(system),
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível registrar o acesso." },
      { status: 500 },
    );
  }

  if (!allowed) {
    return NextResponse.json(
      { ok: false, message: "Acesso não liberado para este sistema." },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
