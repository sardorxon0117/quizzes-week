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

  const existing = await queryOne(`SELECT id FROM groups WHERE id = $1`, [params.id]);
  if (!existing) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });

  const { name, is_active } = body || {};
  const rows = await query(
    `UPDATE groups SET
      name = COALESCE($1, name),
      is_active = COALESCE($2, is_active),
      updated_at = NOW()
     WHERE id = $3
     RETURNING id, name, is_active, created_at, updated_at`,
    [name ? String(name).trim() : null, typeof is_active === "boolean" ? is_active : null, params.id]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  const existing = await queryOne(`SELECT id FROM groups WHERE id = $1`, [params.id]);
  if (!existing) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });

  const hasSubmissions = await queryOne(`SELECT id FROM submissions WHERE group_id = $1 LIMIT 1`, [params.id]);
  if (hasSubmissions) {
    // soft-delete: deactivate instead of hard delete, to preserve submission history
    const rows = await query(
      `UPDATE groups SET is_active = FALSE, updated_at = NOW() WHERE id = $1
       RETURNING id, name, is_active`,
      [params.id]
    );
    return NextResponse.json({ ...rows[0], softDeleted: true });
  }

  await query(`DELETE FROM groups WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
