export const dynamic = "force-dynamic";
import { query } from "@/lib/db";
import QuestionsManager from "@/components/admin/QuestionsManager";

async function getQuestions() {
  return query(
    `SELECT id, code, question, answer, is_active, created_at, updated_at FROM questions ORDER BY created_at DESC`
  );
}

export default async function QuestionsPage() {
  const questions = await getQuestions();
  return (
    <div className="p-6 sm:p-10">
      <QuestionsManager initialQuestions={questions as any} />
    </div>
  );
}
