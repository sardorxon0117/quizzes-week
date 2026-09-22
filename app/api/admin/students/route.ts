export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;

  const students = await query(
    `SELECT st.id, st.full_name, st.student_code, st.is_active, st.created_at,
            g.id AS group_id, g.name AS group_name,
            COUNT(s.id)::int AS found,
            COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct
     FROM students st
     JOIN groups g ON g.id = st.group_id
     LEFT JOIN submissions s ON s.student_id = st.id
     GROUP BY st.id, g.id
     ORDER BY g.name ASC, st.full_name ASC`
  );
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin();
  if (denied) return denied;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const fullName = String(body?.fullName || "").trim();
  const studentCode = String(body?.studentCode || "").trim();
  const groupId = Number(body?.groupId);

  if (!fullName) return NextResponse.json({ error: "Ism familiyani kiriting" }, { status: 400 });
  if (!studentCode) return NextResponse.json({ error: "Talaba ID sini kiriting" }, { status: 400 });
  if (!Number.isInteger(groupId)) return NextResponse.json({ error: "Guruhni tanlang" }, { status: 400 });

  const group = await queryOne(`SELECT id, name FROM groups WHERE id = $1`, [groupId]);
  if (!group) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });

  const existing = await queryOne(`SELECT id FROM students WHERE student_code = $1`, [studentCode]);
  if (existing) return NextResponse.json({ error: "Bu ID bilan talaba allaqachon mavjud" }, { status: 409 });

  const rows = await query(
    `INSERT INTO students (full_name, student_code, group_id)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, student_code, is_active, created_at`,
    [fullName, studentCode, groupId]
  );
  return NextResponse.json({ ...rows[0], group_id: groupId, group_name: (group as any).name, found: 0, correct: 0 }, { status: 201 });
}
