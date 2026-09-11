export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET() {
  const totals = await queryOne(`
    SELECT
      (SELECT COUNT(*)::int FROM questions WHERE is_active = TRUE) AS total_questions,
      (SELECT COUNT(*)::int FROM groups WHERE is_active = TRUE) AS total_groups,
      (SELECT COUNT(*)::int FROM submissions)::int AS total_submissions
  `);
  return NextResponse.json(totals);
}
