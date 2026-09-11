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

export default async function QuestionPage({ params }: { params: { code: string } }) {
  const question = await getQuestion(params.code);
  const groups = await getGroups();

  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-1 px-5 sm:px-8 py-8 sm:py-12">
        <div className="max-w-sm mx-auto">
          {!question ? (
            <div className="text-center py-16">
              <p className="text-lg font-bold text-neutral-900">Savol topilmadi</p>
              <p className="text-sm text-neutral-500 mt-2">Bunday savol kodi mavjud emas.</p>
              <Link href="/" className="inline-block mt-6 text-sm font-semibold text-[rgb(0,175,166)] underline">
                Bosh sahifaga qaytish
              </Link>
            </div>
          ) : !question.is_active ? (
            <div className="text-center py-16">
              <p className="text-lg font-bold text-neutral-900">Savol hozir mavjud emas</p>
              <p className="text-sm text-neutral-500 mt-2">Bu savol hozir faol emas.</p>
              <Link href="/" className="inline-block mt-6 text-sm font-semibold text-[rgb(0,175,166)] underline">
                Bosh sahifaga qaytish
              </Link>
            </div>
          ) : (
            <>
              <div className="text-xs font-bold tracking-wide text-[rgb(0,175,166)] mb-2">
                #{question.code}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 leading-snug mb-8">
                {question.question}
              </h1>
              <QuestionForm questionId={question.id} groups={groups} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
