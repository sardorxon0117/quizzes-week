import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  const question = await queryOne(
    `SELECT id, code, question, answer, is_active, created_at, updated_at FROM questions WHERE id = $1`,
    [params.id]
  );
  if (!question) return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });
  return NextResponse.json(question);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const { question, answer, is_active } = body || {};
  const existing = await queryOne(`SELECT id FROM questions WHERE id = $1`, [params.id]);
  if (!existing) return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });

  const rows = await query(
    `UPDATE questions SET
       question = COALESCE($1, question),
       answer = COALESCE($2, answer),
       is_active = COALESCE($3, is_active),
       updated_at = NOW()
     WHERE id = $4
     RETURNING id, code, question, answer, is_active, created_at, updated_at`,
    [question ?? null, answer ?? null, typeof is_active === "boolean" ? is_active : null, params.id]
  );

  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  const existing = await queryOne(`SELECT id FROM questions WHERE id = $1`, [params.id]);
  if (!existing) return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });

  await query(`DELETE FROM questions WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
