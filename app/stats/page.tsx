export const dynamic = "force-dynamic";
import Link from "next/link";
import { query } from "@/lib/db";
import Footer from "@/components/Footer";

async function getRanking() {
  return query<{
    id: number;
    name: string;
    found: number;
    correct: number;
    pct: number;
    first_correct: string | null;
  }>(`
    SELECT
      g.id,
      g.name,
      COUNT(s.id)::int AS found,
      COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct,
      CASE WHEN COUNT(s.id) = 0 THEN 0
        ELSE ROUND(100.0 * COUNT(s.id) FILTER (WHERE s.status = 'CORRECT') / COUNT(s.id), 1)
      END AS pct,
      MIN(s.reviewed_at) FILTER (WHERE s.status = 'CORRECT') AS first_correct
    FROM groups g
    LEFT JOIN submissions s ON s.group_id = g.id
    WHERE g.is_active = TRUE
    GROUP BY g.id, g.name
    ORDER BY correct DESC, pct DESC, first_correct ASC NULLS LAST, g.name ASC
  `);
}

const RANK_STYLES = [
  { badge: "bg-[rgb(255,199,0)] text-neutral-950", ring: "ring-2 ring-[rgb(255,199,0)]/60", medal: "🥇" },
  { badge: "bg-neutral-300 text-neutral-900", ring: "ring-2 ring-neutral-300/60", medal: "🥈" },
  { badge: "bg-[rgb(205,140,90)] text-white", ring: "ring-2 ring-[rgb(205,140,90)]/50", medal: "🥉" },
];

export default async function StatsPage() {
  const ranking = await getRanking();
  const totalCorrect = ranking.reduce((sum, r) => sum + r.correct, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="glass mx-auto flex max-w-2xl items-center rounded-2xl px-5 py-3.5 shadow-lg shadow-teal-900/5">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-[rgb(0,145,137)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Orqaga
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[rgb(0,145,137)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[rgb(0,175,166)]" />
            Musobaqa
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.02em] text-neutral-950 sm:text-3xl">Guruhlar reytingi</h1>
          <p className="mt-1 text-sm text-neutral-500">Natijalar real vaqtda yangilanadi</p>

          <div className="glass mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl shadow-lg shadow-teal-900/5 sm:grid-cols-3">
            <div className="bg-white/40 px-4 py-3.5 text-center">
              <strong className="block text-xl font-black text-neutral-950">{ranking.length}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Guruh</span>
            </div>
            <div className="bg-white/40 px-4 py-3.5 text-center">
              <strong className="block text-xl font-black text-[rgb(0,140,133)]">{totalCorrect}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">To'g'ri javob</span>
            </div>
            <div className="col-span-2 bg-white/40 px-4 py-3.5 text-center sm:col-span-1">
              <strong className="block text-xl font-black text-neutral-950">{ranking[0]?.name ?? "—"}</strong>
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Yetakchi</span>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {ranking.length === 0 && (
              <div className="glass rounded-2xl py-14 text-center text-sm text-neutral-400 shadow-lg shadow-teal-900/5">
                Hozircha natijalar yo'q
              </div>
            )}

            {ranking.map((r, i) => {
              const style = RANK_STYLES[i];
              return (
                <div
                  key={r.id}
                  className={`glass flex items-center gap-3 rounded-2xl p-3.5 shadow-lg shadow-teal-900/5 sm:gap-4 sm:p-4 ${style?.ring ?? ""}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black sm:h-10 sm:w-10 ${
                      style ? style.badge : "bg-neutral-900/5 text-neutral-500"
                    }`}
                  >
                    {style ? style.medal : i + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-950 sm:text-base">{r.name}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-900/8">
                      <div
                        className="h-full rounded-full bg-[rgb(0,175,166)]"
                        style={{ width: `${Math.min(r.pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-base font-black text-[rgb(0,140,133)] sm:text-lg">
                      {r.correct}
                      <span className="text-xs font-semibold text-neutral-400">/{r.found}</span>
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{r.pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
