"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const digits = code.padEnd(6, " ").split("").slice(0, 6);

  function handleChange(v: string) {
    const cleaned = v.replace(/\D/g, "").slice(0, 6);
    setCode(cleaned);
    setError(null);
  }

  async function handleOpen() {
    if (code.length !== 6) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${code}`);
      if (res.status === 404) {
        setError("Savol topilmadi");
        setChecking(false);
        return;
      }
      if (!res.ok) {
        setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
        setChecking(false);
        return;
      }
      router.push(`/q/${code}`);
    } catch {
      setError("Internet xatosi. Qaytadan urinib ko'ring.");
      setChecking(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="text-center text-sm font-semibold text-neutral-700 mb-3">
        Savol kodini kiriting
      </p>

      <div className="relative">
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          maxLength={6}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
          aria-label="Savol kodi"
          autoFocus
        />
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 pointer-events-none">
          {digits.map((d, i) => (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-xl border-2 text-xl sm:text-2xl font-bold transition-colors ${
                d.trim()
                  ? "border-[rgb(0,175,166)] bg-[rgb(0,175,166)]/5 text-neutral-900"
                  : "border-neutral-200 bg-white/50 text-neutral-300"
              }`}
            >
              {d.trim() || "0"}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-center text-sm text-red-600 mt-3 font-medium">{error}</p>}

      <button
        onClick={handleOpen}
        disabled={code.length !== 6 || checking}
        className="w-full mt-5 rounded-xl py-3.5 font-bold text-white bg-[rgb(0,175,166)] shadow-md shadow-teal-900/20 transition-all active:scale-95 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
      >
        {checking ? "Tekshirilmoqda..." : "Savolni ochish"}
      </button>
    </div>
  );
}
