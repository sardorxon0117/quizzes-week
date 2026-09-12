"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Question = {
  id: number;
  code: string;
  question: string;
  answer: string;
  is_active: boolean;
  created_at: string;
};

export default function QuestionsManager({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [formQ, setFormQ] = useState("");
  const [formA, setFormA] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const baseUrl = window.location.origin;
    questions.forEach((q) => {
      if (qrMap[q.code]) return;
      QRCode.toDataURL(`${baseUrl}/q/${q.code}`, { margin: 1, width: 200 }).then((url) => {
        setQrMap((prev) => ({ ...prev, [q.code]: url }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  function openCreate() {
    setEditing(null);
    setFormQ("");
    setFormA("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(q: Question) {
    setEditing(q);
    setFormQ(q.question);
    setFormA(q.answer);
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formQ.trim() || !formA.trim()) {
      setError("Savol va javobni kiriting");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/questions/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: formQ.trim(), answer: formA.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setQuestions((prev) => prev.map((q) => (q.id === editing.id ? { ...q, ...data } : q)));
      } else {
        const res = await fetch(`/api/admin/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: formQ.trim(), answer: formA.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setQuestions((prev) => [data, ...prev]);
      }
      setShowForm(false);
    } catch (e: any) {
      setError(e.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/questions/${deleteTarget.id}`, { method: "DELETE" });
    setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  async function handlePdf(q: Question) {
    const res = await fetch(`/api/admin/questions/${q.id}/pdf`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `savol-${q.code}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadAll() {
    const res = await fetch(`/api/admin/questions/pdf-all`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcha-savollar.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Savollar</h1>
          <p className="text-sm text-neutral-500 mt-1">{questions.length} ta savol</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadAll}
            className="rounded-xl px-4 py-2.5 text-sm font-bold border border-neutral-300 bg-white/60 text-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors"
          >
            Hammasini PDF
          </button>
          <button
            onClick={openCreate}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-[rgb(0,175,166)] shadow-md shadow-teal-900/20 transition-transform active:scale-95"
          >
            + Savol yaratish
          </button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="glass rounded-3xl text-center py-20 text-neutral-400">Hozircha savollar yo'q</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q) => (
            <div key={q.id} className="glass rounded-3xl p-4 flex flex-col shadow-lg shadow-teal-900/5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-[rgb(0,175,166)]">#{q.code}</span>
                {!q.is_active && (
                  <span className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-neutral-200/70 text-neutral-500">
                    NOFAOL
                  </span>
                )}
              </div>
              {qrMap[q.code] && (
                <img src={qrMap[q.code]} alt={`QR ${q.code}`} className="w-24 h-24 mx-auto mb-3 rounded-xl bg-white p-1.5" />
              )}
              <p className="text-sm font-semibold text-neutral-900 mb-1 line-clamp-3">{q.question}</p>
              <p className="text-xs text-neutral-500 mb-4">
                To'g'ri javob: <span className="font-semibold text-neutral-700">{q.answer}</span>
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3 border-t border-neutral-200/60">
                <button
                  onClick={() => handlePdf(q)}
                  className="flex-1 rounded-lg text-xs font-bold py-2 border border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors"
                >
                  PDF
                </button>
                <button
                  onClick={() => openEdit(q)}
                  className="flex-1 rounded-lg text-xs font-bold py-2 border border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => setDeleteTarget(q)}
                  className="flex-1 rounded-lg text-xs font-bold py-2 border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-5 text-neutral-900">
              {editing ? "Savolni tahrirlash" : "Savol yaratish"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                  Savol
                </label>
                <textarea
                  value={formQ}
                  onChange={(e) => setFormQ(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                  To'g'ri javob
                </label>
                <input
                  value={formA}
                  onChange={(e) => setFormA(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
                />
              </div>
              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl py-2.5 font-bold border border-neutral-300 text-neutral-600"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl py-2.5 font-bold text-white bg-[rgb(0,175,166)] shadow-md shadow-teal-900/20 disabled:opacity-60"
              >
                {saving ? "Saqlanmoqda..." : "Savol yaratish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="glass w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <p className="font-bold text-neutral-900 mb-6">Bu savolni o'chirishni xohlaysizmi?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl py-2.5 font-bold border border-neutral-300 text-neutral-600"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl py-2.5 font-bold text-white bg-red-600 shadow-md shadow-red-900/20"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
