export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import QuestionsManager from "@/components/admin/QuestionsManager";

async function getQuestions() {
  return query(`
    SELECT
      q.id, q.code, q.question, q.answer, q.is_active, q.created_at, q.updated_at,
      sub.group_name AS answered_by, sub.student_name, sub.status AS submission_status
    FROM questions q
    LEFT JOIN LATERAL (
      -- The currently-active submission (PENDING/CORRECT) that's actually
      -- blocking the question — a WRONG one doesn't hold the lock, so it's
      -- excluded here even though it still shows up on the So'rovlar list.
      SELECT g.name AS group_name, st.full_name AS student_name, s.status, s.submitted_at
      FROM submissions s
      JOIN groups g ON g.id = s.group_id
      LEFT JOIN students st ON st.id = s.student_id
      WHERE s.question_id = q.id AND s.status IN ('PENDING', 'CORRECT')
      ORDER BY s.submitted_at DESC
      LIMIT 1
    ) sub ON true
    ORDER BY q.created_at DESC
  `);
}

export default async function QuestionsPage() {
  const questions = await getQuestions();
  return (
    <div className="p-6 sm:p-10">
      <QuestionsManager initialQuestions={questions as any} />
    </div>
  );
}
