import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      system: "monitoramento-socioassistencial",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
