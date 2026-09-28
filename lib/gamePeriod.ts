import { getSetting, setSetting } from "@/lib/settings";

// The competition window, edited by the admin (Musobaqa haqida page) and
// stored in `settings`. Outside it, questions can't be viewed or answered.
export const GAME_START_KEY = "game_start";
export const GAME_END_KEY = "game_end";

// Used only until the admin saves a start time for the first time.
const DEFAULT_START = "2026-09-29T09:00:00+05:00";

// Uzbekistan is UTC+5 all year (no DST), so a fixed offset is exact.
const TZ = "Asia/Tashkent";
const TZ_OFFSET = "+05:00";

const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export type GamePeriod = { start: Date | null; end: Date | null };

export type GameState =
  | { status: "open" }
  | { status: "not_started" | "ended"; message: string };

export async function getGamePeriod(): Promise<GamePeriod> {
  const [start, end] = await Promise.all([getSetting(GAME_START_KEY), getSetting(GAME_END_KEY)]);
  return {
    // No row yet -> the default; a saved empty string -> "no start limit".
    start: start === null ? new Date(DEFAULT_START) : start ? new Date(start) : null,
    end: end ? new Date(end) : null,
  };
}

export async function saveGamePeriod(period: GamePeriod): Promise<void> {
  await Promise.all([
    setSetting(GAME_START_KEY, period.start ? period.start.toISOString() : ""),
    setSetting(GAME_END_KEY, period.end ? period.end.toISOString() : ""),
  ]);
}

export async function getGameState(now: Date = new Date()): Promise<GameState> {
  const { start, end } = await getGamePeriod();
  if (start && now < start) return { status: "not_started", message: notStartedMessage(start, now) };
  if (end && now >= end) return { status: "ended", message: endedMessage(end) };
  return { status: "open" };
}

function tashkentParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

function dateTimeText(d: Date) {
  const p = tashkentParts(d);
  return `${p.day}-${MONTHS[p.month - 1]} soat ${p.hour}:${String(p.minute).padStart(2, "0")}`;
}

/** e.g. "O'yin ertaga, 29-sentabr soat 9:00 da boshlanadi." — "bugun"/"ertaga" picked by the current Tashkent date. */
export function notStartedMessage(start: Date, now: Date = new Date()): string {
  const s = tashkentParts(start);
  const n = tashkentParts(now);
  const daysUntil = Math.round((Date.UTC(s.year, s.month - 1, s.day) - Date.UTC(n.year, n.month - 1, n.day)) / 86_400_000);
  const when = daysUntil === 0 ? "bugun, " : daysUntil === 1 ? "ertaga, " : "";
  return `O'yin ${when}${dateTimeText(start)} da boshlanadi.`;
}

export function endedMessage(end: Date): string {
  return `O'yin ${dateTimeText(end)} da yakunlangan.`;
}

/** Date -> "YYYY-MM-DDTHH:mm" in Tashkent time, for <input type="datetime-local">. */
export function toTashkentInput(d: Date | null): string {
  if (!d) return "";
  const p = tashkentParts(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** "YYYY-MM-DDTHH:mm" (Tashkent wall time) -> Date. Returns null for empty, undefined for malformed. */
export function fromTashkentInput(value: string): Date | null | undefined {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  const d = new Date(`${value}:00${TZ_OFFSET}`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
