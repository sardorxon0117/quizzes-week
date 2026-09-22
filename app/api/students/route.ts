import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const groupId = Number(req.nextUrl.searchParams.get("groupId"));
  if (!Number.isInteger(groupId)) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const students = await query<{ id: number; full_name: string }>(
    `SELECT id, full_name FROM students WHERE group_id = $1 AND is_active = TRUE ORDER BY full_name ASC`,
    [groupId]
  );
  return NextResponse.json(students);
}
