"use client";

import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

export default function CompetitionInfoManager({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionInfo: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Xatolik yuz berdi");
      setValue(data.competitionInfo);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Musobaqa haqida</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Bosh sahifada ko'rsatiladigan matn — bold, kursiv va havola qo'shishingiz mumkin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-5 shadow-lg shadow-teal-900/5 sm:p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">Tahrirlash</p>
          <RichTextEditor value={value} onChange={setValue} />

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

        <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-5 shadow-lg shadow-teal-900/5 sm:p-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">
            Bosh sahifada shunday ko'rinadi
          </p>
          <div className="rounded-2xl border border-white/60 bg-white/60 p-5">
            <div
              className="prose-content text-[15px] leading-7 text-neutral-700"
              dangerouslySetInnerHTML={{ __html: value || "<p class='text-neutral-400'>Matn kiritilmagan</p>" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
