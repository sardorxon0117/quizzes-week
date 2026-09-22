import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { parseStudentsWorkbook } from "@/lib/parseStudentsWorkbook";

export async function POST(req: NextRequest) {
  const denied = requireAdmin();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Fayl yuborishda xatolik yuz berdi" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  }

  let parsed;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    parsed = parseStudentsWorkbook(buffer);
  } catch {
    return NextResponse.json(
      { error: "Faylni o'qib bo'lmadi. Excel (.xlsx/.xls/.csv) formatida ekanligini tekshiring." },
      { status: 400 }
    );
  }

  if (!parsed.rows.length && !parsed.skipped.length) {
    return NextResponse.json({ error: "Faylda ma'lumot topilmadi" }, { status: 400 });
  }

  const groups = await query<{ id: number; name: string }>(`SELECT id, name FROM groups`);
  const groupByName = new Map(groups.map((g) => [g.name.trim().toLowerCase(), g.id]));

  let created = 0;
  let updated = 0;
  const errors: { row: number; reason: string }[] = [...parsed.skipped];

  for (const r of parsed.rows) {
    const groupId = groupByName.get(r.groupLabel.toLowerCase());
    if (!groupId) {
      errors.push({ row: r.row, reason: `"${r.groupLabel}" nomli guruh topilmadi — avval Guruhlar bo'limida yarating` });
      continue;
    }

    try {
      const result = await query<{ inserted: boolean }>(
        `INSERT INTO students (full_name, student_code, group_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (student_code) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           group_id = EXCLUDED.group_id,
           is_active = TRUE,
           updated_at = NOW()
         RETURNING (xmax = 0) AS inserted`,
        [r.fullName, r.studentCode, groupId]
      );
      if (result[0]?.inserted) created++;
      else updated++;
    } catch {
      errors.push({ row: r.row, reason: "Saqlashda xatolik yuz berdi" });
    }
  }

  return NextResponse.json({ created, updated, errors });
}
