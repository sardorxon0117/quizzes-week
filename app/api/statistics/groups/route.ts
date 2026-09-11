export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const ranking = await query(`
    SELECT
      g.id, g.name,
      COUNT(s.id)::int AS found,
      COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct,
      CASE WHEN COUNT(s.id) = 0 THEN 0
        ELSE ROUND(100.0 * COUNT(s.id) FILTER (WHERE s.status = 'CORRECT') / COUNT(s.id), 1)
      END AS pct
    FROM groups g
    LEFT JOIN submissions s ON s.group_id = g.id
    WHERE g.is_active = TRUE
    GROUP BY g.id, g.name
    ORDER BY correct DESC, pct DESC, g.name ASC
  `);
  return NextResponse.json(ranking);
}
