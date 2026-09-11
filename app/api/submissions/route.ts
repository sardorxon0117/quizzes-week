import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const questionId = Number(req.nextUrl.searchParams.get("questionId"));
  const groupId = Number(req.nextUrl.searchParams.get("groupId"));

  if (!Number.isInteger(questionId) || !Number.isInteger(groupId)) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const submission = await queryOne(
    `SELECT id, status, submitted_at FROM submissions WHERE question_id = $1 AND group_id = $2`,
    [questionId, groupId]
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

  const question = await queryOne(`SELECT id, is_active FROM questions WHERE id = $1`, [questionId]);
  if (!question) {
    return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });
  }
  if (!(question as any).is_active) {
    return NextResponse.json({ error: "Bu savol hozir mavjud emas." }, { status: 403 });
  }

  const group = await queryOne(`SELECT id FROM groups WHERE id = $1 AND is_active = TRUE`, [groupId]);
  if (!group) {
    return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });
  }

  const existing = await queryOne(
    `SELECT id FROM submissions WHERE question_id = $1 AND group_id = $2`,
    [questionId, groupId]
  );
  if (existing) {
    return NextResponse.json(
      { error: "Bu savolga guruhingiz allaqachon javob bergan." },
      { status: 409 }
    );
  }

  const rows = await query(
    `INSERT INTO submissions (question_id, group_id, student_answer, status)
     VALUES ($1, $2, $3, 'PENDING')
     RETURNING id, status, submitted_at`,
    [questionId, groupId, String(answer).trim()]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
