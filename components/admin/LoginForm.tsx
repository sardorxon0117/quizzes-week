"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login yoki parol noto'g'ri");
        setLoading(false);
        return;
      }
      router.push("/admin/menejer/dashboard");
      router.refresh();
    } catch {
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-neutral-900 p-6 space-y-4">
      <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
          Login
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border-2 border-neutral-300 px-3 py-2.5 font-medium"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
          Parol
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-neutral-300 px-3 py-2.5 font-medium"
        />
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 font-bold text-white bg-[rgb(0,175,166)] disabled:opacity-60"
      >
        {loading ? "Kirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
