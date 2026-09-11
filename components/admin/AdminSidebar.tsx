"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin/menejer/dashboard", label: "Dashboard" },
  { href: "/admin/menejer/questions", label: "Savollar" },
  { href: "/admin/menejer/groups", label: "Guruhlar" },
  { href: "/admin/menejer/submissions", label: "So'rovlar" },
];

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/menejer");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 bg-neutral-900 text-white flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-neutral-700">
        <div className="font-bold text-lg leading-none">Quizzes Week</div>
        <div className="text-[10px] text-neutral-400 mt-1">PDP University</div>
      </div>
      <nav className="flex-1 py-4">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-5 py-3 text-sm font-semibold border-l-4 ${
                active
                  ? "border-[rgb(0,175,166)] bg-neutral-800 text-white"
                  : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-neutral-700">
        <div className="text-xs text-neutral-400 mb-2 truncate">{username}</div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs font-semibold text-neutral-300 hover:text-white"
        >
          Chiqish
        </button>
      </div>
    </aside>
  );
}
