import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { generateCardsPdf } from "@/lib/pdf";

export async function GET(req: NextRequest) {
  const denied = requireAdmin();
  if (denied) return denied;

  const questions = await query<{ code: string; question: string }>(
    `SELECT code, question FROM questions WHERE is_active = TRUE ORDER BY created_at ASC`
  );
  if (questions.length === 0) {
    return NextResponse.json({ error: "Faol savollar mavjud emas" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
  const pdfBytes = await generateCardsPdf(questions, baseUrl);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="barcha-savollar.pdf"`,
    },
  });
}
