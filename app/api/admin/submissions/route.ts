export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

export async function GET(req: NextRequest) {
  const denied = requireAdmin();
  if (denied) return denied;

  const status = req.nextUrl.searchParams.get("status");
  const validStatuses = ["PENDING", "CORRECT", "WRONG"];

  const params: any[] = [];
  let where = "";
  if (status && validStatuses.includes(status)) {
    params.push(status);
    where = `WHERE s.status = $1`;
  }

  const rows = await query(
    `SELECT s.id, s.status, s.student_answer, s.submitted_at, s.reviewed_at,
            q.id AS question_id, q.code AS question_code, q.question, q.answer AS correct_answer,
            g.id AS group_id, g.name AS group_name
     FROM submissions s
     JOIN questions q ON q.id = s.question_id
     JOIN groups g ON g.id = s.group_id
     ${where}
     ORDER BY s.submitted_at DESC`,
    params
  );

  return NextResponse.json(rows);
}
