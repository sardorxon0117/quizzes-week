import Link from "next/link";

export default function StudentHeader() {
  return (
    <header className="flex items-center justify-between px-5 sm:px-8 py-5 border-b-2 border-[rgb(0,175,166)]">
      <div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
          Quizzes Week
        </div>
        <div className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
          PDP University
        </div>
      </div>
      <Link
        href="/stats"
        className="text-sm font-semibold px-4 py-2 border-2 border-[rgb(0,175,166)] text-[rgb(0,175,166)] hover:bg-[rgb(0,175,166)] hover:text-white transition-colors"
      >
        Statistika
      </Link>
    </header>
  );
}
