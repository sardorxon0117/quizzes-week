import { NextRequest, NextResponse } from "next/server";
import { queryOne, withTransaction } from "@/lib/db";

export async function GET(req: NextRequest) {
  const questionId = Number(req.nextUrl.searchParams.get("questionId"));

  if (!Number.isInteger(questionId)) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const submission = await queryOne(
    `SELECT s.id, s.status, s.submitted_at, g.name AS group_name
     FROM submissions s
     JOIN groups g ON g.id = s.group_id
     WHERE s.question_id = $1
     ORDER BY s.submitted_at ASC
     LIMIT 1`,
    [questionId]
  );

  return NextResponse.json({ answered: Boolean(submission), submission });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const { questionId, groupId, answer } = body || {};

  if (!questionId || !groupId) {
    return NextResponse.json({ error: "Iltimos, guruhingizni tanlang." }, { status: 400 });
  }
  if (!answer || !String(answer).trim()) {
    return NextResponse.json({ error: "Javobni kiriting." }, { status: 400 });
  }

  try {
    const result = await withTransaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock($1)", [questionId]);

      const question = await client.query(`SELECT id, is_active FROM questions WHERE id = $1`, [questionId]);
      if (question.rowCount === 0) return { error: "Savol topilmadi", status: 404 };
      if (!question.rows[0].is_active) return { error: "Bu savol hozir mavjud emas.", status: 403 };

      const group = await client.query(`SELECT id FROM groups WHERE id = $1 AND is_active = TRUE`, [groupId]);
      if (group.rowCount === 0) return { error: "Guruh topilmadi", status: 404 };

      const existing = await client.query(
        `SELECT g.name AS group_name FROM submissions s JOIN groups g ON g.id = s.group_id
         WHERE s.question_id = $1 ORDER BY s.submitted_at ASC LIMIT 1`,
        [questionId]
      );
      if (existing.rowCount) {
        return {
          error: `Bu savolga ${existing.rows[0].group_name} guruhi tomonidan javob berilgan.`,
          groupName: existing.rows[0].group_name,
          status: 409,
        };
      }

      const inserted = await client.query(
        `INSERT INTO submissions (question_id, group_id, student_answer, status)
         VALUES ($1, $2, $3, 'PENDING') RETURNING id, status, submitted_at`,
        [questionId, groupId, String(answer).trim()]
      );
      return { data: inserted.rows[0], status: 201 };
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, groupName: result.groupName },
        { status: result.status }
      );
    }
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: "Javobni saqlashda xatolik yuz berdi." }, { status: 500 });
  }
}
