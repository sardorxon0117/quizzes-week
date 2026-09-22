"use client";

import { useMemo, useState } from "react";

export type GroupRankRow = {
  id: number;
  name: string;
  found: number;
  correct: number;
  pct: number;
};

export type StudentRankRow = {
  id: number;
  full_name: string;
  group_name: string;
  found: number;
  correct: number;
  pct: number;
};

const RANK_STYLES = [
  { badge: "bg-[rgb(255,199,0)] text-neutral-950", ring: "ring-2 ring-[rgb(255,199,0)]/60", medal: "🥇" },
  { badge: "bg-neutral-300 text-neutral-900", ring: "ring-2 ring-neutral-300/60", medal: "🥈" },
  { badge: "bg-[rgb(205,140,90)] text-white", ring: "ring-2 ring-[rgb(205,140,90)]/50", medal: "🥉" },
];

function RankRow({
  rank,
  title,
  subtitle,
  found,
  correct,
  pct,
}: {
  rank: number;
  title: string;
  subtitle?: string;
  found: number;
  correct: number;
  pct: number;
}) {
  const style = RANK_STYLES[rank];
  return (
    <div className={`glass flex items-center gap-3 rounded-2xl p-3.5 shadow-lg shadow-teal-900/5 sm:gap-4 sm:p-4 ${style?.ring ?? ""}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black sm:h-10 sm:w-10 ${
          style ? style.badge : "bg-neutral-900/5 text-neutral-500"
        }`}
      >
        {style ? style.medal : rank + 1}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-neutral-950 sm:text-base">{title}</p>
        {subtitle && <p className="truncate text-xs font-semibold text-neutral-500">{subtitle}</p>}
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-900/8">
          <div className="h-full rounded-full bg-[rgb(0,175,166)]" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-black text-[rgb(0,140,133)] sm:text-lg">
          {correct}
          <span className="text-xs font-semibold text-neutral-400">/{found}</span>
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{pct}%</p>
      </div>
    </div>
  );
}

export default function StatsView({
  groupRanking,
  studentRanking,
}: {
  groupRanking: GroupRankRow[];
  studentRanking: StudentRankRow[];
}) {
  const [tab, setTab] = useState<"groups" | "students">("groups");

  const summary = useMemo(() => {
    if (tab === "groups") {
      return {
        count: groupRanking.length,
        countLabel: "Guruh",
        totalCorrect: groupRanking.reduce((sum, r) => sum + r.correct, 0),
        leader: groupRanking[0]?.name ?? "—",
      };
    }
    return {
      count: studentRanking.length,
      countLabel: "Talaba",
      totalCorrect: studentRanking.reduce((sum, r) => sum + r.correct, 0),
      leader: studentRanking[0]?.full_name ?? "—",
    };
  }, [tab, groupRanking, studentRanking]);

  return (
    <div>
      <div className="glass inline-flex rounded-xl p-1 shadow-lg shadow-teal-900/5">
        <button
          onClick={() => setTab("groups")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            tab === "groups" ? "bg-[rgb(0,175,166)] text-white shadow-md shadow-teal-900/20" : "text-neutral-500"
          }`}
        >
          Guruhlar
        </button>
        <button
          onClick={() => setTab("students")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            tab === "students" ? "bg-[rgb(0,175,166)] text-white shadow-md shadow-teal-900/20" : "text-neutral-500"
          }`}
        >
          Talabalar
        </button>
      </div>

      <div className="glass mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl shadow-lg shadow-teal-900/5 sm:grid-cols-3">
        <div className="bg-white/40 px-4 py-3.5 text-center">
          <strong className="block text-xl font-black text-neutral-950">{summary.count}</strong>
          <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">{summary.countLabel}</span>
        </div>
        <div className="bg-white/40 px-4 py-3.5 text-center">
          <strong className="block text-xl font-black text-[rgb(0,140,133)]">{summary.totalCorrect}</strong>
          <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">To'g'ri javob</span>
        </div>
        <div className="col-span-2 bg-white/40 px-4 py-3.5 text-center sm:col-span-1">
          <strong className="block truncate text-xl font-black text-neutral-950">{summary.leader}</strong>
          <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Yetakchi</span>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {tab === "groups" &&
          (groupRanking.length === 0 ? (
            <div className="glass rounded-2xl py-14 text-center text-sm text-neutral-400 shadow-lg shadow-teal-900/5">
              Hozircha natijalar yo'q
            </div>
          ) : (
            groupRanking.map((r, i) => (
              <RankRow key={r.id} rank={i} title={r.name} found={r.found} correct={r.correct} pct={r.pct} />
            ))
          ))}

        {tab === "students" &&
          (studentRanking.length === 0 ? (
            <div className="glass rounded-2xl py-14 text-center text-sm text-neutral-400 shadow-lg shadow-teal-900/5">
              Hozircha natijalar yo'q
            </div>
          ) : (
            studentRanking.map((r, i) => (
              <RankRow
                key={r.id}
                rank={i}
                title={r.full_name}
                subtitle={r.group_name}
                found={r.found}
                correct={r.correct}
                pct={r.pct}
              />
            ))
          ))}
      </div>
    </div>
  );
}
