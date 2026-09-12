import StudentHeader from "@/components/StudentHeader";
import Footer from "@/components/Footer";
import ScannerModal from "@/components/ScannerModal";
import CodeEntry from "@/components/CodeEntry";
import { getSetting, COMPETITION_INFO_KEY } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const competitionInfo = await getSetting(COMPETITION_INFO_KEY);

  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-1 px-5 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <section className="order-2 lg:order-1">
            <p className="mb-5 inline-flex rounded-full bg-[rgb(0,175,166)]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[rgb(0,145,137)] sm:text-xs">
              PDP University · Quizzes Week
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-neutral-950 sm:text-7xl">
              Bilimingizni<br /><span className="text-[rgb(0,175,166)]">namoyish qiling.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">
              QR kodni skanerlang, guruhingizni tanlang va bugungi savolga javob bering.
            </p>
            <div className="glass mt-8 grid max-w-md grid-cols-3 rounded-2xl py-5 text-center shadow-lg shadow-teal-900/5">
              <div><strong className="block text-2xl font-black text-neutral-950">01</strong><span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Scan</span></div>
              <div className="border-x border-neutral-200/70"><strong className="block text-2xl font-black text-neutral-950">02</strong><span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Javob</span></div>
              <div><strong className="block text-2xl font-black text-neutral-950">03</strong><span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Natija</span></div>
            </div>
          </section>

          <section className="glass order-1 rounded-3xl p-5 shadow-xl shadow-teal-900/10 sm:p-7 lg:order-2">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-950">Savolga kirish</p>
              <span className="h-2.5 w-2.5 rounded-full bg-[rgb(255,199,0)] shadow-[0_0_0_4px_rgba(255,199,0,0.2)]" />
            </div>
            <CodeEntry />
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200/70" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">yoki</span>
              <div className="h-px flex-1 bg-neutral-200/70" />
            </div>
            <ScannerModal />
          </section>
        </div>

        {competitionInfo && (
          <a
            href="#musobaqa"
            className="mt-8 flex animate-bounce flex-col items-center gap-1 text-neutral-400 lg:hidden"
            aria-label="Pastga qarab, musobaqa haqida o'qing"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Batafsil</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}

        {competitionInfo && (
          <div id="musobaqa" className="mx-auto mt-8 max-w-6xl scroll-mt-24 lg:mt-14">
            <div className="glass rounded-3xl p-6 shadow-lg shadow-teal-900/5 sm:p-10">
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[rgb(0,145,137)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[rgb(0,175,166)]" />
                Musobaqa haqida
              </p>
              <div
                className="prose-content max-w-3xl text-[15px] leading-7 text-neutral-700 sm:text-base"
                dangerouslySetInnerHTML={{ __html: competitionInfo }}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
