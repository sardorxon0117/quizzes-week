import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { generateCardsPdf } from "@/lib/pdf";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin();
  if (denied) return denied;

  const question = await queryOne<{ code: string; question: string }>(
    `SELECT code, question FROM questions WHERE id = $1`,
    [params.id]
  );
  if (!question) return NextResponse.json({ error: "Savol topilmadi" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
  // repeat the same card 8 times to fill one A4 page — ready to cut and place around campus
  const items = Array.from({ length: 8 }, () => ({ code: question.code, question: question.question }));
  const pdfBytes = await generateCardsPdf(items, baseUrl);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="savol-${question.code}.pdf"`,
    },
  });
}
