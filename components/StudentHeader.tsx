import Link from "next/link";

export default function StudentHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between border-b-2 border-[rgb(0,175,166)] bg-[rgb(0,175,166)] px-5 py-4 text-white sm:px-10">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center border-2 border-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" stroke="currentColor" strokeWidth="2" />
            <path d="m7 12 3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
        </span>
        <span className="leading-none">
          <span className="block text-lg font-black tracking-tight text-[rgb(255,199,0)]">QUIZZES WEEK</span>
          <span className="block text-[10px] font-bold tracking-[0.12em] text-white">PDP University</span>
        </span>
      </Link>
      <Link
        href="/stats"
        className="border-2 border-white px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-white hover:text-[rgb(0,175,166)] sm:px-4 sm:text-sm"
      >
        Statistika
      </Link>
    </header>
  );
}
