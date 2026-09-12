export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { getSetting, setSetting, sanitizeRichText, COMPETITION_INFO_KEY } from "@/lib/settings";

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const competitionInfo = await getSetting(COMPETITION_INFO_KEY);
  return NextResponse.json({ competitionInfo: competitionInfo ?? "" });
}

export async function PUT(req: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.competitionInfo !== "string") {
    return NextResponse.json({ error: "competitionInfo matni kerak" }, { status: 400 });
  }

  const clean = sanitizeRichText(body.competitionInfo);
  await setSetting(COMPETITION_INFO_KEY, clean);
  return NextResponse.json({ competitionInfo: clean });
}
