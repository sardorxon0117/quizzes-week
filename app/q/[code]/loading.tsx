import StudentHeader from "@/components/StudentHeader";
import Footer from "@/components/Footer";

export default function QuestionLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-1 px-5 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <div className="glass rounded-3xl p-5 shadow-xl shadow-teal-900/10 sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4 border-b border-neutral-200/70 pb-5">
              <div className="space-y-2">
                <div className="skeleton h-2.5 w-32 rounded-full" />
                <div className="skeleton h-3.5 w-20 rounded-full" />
              </div>
              <span className="h-4 w-4 shrink-0 rounded-full bg-[rgb(0,175,166)]/30" />
            </div>

            <div className="mb-8 space-y-3">
              <div className="skeleton h-8 w-full rounded-xl" />
              <div className="skeleton h-8 w-4/5 rounded-xl" />
            </div>

            <div className="space-y-5">
              <div className="skeleton h-12 w-full rounded-xl" />
              <div className="skeleton h-20 w-full rounded-xl" />
              <div className="skeleton h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
