export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSetting, COMPETITION_INFO_KEY } from "@/lib/settings";

export async function GET() {
  const competitionInfo = await getSetting(COMPETITION_INFO_KEY);
  return NextResponse.json({ competitionInfo: competitionInfo ?? "" });
}
