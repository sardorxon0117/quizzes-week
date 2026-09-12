"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PopupShell from "./PopupShell";
import StatusView, { StatusPhase } from "./StatusView";
import { checkQuestionCode, codeCheckMessage } from "@/lib/checkQuestionCode";

export default function CodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [checkState, setCheckState] = useState<StatusPhase | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const digits = code.padEnd(6, " ").split("").slice(0, 6);

  function handleChange(v: string) {
    const cleaned = v.replace(/\D/g, "").slice(0, 6);
    setCode(cleaned);
  }

  async function runCheck() {
    setCheckState("checking");
    const result = await checkQuestionCode(code);
    if (result.kind === "ok") {
      setCheckState("redirecting");
      router.push(`/q/${code}`);
    } else {
      setCheckState("error");
      setErrorMessage(codeCheckMessage(result));
    }
  }

  function handleOpen() {
    if (code.length !== 6) return;
    runCheck();
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

      <button
        onClick={handleOpen}
        disabled={code.length !== 6}
        className="w-full mt-5 rounded-xl py-3.5 font-bold text-white bg-[rgb(0,175,166)] shadow-md shadow-teal-900/20 transition-all active:scale-95 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
      >
        Savolni ochish
      </button>

      {checkState && (
        <PopupShell title="Savol tekshirilmoqda" onClose={() => setCheckState(null)}>
          <StatusView
            phase={checkState}
            errorMessage={errorMessage}
            onRetry={checkState === "error" ? runCheck : undefined}
          />
        </PopupShell>
      )}
    </div>
  );
}
