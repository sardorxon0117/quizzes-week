import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const existing = await queryOne(`SELECT id FROM students WHERE id = $1`, [params.id]);
  if (!existing) return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });

  const fullName = body?.fullName !== undefined ? String(body.fullName).trim() : null;
  const studentCode = body?.studentCode !== undefined ? String(body.studentCode).trim() : null;
  const groupId = body?.groupId !== undefined ? Number(body.groupId) : null;
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : null;

  if (studentCode) {
    const clash = await queryOne(`SELECT id FROM students WHERE student_code = $1 AND id != $2`, [studentCode, params.id]);
    if (clash) return NextResponse.json({ error: "Bu ID bilan boshqa talaba mavjud" }, { status: 409 });
  }
  if (groupId !== null) {
    const group = await queryOne(`SELECT id FROM groups WHERE id = $1`, [groupId]);
    if (!group) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
  }

  const rows = await query(
    `UPDATE students SET
      full_name = COALESCE($1, full_name),
      student_code = COALESCE($2, student_code),
      group_id = COALESCE($3, group_id),
      is_active = COALESCE($4, is_active),
      updated_at = NOW()
     WHERE id = $5
     RETURNING id, full_name, student_code, group_id, is_active`,
    [fullName || null, studentCode || null, groupId, isActive, params.id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  const existing = await queryOne(`SELECT id FROM students WHERE id = $1`, [params.id]);
  if (!existing) return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });

  const hasSubmissions = await queryOne(`SELECT id FROM submissions WHERE student_id = $1 LIMIT 1`, [params.id]);
  if (hasSubmissions) {
    // soft-delete: deactivate instead of hard delete, to preserve submission history
    const rows = await query(
      `UPDATE students SET is_active = FALSE, updated_at = NOW() WHERE id = $1
       RETURNING id, full_name, is_active`,
      [params.id]
    );
    return NextResponse.json({ ...rows[0], softDeleted: true });
  }

  await query(`DELETE FROM students WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
