export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import SubmissionsManager from "@/components/admin/SubmissionsManager";

async function getSubmissions() {
  return query(`
    SELECT s.id, s.status, s.student_answer, s.submitted_at,
           q.code AS question_code, q.question, q.answer AS correct_answer,
           g.name AS group_name
    FROM submissions s
    JOIN questions q ON q.id = s.question_id
    JOIN groups g ON g.id = s.group_id
    ORDER BY s.submitted_at DESC
  `);
}

export default async function SubmissionsPage() {
  const submissions = await getSubmissions();
  return (
    <div className="p-6 sm:p-10">
      <SubmissionsManager initialSubmissions={submissions as any} />
    </div>
  );
}
