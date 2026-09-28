"use client";

import { useState } from "react";

type Status = "open" | "not_started" | "ended";

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  not_started: { label: "Hali boshlanmagan", className: "bg-[rgb(255,199,0)]/20 text-neutral-800" },
  open: { label: "Davom etmoqda", className: "bg-[rgb(0,175,166)] text-white" },
  ended: { label: "Yakunlangan", className: "bg-neutral-900/10 text-neutral-600" },
};

export default function GamePeriodManager({
  initialStart,
  initialEnd,
  initialStatus,
}: {
  initialStart: string;
  initialEnd: string;
  initialStatus: Status;
}) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/game-period", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Xatolik yuz berdi");
      setStart(data.start);
      setEnd(data.end);
      setStatus(data.status);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  const badge = STATUS_BADGE[status];

  return (
    <div className="mb-10 rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-5 shadow-lg shadow-teal-900/5 sm:p-6">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-neutral-900">O'yin muddati</h2>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
      </div>
      <p className="mb-5 text-sm text-neutral-500">
        Shu vaqt oralig'idan tashqarida talabalar savollarni ko'ra olmaydi va javob yubora olmaydi. Toshkent vaqti bo'yicha.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">Boshlanish</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
          />
          <p className="mt-1 text-[11px] text-neutral-400">Bo'sh qoldirilsa — o'yin darhol ochiq.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">Tugash</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
          />
          <p className="mt-1 text-[11px] text-neutral-400">Bo'sh qoldirilsa — tugash vaqti yo'q.</p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-[rgb(0,175,166)] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 transition-transform active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
        {saved && <span className="text-sm font-semibold text-[rgb(0,145,137)]">Saqlandi ✓</span>}
      </div>
    </div>
  );
}
