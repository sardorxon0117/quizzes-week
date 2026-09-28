export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { fromTashkentInput, getGamePeriod, getGameState, saveGamePeriod, toTashkentInput } from "@/lib/gamePeriod";

async function currentPayload() {
  const [period, state] = await Promise.all([getGamePeriod(), getGameState()]);
  return { start: toTashkentInput(period.start), end: toTashkentInput(period.end), status: state.status };
}

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await currentPayload());
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const start = fromTashkentInput(String(body?.start ?? ""));
  const end = fromTashkentInput(String(body?.end ?? ""));

  if (start === undefined || end === undefined) {
    return NextResponse.json({ error: "Sana noto'g'ri formatda" }, { status: 400 });
  }
  if (start && end && end <= start) {
    return NextResponse.json({ error: "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak" }, { status: 400 });
  }

  await saveGamePeriod({ start, end });
  return NextResponse.json(await currentPayload());
}
