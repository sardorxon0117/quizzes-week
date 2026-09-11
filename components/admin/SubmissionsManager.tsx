"use client";

import { useMemo, useState } from "react";

type Submission = {
  id: number;
  status: "PENDING" | "CORRECT" | "WRONG";
  student_answer: string;
  submitted_at: string;
  question_code: string;
  question: string;
  correct_answer: string;
  group_name: string;
};

const filters = [
  { key: "ALL", label: "Barchasi" },
  { key: "PENDING", label: "Kutilmoqda" },
  { key: "CORRECT", label: "To'g'ri" },
  { key: "WRONG", label: "Noto'g'ri" },
] as const;

const statusStyles: Record<string, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  CORRECT: "bg-[rgb(0,175,166)] text-white",
  WRONG: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  CORRECT: "To'g'ri",
  WRONG: "Noto'g'ri",
};

export default function SubmissionsManager({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? submissions : submissions.filter((s) => s.status === filter)),
    [submissions, filter]
  );

  async function review(id: number, status: "CORRECT" | "WRONG") {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    await fetch(`/api/admin/submissions/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">So'rovlar</h1>
        <p className="text-sm text-neutral-500 mt-1">{submissions.length} ta javob</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-xs font-bold border-2 ${
              filter === f.key
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-300 text-neutral-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 border-2 border-dashed border-neutral-200">
          Bu bo'limda javoblar yo'q
        </div>
      ) : (
        <div className="bg-white border-2 border-neutral-900 overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="bg-neutral-900 text-white text-xs uppercase">
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-left px-4 py-3 font-bold">Guruh</th>
                <th className="text-left px-4 py-3 font-bold">Savol</th>
                <th className="text-left px-4 py-3 font-bold">Aniq javob</th>
                <th className="text-left px-4 py-3 font-bold">Talaba javobi</th>
                <th className="text-left px-4 py-3 font-bold">Baholash</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-neutral-100 align-top">
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-[10px] font-bold ${statusStyles[s.status]}`}>
                      {statusLabels[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{s.group_name}</td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="text-[10px] text-[rgb(0,175,166)] font-bold">#{s.question_code}</div>
                    {s.question}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{s.correct_answer}</td>
                  <td className="px-4 py-3 font-medium">{s.student_answer}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => review(s.id, "CORRECT")}
                        className="px-2.5 py-1.5 text-xs font-bold border-2 border-[rgb(0,175,166)] text-[rgb(0,175,166)] hover:bg-[rgb(0,175,166)] hover:text-white"
                      >
                        ✓ To'g'ri
                      </button>
                      <button
                        onClick={() => review(s.id, "WRONG")}
                        className="px-2.5 py-1.5 text-xs font-bold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        ✕ Noto'g'ri
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
