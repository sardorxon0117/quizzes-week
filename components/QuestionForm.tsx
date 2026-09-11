"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Group = { id: number; name: string };

export default function QuestionForm({
  questionId,
  groups,
}: {
  questionId: number;
  groups: Group[];
}) {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkingGroup, setCheckingGroup] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleGroupChange(value: string) {
    setGroupId(value);
    setError(null);
    setAlreadyAnswered(false);
    if (!value) return;

    setCheckingGroup(true);
    try {
      const res = await fetch(`/api/submissions?questionId=${questionId}&groupId=${value}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      setAlreadyAnswered(Boolean(data.answered));
    } catch {
      setError("Guruh holatini tekshirib bo'lmadi. Qaytadan urinib ko'ring.");
    } finally {
      setCheckingGroup(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!groupId) {
      setError("Iltimos, guruhingizni tanlang.");
      return;
    }
    if (alreadyAnswered) return;
    if (!answer.trim()) {
      setError("Javobni kiriting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, groupId: Number(groupId), answer: answer.trim() }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError("Bu savolga guruhingiz allaqachon javob bergan.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        setError(data?.error || "Javobni yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setTimeout(() => router.push("/"), 1600);
    } catch {
      setError("Javobni yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-14">
        <div className="w-14 h-14 mx-auto mb-4 bg-[rgb(0,175,166)] flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 12L9 17L20 6" stroke="white" strokeWidth="3" strokeLinecap="square" />
          </svg>
        </div>
        <p className="text-lg font-bold text-neutral-900">Javob yuborildi</p>
        <p className="text-sm text-neutral-500 mt-1">Bosh sahifaga qaytilmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wide">
          Guruhingizni tanlang
        </label>
        <select
          value={groupId}
          onChange={(e) => handleGroupChange(e.target.value)}
          className="w-full border-2 border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-900"
        >
          <option value="">Guruhingizni tanlang</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {checkingGroup && <p className="text-sm font-semibold text-[rgb(0,145,137)]">Guruh holati tekshirilmoqda...</p>}
      {alreadyAnswered && (
        <div className="border-2 border-[rgb(255,199,0)] bg-[rgb(255,248,210)] p-4" role="alert">
          <p className="font-bold text-neutral-950">Bu savolga javob berib bo'lingan</p>
          <p className="mt-1 text-sm text-neutral-700">Guruhingiz ushbu QR savolga allaqachon javob yuborgan.</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wide">
          Javobingiz
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          placeholder="Javobingizni yozing"
          className="w-full border-2 border-neutral-300 px-4 py-3 font-medium text-neutral-900"
        />
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || checkingGroup || alreadyAnswered}
        className="w-full bg-[rgb(0,175,166)] py-3.5 font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
      >
        {alreadyAnswered ? "Javob yuborilgan" : submitting ? "Yuborilmoqda..." : "Javobni yuborish"}
      </button>
    </div>
  );
}
