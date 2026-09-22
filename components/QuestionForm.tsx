"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Group = { id: number; name: string };
type Student = { id: number; full_name: string };

export default function QuestionForm({
  questionId,
  groups,
}: {
  questionId: number;
  groups: Group[];
}) {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkingGroup, setCheckingGroup] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [answeredBy, setAnsweredBy] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleGroupChange(value: string) {
    setGroupId(value);
    setStudentId("");
    setStudents([]);
    setError(null);
    setAlreadyAnswered(false);
    setAnsweredBy(null);
    if (!value) return;

    setCheckingGroup(true);
    setLoadingStudents(true);
    try {
      const [subRes, studentsRes] = await Promise.all([
        fetch(`/api/submissions?questionId=${questionId}`),
        fetch(`/api/students?groupId=${value}`),
      ]);
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData?.error);
      setAlreadyAnswered(Boolean(subData.answered));
      setAnsweredBy(subData.submission?.group_name || null);

      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      }
    } catch {
      setError("Guruh holatini tekshirib bo'lmadi. Qaytadan urinib ko'ring.");
    } finally {
      setCheckingGroup(false);
      setLoadingStudents(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!groupId) {
      setError("Iltimos, guruhingizni tanlang.");
      return;
    }
    if (alreadyAnswered) return;
    if (!studentId) {
      setError("Iltimos, o'zingizni talabalar ro'yxatidan tanlang.");
      return;
    }
    if (!answer.trim()) {
      setError("Javobni kiriting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          groupId: Number(groupId),
          studentId: Number(studentId),
          answer: answer.trim(),
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setAlreadyAnswered(true);
        setAnsweredBy(data?.groupName || null);
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
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgb(0,175,166)] shadow-lg shadow-teal-900/30 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 12L9 17L20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
          className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 font-semibold text-neutral-900 focus:border-[rgb(0,175,166)]"
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
        <div className="rounded-2xl border border-[rgb(255,199,0)]/50 bg-[rgb(255,199,0)]/10 p-4" role="alert">
          <p className="font-bold text-neutral-950">Bu savolga javob berib bo'lingan</p>
          <p className="mt-1 text-sm text-neutral-700">
            Bu savolga {answeredBy ? `${answeredBy} guruhi` : "boshqa guruh"} tomonidan javob berilgan.
          </p>
        </div>
      )}

      {groupId && !alreadyAnswered && (
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wide">
            O'zingizni tanlang
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={loadingStudents}
            className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 font-semibold text-neutral-900 focus:border-[rgb(0,175,166)] disabled:opacity-60"
          >
            <option value="">{loadingStudents ? "Yuklanmoqda..." : "Ismingizni tanlang"}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
          {!loadingStudents &&
            (students.length === 0 ? (
              <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-bold text-red-600">Bu guruhda talaba mavjud emas.</p>
                <a
                  href="https://t.me/sardorxon_me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-transform active:scale-95"
                >
                  Menejerga murojaat qilish
                </a>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
                <span>Ro'yxatda ismingiz yo'qmi?</span>
                <a
                  href="https://t.me/sardorxon_me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[rgb(0,145,137)] underline underline-offset-2"
                >
                  Menejerga murojaat qiling
                </a>
              </div>
            ))}
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
          className="w-full rounded-xl border border-neutral-200 bg-white/70 px-4 py-3 font-medium text-neutral-900 focus:border-[rgb(0,175,166)]"
        />
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || checkingGroup || alreadyAnswered}
        className="w-full rounded-xl bg-[rgb(0,175,166)] py-3.5 font-bold text-white shadow-md shadow-teal-900/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none"
      >
        {alreadyAnswered ? "Javob yuborilgan" : submitting ? "Yuborilmoqda..." : "Javobni yuborish"}
      </button>
    </div>
  );
}
