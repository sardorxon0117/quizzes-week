export const dynamic = "force-dynamic";
import Link from "next/link";
import { query } from "@/lib/db";
import Footer from "@/components/Footer";
import StatsView, { GroupRankRow, StudentRankRow } from "@/components/StatsView";

async function getGroupRanking() {
  return query<GroupRankRow>(`
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
    ORDER BY correct DESC, found DESC, first_correct ASC NULLS LAST, g.name ASC
  `);
}

async function getStudentRanking() {
  return query<StudentRankRow>(`
    SELECT
      st.id,
      st.full_name,
      g.name AS group_name,
      COUNT(s.id)::int AS found,
      COUNT(s.id) FILTER (WHERE s.status = 'CORRECT')::int AS correct,
      CASE WHEN COUNT(s.id) = 0 THEN 0
        ELSE ROUND(100.0 * COUNT(s.id) FILTER (WHERE s.status = 'CORRECT') / COUNT(s.id), 1)
      END AS pct,
      MIN(s.reviewed_at) FILTER (WHERE s.status = 'CORRECT') AS first_correct
    FROM students st
    JOIN groups g ON g.id = st.group_id
    LEFT JOIN submissions s ON s.student_id = st.id
    WHERE st.is_active = TRUE AND g.is_active = TRUE
    GROUP BY st.id, g.name
    ORDER BY correct DESC, found DESC, first_correct ASC NULLS LAST, st.full_name ASC
  `);
}

export default async function StatsPage() {
  const [groupRanking, studentRanking] = await Promise.all([getGroupRanking(), getStudentRanking()]);

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
          <h1 className="mt-2 text-2xl font-black tracking-[-0.02em] text-neutral-950 sm:text-3xl">Reyting</h1>
          <p className="mt-1 mb-6 text-sm text-neutral-500">Natijalar real vaqtda yangilanadi</p>

          <StatsView groupRanking={groupRanking} studentRanking={studentRanking} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
