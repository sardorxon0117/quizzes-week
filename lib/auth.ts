import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const COOKIE_NAME = "qw_admin_session";

export function signAdminToken(username: string) {
  return jwt.sign({ username, role: "admin" }, SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token: string): { username: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { username: string; role: string };
    if (decoded.role !== "admin") return null;
    return { username: decoded.username };
  } catch {
    return null;
  }
}

export function getAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
