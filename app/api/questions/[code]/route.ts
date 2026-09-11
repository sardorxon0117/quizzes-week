import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code;
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Noto'g'ri kod formati" }, { status: 400 });
  }
  const question = await queryOne(
    `SELECT id, code, question, is_active FROM questions WHERE code = $1`,
    [code]
  );
  if (!question) {
    return NextResponse.json({ error: "Bunday savol kodi mavjud emas." }, { status: 404 });
  }
  return NextResponse.json(question);
}
