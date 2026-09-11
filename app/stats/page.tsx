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

export default async function StatsPage() {
  const ranking = await getRanking();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center px-5 sm:px-8 py-5 border-b-2 border-[rgb(0,175,166)]">
        <Link href="/" className="text-sm font-semibold text-[rgb(0,175,166)]">
          ← Orqaga
        </Link>
      </header>
      <main className="flex-1 px-5 sm:px-8 py-8">
        <h1 className="text-xl font-bold text-neutral-900 mb-1">Guruhlar reytingi</h1>
        <p className="text-sm text-neutral-500 mb-6">Musobaqa natijalari real vaqtda yangilanadi</p>

        <div className="overflow-x-auto border-2 border-neutral-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-900 text-white">
                <th className="text-left px-4 py-3 font-bold">O'rin</th>
                <th className="text-left px-4 py-3 font-bold">Guruh</th>
                <th className="text-right px-4 py-3 font-bold">Topilgan</th>
                <th className="text-right px-4 py-3 font-bold">To'g'ri</th>
                <th className="text-right px-4 py-3 font-bold">Foiz</th>
              </tr>
            </thead>
            <tbody>
              {ranking.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-neutral-400">
                    Hozircha natijalar yo'q
                  </td>
                </tr>
              )}
              {ranking.map((r, i) => (
                <tr key={r.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 font-bold">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold">{r.name}</td>
                  <td className="px-4 py-3 text-right">{r.found}</td>
                  <td className="px-4 py-3 text-right font-bold text-[rgb(0,140,133)]">{r.correct}</td>
                  <td className="px-4 py-3 text-right">{r.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
