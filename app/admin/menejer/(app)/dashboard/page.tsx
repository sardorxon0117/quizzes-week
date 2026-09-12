export const dynamic = "force-dynamic";
import { queryOne, query } from "@/lib/db";

async function getStats() {
  return queryOne<{
    total_questions: number;
    total_groups: number;
    total_submissions: number;
    pending_submissions: number;
  }>(`
    SELECT
      (SELECT COUNT(*)::int FROM questions) AS total_questions,
      (SELECT COUNT(*)::int FROM groups WHERE is_active = TRUE) AS total_groups,
      (SELECT COUNT(*)::int FROM submissions) AS total_submissions,
      (SELECT COUNT(*)::int FROM submissions WHERE status = 'PENDING') AS pending_submissions
  `);
}

async function getTopGroups() {
  return query<{ id: number; name: string; correct: number; found: number }>(`
    SELECT g.id, g.name,
      COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct,
      COUNT(s.id)::int AS found
    FROM groups g
    LEFT JOIN submissions s ON s.group_id = g.id
    WHERE g.is_active = TRUE
    GROUP BY g.id
    ORDER BY correct DESC, found DESC
    LIMIT 5
  `);
}

export default async function DashboardPage() {
  const stats = await getStats();
  const topGroups = await getTopGroups();

  const cards = [
    { label: "Jami savollar", value: stats?.total_questions ?? 0 },
    { label: "Jami guruhlar", value: stats?.total_groups ?? 0 },
    { label: "Jami javoblar", value: stats?.total_submissions ?? 0 },
    { label: "Kutilayotgan javoblar", value: stats?.pending_submissions ?? 0, accent: true },
  ];

  return (
    <div className="p-6 sm:p-10">
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">Dashboard</h1>
      <p className="text-sm text-neutral-500 mb-8">Musobaqaning umumiy holati</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-3xl p-5 shadow-lg ${
              c.accent
                ? "glass-dark text-white shadow-black/20"
                : "glass shadow-teal-900/5"
            }`}
          >
            <div className={`text-3xl font-black ${c.accent ? "text-[rgb(255,199,0)]" : "text-neutral-900"}`}>
              {c.value}
            </div>
            <div className={`mt-1 text-xs font-semibold uppercase tracking-wide ${c.accent ? "text-neutral-300" : "text-neutral-500"}`}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-3xl shadow-lg shadow-teal-900/5">
        <div className="px-5 py-4 border-b border-neutral-200/60 font-bold text-sm text-neutral-900">
          Top guruhlar
        </div>
        {topGroups.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-400">Hozircha ma'lumot yo'q</div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {topGroups.map((g, i) => (
                <tr key={g.id} className="border-t border-neutral-200/50">
                  <td className="px-5 py-3 font-bold w-10">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold">{g.name}</td>
                  <td className="px-5 py-3 text-right text-neutral-500">{g.found} ta topilgan</td>
                  <td className="px-5 py-3 text-right font-bold text-[rgb(0,140,133)] w-28">{g.correct} to'g'ri</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
