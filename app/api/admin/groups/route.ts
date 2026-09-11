export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  const denied = requireAdmin();
  if (denied) return denied;

  const groups = await query(
    `SELECT g.id, g.name, g.is_active, g.created_at, g.updated_at,
            COUNT(s.id)::int AS found,
            COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct
     FROM groups g
     LEFT JOIN submissions s ON s.group_id = g.id
     GROUP BY g.id
     ORDER BY g.name ASC`
  );
  return NextResponse.json(groups);
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

  const { name } = body || {};
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "Guruh nomini kiriting" }, { status: 400 });
  }

  const existing = await queryOne(`SELECT id FROM groups WHERE name = $1`, [String(name).trim()]);
  if (existing) {
    return NextResponse.json({ error: "Bu nomdagi guruh allaqachon mavjud" }, { status: 409 });
  }

  const rows = await query(
    `INSERT INTO groups (name) VALUES ($1) RETURNING id, name, is_active, created_at, updated_at`,
    [String(name).trim()]
  );
  return NextResponse.json(rows[0], { status: 201 });
}
