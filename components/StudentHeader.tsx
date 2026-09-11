import Link from "next/link";

export default function StudentHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between border-b-2 border-[rgb(0,175,166)] bg-[rgb(0,175,166)] px-5 py-4 text-white sm:px-10">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center border-2 border-white text-lg font-black">P</span>
        <span className="leading-none">
          <span className="block text-lg font-black tracking-tight">PDP</span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">University</span>
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
