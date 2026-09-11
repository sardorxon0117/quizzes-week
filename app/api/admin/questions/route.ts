export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { generateUniqueCode } from "@/lib/code";

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;

  const questions = await query(
    `SELECT id, code, question, answer, is_active, created_at, updated_at FROM questions ORDER BY created_at DESC`
  );
  return NextResponse.json(questions);
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

  const { question, answer } = body || {};
  if (!question || !String(question).trim()) {
    return NextResponse.json({ error: "Savolni kiriting" }, { status: 400 });
  }
  if (!answer || !String(answer).trim()) {
    return NextResponse.json({ error: "To'g'ri javobni kiriting" }, { status: 400 });
  }

  const code = await generateUniqueCode(async (c) => {
    const found = await queryOne(`SELECT id FROM questions WHERE code = $1`, [c]);
    return !!found;
  });

  const rows = await query(
    `INSERT INTO questions (code, question, answer) VALUES ($1, $2, $3)
     RETURNING id, code, question, answer, is_active, created_at, updated_at`,
    [code, String(question).trim(), String(answer).trim()]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
