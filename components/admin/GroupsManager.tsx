"use client";

import { useState } from "react";

type Group = {
  id: number;
  name: string;
  is_active: boolean;
  found: number;
  correct: number;
};

export default function GroupsManager({ initialGroups }: { initialGroups: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(g: Group) {
    setEditing(g);
    setName(g.name);
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Guruh nomini kiriting");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/groups/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGroups((prev) => prev.map((g) => (g.id === editing.id ? { ...g, ...data } : g)));
      } else {
        const res = await fetch(`/api/admin/groups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGroups((prev) => [...prev, { ...data, found: 0, correct: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
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
    const res = await fetch(`/api/admin/groups/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.softDeleted) {
      setGroups((prev) => prev.map((g) => (g.id === deleteTarget.id ? { ...g, is_active: false } : g)));
    } else {
      setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Guruhlar</h1>
          <p className="text-sm text-neutral-500 mt-1">{groups.length} ta guruh</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-[rgb(0,175,166)] shadow-md shadow-teal-900/20 transition-transform active:scale-95"
        >
          + Guruh yaratish
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="glass rounded-3xl text-center py-20 text-neutral-400">Hozircha guruhlar yo'q</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {groups.map((g) => (
            <div key={g.id} className="glass rounded-3xl p-4 shadow-lg shadow-teal-900/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg text-neutral-900">{g.name}</span>
                {!g.is_active && (
                  <span className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-neutral-200/70 text-neutral-500">
                    NOFAOL
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                {g.correct} to'g'ri / {g.found} topilgan
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => openEdit(g)}
                  className="flex-1 rounded-lg text-xs font-bold py-2 border border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => setDeleteTarget(g)}
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
            <h2 className="text-lg font-bold mb-5 text-neutral-900">{editing ? "Guruhni tahrirlash" : "Guruh yaratish"}</h2>
            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wide">
              Guruh nomi
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="FE-201"
              className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5 focus:border-[rgb(0,175,166)]"
              autoFocus
            />
            {error && <p className="text-sm text-red-600 font-medium mt-2">{error}</p>}
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
                {saving ? "Saqlanmoqda..." : "Guruh yaratish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-5 z-50">
          <div className="glass w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <p className="font-bold text-neutral-900 mb-6">Bu guruhni o'chirishni xohlaysizmi?</p>
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
