import { queryOne, query } from "@/lib/db";

export const COMPETITION_INFO_KEY = "competition_info";

export async function getSetting(key: string): Promise<string | null> {
  const row = await queryOne<{ value: string }>(`SELECT value FROM settings WHERE key = $1`, [key]);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value]
  );
}

/**
 * Very small allow-list HTML sanitizer for the rich-text blocks admins edit
 * (bold / italic / links / paragraphs / lists). Not a general-purpose
 * sanitizer — good enough for trusted admin input that is rendered to all
 * visitors, stripping scripts/handlers/unsafe URLs defensively.
 */
const ALLOWED_TAGS = new Set(["b", "strong", "i", "em", "u", "a", "br", "p", "ul", "ol", "li", "span"]);

export function sanitizeRichText(html: string): string {
  if (!html) return "";

  // Drop script/style blocks entirely (including their content).
  let out = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");

  // Strip tags that aren't in the allow-list, keep their inner text.
  out = out.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tagRaw, attrs) => {
    const tag = String(tagRaw).toLowerCase();
    const closing = match.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;

    if (tag === "a") {
      const hrefMatch = /href\s*=\s*["']([^"']*)["']/i.exec(attrs || "");
      let href = hrefMatch?.[1]?.trim() || "";
      const safe = /^(https?:|mailto:|tel:|\/)/i.test(href);
      if (!safe) href = "#";
      return `<a href="${href.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">`;
    }

    return `<${tag}>`;
  });

  return out.trim();
}
