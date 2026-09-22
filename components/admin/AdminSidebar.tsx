"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin/menejer/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/admin/menejer/questions", label: "Savollar", icon: "❓" },
  { href: "/admin/menejer/groups", label: "Guruhlar", icon: "👥" },
  { href: "/admin/menejer/students", label: "Talabalar", icon: "🎓" },
  { href: "/admin/menejer/submissions", label: "So'rovlar", icon: "📥" },
  { href: "/admin/menejer/content", label: "Musobaqa haqida", icon: "📝" },
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
    <aside className="w-64 shrink-0 min-h-screen p-4">
      <div className="glass-dark sticky top-4 flex min-h-[calc(100vh-2rem)] flex-col rounded-3xl text-white shadow-2xl shadow-black/20">
        <div className="px-6 py-7 border-b border-white/10">
          <div className="font-black text-lg leading-none tracking-tight">Quizzes Week</div>
          <div className="text-[10px] text-[rgb(255,199,0)] font-bold mt-1.5 tracking-wide">PDP University</div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[rgb(0,175,166)] text-white shadow-md shadow-teal-900/30"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base leading-none opacity-90">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <div className="text-xs text-neutral-400 mb-2 truncate">{username}</div>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl text-left text-xs font-semibold text-neutral-300 hover:text-white px-1 py-1"
          >
            Chiqish →
          </button>
        </div>
      </div>
    </aside>
  );
}
