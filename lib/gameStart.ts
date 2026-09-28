// When the competition opens. Questions can't be viewed or answered before
// this instant. Override with NEXT_PUBLIC_GAME_START (ISO 8601, with offset).
export const GAME_START = new Date(process.env.NEXT_PUBLIC_GAME_START || "2026-09-29T09:00:00+05:00");

const TZ = "Asia/Tashkent";
const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function gameStarted(now: Date = new Date()): boolean {
  return now.getTime() >= GAME_START.getTime();
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

/** e.g. "O'yin ertaga, 28-sentabr soat 9:00 da boshlanadi." — "bugun"/"ertaga" picked by the current date in Tashkent. */
export function notStartedMessage(now: Date = new Date()): string {
  const s = tashkentParts(GAME_START);
  const n = tashkentParts(now);

  const startDay = Date.UTC(s.year, s.month - 1, s.day);
  const nowDay = Date.UTC(n.year, n.month - 1, n.day);
  const daysUntil = Math.round((startDay - nowDay) / 86_400_000);

  const when = daysUntil === 0 ? "bugun, " : daysUntil === 1 ? "ertaga, " : "";
  const time = `${s.hour}:${String(s.minute).padStart(2, "0")}`;
  return `O'yin ${when}${s.day}-${MONTHS[s.month - 1]} soat ${time} da boshlanadi.`;
}
