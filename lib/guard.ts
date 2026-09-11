import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export function requireAdmin() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
  }
  return null;
}
