"use client";

import { useRef, useState } from "react";

type Group = { id: number; name: string };

type Student = {
  id: number;
  full_name: string;
  student_code: string;
  is_active: boolean;
  group_id: number;
  group_name: string;
  found: number;
  correct: number;
};

type UploadSummary = { created: number; updated: number; errors: { row: number; reason: string }[] };

export default function StudentsManager({
  initialStudents,
  groups,
}: {
  initialStudents: Student[];
  groups: Group[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [fullName, setFullName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    setEditing(null);
    setFullName("");
    setStudentCode("");
    setGroupId(groups[0] ? String(groups[0].id) : "");
    setError(null);
    setShowForm(true);
  }

  function openEdit(s: Student) {
    setEditing(s);
    setFullName(s.full_name);
    setStudentCode(s.student_code);
    setGroupId(String(s.group_id));
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!fullName.trim() || !studentCode.trim() || !groupId) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/students/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: fullName.trim(), studentCode: studentCode.trim(), groupId: Number(groupId) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const groupName = groups.find((g) => g.id === Number(groupId))?.name ?? editing.group_name;
        setStudents((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...data, group_name: groupName } : s)));
      } else {
        const res = await fetch(`/api/admin/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: fullName.trim(), studentCode: studentCode.trim(), groupId: Number(groupId) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStudents((prev) =>
          [...prev, data].sort((a, b) => a.group_name.localeCompare(b.group_name) || a.full_name.localeCompare(b.full_name))
        );
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
    const res = await fetch(`/api/admin/students/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.softDeleted) {
      setStudents((prev) => prev.map((s) => (s.id === deleteTarget.id ? { ...s, is_active: false } : s)));
    } else {
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadSummary(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/students/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yuklashda xatolik yuz berdi");
      setUploadSummary(data);
      // Refresh the list from the server since the upload can touch many rows at once.
      const listRes = await fetch("/api/admin/students");
      if (listRes.ok) setStudents(await listRes.json());
    } catch (e: any) {
      setUploadSummary({ created: 0, updated: 0, errors: [{ row: 0, reason: e.message || "Yuklashda xatolik yuz berdi" }] });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Talabalar</h1>
          <p className="text-sm text-neutral-500 mt-1">{students.length} ta talaba</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl px-4 py-2.5 text-sm font-bold border border-neutral-300 bg-white/60 text-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors disabled:opacity-60"
          >
            {uploading ? "Yuklanmoqda..." : "Ro'yxatni yuklash"}
          </button>
          <button
            onClick={openCreate}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-[rgb(0,175,166)] shadow-md shadow-teal-900/20 transition-transform active:scale-95"
          >
            + Talaba qo'shish
          </button>
        </div>
      </div>

      <p className="mb-6 text-xs text-neutral-500">
        Excel/CSV fayl ustunlari: <strong className="text-neutral-700">1-ustun</strong> — ism familiya,{" "}
        <strong className="text-neutral-700">2-ustun</strong> — guruh nomi (mavjud guruh nomi bilan bir xil bo'lishi kerak),{" "}
        <strong className="text-neutral-700">3-ustun</strong> — talaba ID. Birinchi qator sarlavha deb qabul qilinadi.
      </p>

      {students.length === 0 ? (
        <div className="glass rounded-3xl text-center py-20 text-neutral-400">Hozircha talabalar yo'q</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s) => (
            <div key={s.id} className="glass rounded-3xl p-4 shadow-lg shadow-teal-900/5">
              <div className="flex items-start justify-between mb-2 gap-2">
                <span className="rounded-full bg-[rgb(0,175,166)]/10 px-2.5 py-0.5 text-[10px] font-bold text-[rgb(0,145,137)]">
                  {s.group_name}
                </span>
                {!s.is_active && (
                  <span className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-neutral-200/70 text-neutral-500">
                    NOFAOL
                  </span>
                )}
              </div>
              <p className="font-bold text-neutral-900">{s.full_name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">ID: {s.student_code}</p>
              <p className="text-xs text-neutral-500 mt-2">
                {s.correct} to'g'ri / {s.found} topilgan
              </p>
              <div className="mt-4 flex gap-1.5">
                <button
                  onClick={() => openEdit(s)}
                  className="flex-1 rounded-lg text-xs font-bold py-2 border border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => setDeleteTarget(s)}
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
          <div className="glass w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-5 text-neutral-900">{editing ? "Talabani tahrirlash" : "Talaba qo'shish"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                  Ism familiya
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sardorxon Valiyev"
                  className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
                  Talaba ID
                </label>
                <input
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="12345678"
                  className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">Guruh</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
                >
                  <option value="">Guruhni tanlang</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
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
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="glass w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <p className="font-bold text-neutral-900 mb-6">"{deleteTarget.full_name}"ni o'chirishni xohlaysizmi?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl py-2.5 font-bold border border-neutral-300 text-neutral-600"
              >
                Bekor qilish
              </button>
              <button onClick={handleDelete} className="flex-1 rounded-xl py-2.5 font-bold text-white bg-red-600 shadow-md shadow-red-900/20">
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadSummary && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4 text-neutral-900">Yuklash natijasi</h2>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 rounded-xl bg-[rgb(0,175,166)]/10 p-3 text-center">
                <strong className="block text-xl font-black text-[rgb(0,140,133)]">{uploadSummary.created}</strong>
                <span className="text-[10px] font-bold uppercase text-neutral-500">Yangi</span>
              </div>
              <div className="flex-1 rounded-xl bg-neutral-900/5 p-3 text-center">
                <strong className="block text-xl font-black text-neutral-900">{uploadSummary.updated}</strong>
                <span className="text-[10px] font-bold uppercase text-neutral-500">Yangilandi</span>
              </div>
              <div className="flex-1 rounded-xl bg-red-500/10 p-3 text-center">
                <strong className="block text-xl font-black text-red-600">{uploadSummary.errors.length}</strong>
                <span className="text-[10px] font-bold uppercase text-neutral-500">Xato</span>
              </div>
            </div>
            {uploadSummary.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-200/60 divide-y divide-neutral-200/60">
                {uploadSummary.errors.map((err, i) => (
                  <p key={i} className="px-3 py-2 text-xs text-neutral-600">
                    {err.row > 0 ? `${err.row}-qator: ` : ""}
                    {err.reason}
                  </p>
                ))}
              </div>
            )}
            <button
              onClick={() => setUploadSummary(null)}
              className="w-full mt-5 rounded-xl py-2.5 font-bold text-white bg-[rgb(0,175,166)] shadow-md shadow-teal-900/20"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
