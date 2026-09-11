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
      <main className="flex-1 bg-[linear-gradient(135deg,#f4fffd_0%,#ffffff_55%,#fff9dc_100%)] px-5 py-8 sm:px-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
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
            <div className="border-2 border-neutral-950 bg-white p-5 shadow-[8px_8px_0_rgb(255,199,0)] sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4 border-b-2 border-neutral-950 pb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[rgb(0,145,137)]">Bugungi challenge</p>
                  <div className="mt-2 text-sm font-black tracking-wide text-neutral-500">#{question.code}</div>
                </div>
                <span className="h-4 w-4 shrink-0 bg-[rgb(0,175,166)]" />
              </div>
              <h1 className="mb-8 text-3xl font-black leading-tight tracking-[-0.03em] text-neutral-950 sm:text-4xl">
                {question.question}
              </h1>
              <QuestionForm questionId={question.id} groups={groups} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
