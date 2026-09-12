import Link from "next/link";

export default function StudentHeader() {
  return (
    <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3.5 shadow-lg shadow-teal-900/5 sm:px-7">
        <Link href="/" className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgb(0,175,166)] shadow-md shadow-teal-900/25"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="m7 12 3 3 7-7" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block text-base font-black tracking-tight text-neutral-950">QUIZZES WEEK</span>
            <span className="block text-[10px] font-bold tracking-[0.12em] text-[rgb(0,145,137)]">PDP UNIVERSITY</span>
          </span>
        </Link>
        <Link
          href="/stats"
          className="rounded-xl bg-[rgb(0,175,166)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-teal-900/20 transition-transform active:scale-95 sm:text-sm"
        >
          Statistika
        </Link>
      </div>
    </header>
  );
}
