import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const { status } = body || {};
  if (!["CORRECT", "WRONG"].includes(status)) {
    return NextResponse.json({ error: "Status noto'g'ri" }, { status: 400 });
  }

  const existing = await queryOne(`SELECT id FROM submissions WHERE id = $1`, [params.id]);
  if (!existing) return NextResponse.json({ error: "Javob topilmadi" }, { status: 404 });

  const rows = await query(
    `UPDATE submissions SET status = $1, reviewed_at = NOW() WHERE id = $2
     RETURNING id, status, reviewed_at`,
    [status, params.id]
  );

  return NextResponse.json(rows[0]);
}
