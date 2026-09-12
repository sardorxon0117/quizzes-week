export const dynamic = "force-dynamic";
import { queryOne, query } from "@/lib/db";
import QuestionForm from "@/components/QuestionForm";
import StudentHeader from "@/components/StudentHeader";
import Footer from "@/components/Footer";
import Link from "next/link";

async function getQuestion(code: string) {
  return queryOne<{ id: number; code: string; question: string; is_active: boolean }>(
    `SELECT id, code, question, is_active FROM questions WHERE code = $1`,
    [code]
  );
}

async function getGroups() {
  return query<{ id: number; name: string }>(
    `SELECT id, name FROM groups WHERE is_active = TRUE ORDER BY name ASC`
  );
}

async function getSubmission(questionId: number) {
  return queryOne<{ group_name: string; submitted_at: string }>(
    `SELECT g.name AS group_name, s.submitted_at
     FROM submissions s JOIN groups g ON g.id = s.group_id
     WHERE s.question_id = $1 ORDER BY s.submitted_at ASC LIMIT 1`,
    [questionId]
  );
}

export default async function QuestionPage({ params }: { params: { code: string } }) {
  const question = await getQuestion(params.code);
  const groups = await getGroups();
  const submission = question ? await getSubmission(question.id) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-1 px-5 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          {!question ? (
            <div className="glass rounded-3xl py-16 text-center shadow-lg shadow-teal-900/5">
              <p className="text-lg font-bold text-neutral-900">Savol topilmadi</p>
              <p className="text-sm text-neutral-500 mt-2">Bunday savol kodi mavjud emas.</p>
              <Link href="/" className="inline-block mt-6 text-sm font-semibold text-[rgb(0,175,166)] underline">
                Bosh sahifaga qaytish
              </Link>
            </div>
          ) : !question.is_active ? (
            <div className="glass rounded-3xl py-16 text-center shadow-lg shadow-teal-900/5">
              <p className="text-lg font-bold text-neutral-900">Savol hozir mavjud emas</p>
              <p className="text-sm text-neutral-500 mt-2">Bu savol hozir faol emas.</p>
              <Link href="/" className="inline-block mt-6 text-sm font-semibold text-[rgb(0,175,166)] underline">
                Bosh sahifaga qaytish
              </Link>
            </div>
          ) : (
            <div className="glass rounded-3xl p-5 shadow-xl shadow-teal-900/10 sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4 border-b border-neutral-200/70 pb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[rgb(0,145,137)]">Bugungi challenge</p>
                  <div className="mt-2 text-sm font-black tracking-wide text-neutral-500">#{question.code}</div>
                </div>
                <span className="h-4 w-4 shrink-0 rounded-full bg-[rgb(0,175,166)] shadow-[0_0_0_5px_rgba(0,175,166,0.15)]" />
              </div>
              <h1 className="mb-8 text-3xl font-black leading-tight tracking-[-0.03em] text-neutral-950 sm:text-4xl">
                {question.question}
              </h1>
              {submission ? (
                <div className="rounded-2xl border border-[rgb(255,199,0)]/50 bg-[rgb(255,199,0)]/10 p-5" role="status">
                  <p className="text-lg font-black text-neutral-950">Bu savolga javob berib bo'lingan</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    Bu savolga <strong>{submission.group_name}</strong> guruhi tomonidan javob berilgan.
                  </p>
                </div>
              ) : (
                <QuestionForm questionId={question.id} groups={groups} />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
