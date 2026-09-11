export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;

  const totals = await queryOne<{
    total_questions: number;
    total_groups: number;
    total_submissions: number;
    pending_submissions: number;
  }>(`
    SELECT
      (SELECT COUNT(*)::int FROM questions) AS total_questions,
      (SELECT COUNT(*)::int FROM groups WHERE is_active = TRUE) AS total_groups,
      (SELECT COUNT(*)::int FROM submissions) AS total_submissions,
      (SELECT COUNT(*)::int FROM submissions WHERE status = 'PENDING') AS pending_submissions
  `);

  return NextResponse.json(totals);
}
