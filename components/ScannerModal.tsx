"use client";

import { useEffect, useState } from "react";
import QRScanner from "./QRScanner";

export default function ScannerModal() {
  const [open, setOpen] = useState(false);

  // Lock background scroll while the popup is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-[rgb(0,175,166)] py-3.5 font-bold text-[rgb(0,175,166)] transition-colors hover:bg-[rgb(0,175,166)]/10"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
        </svg>
        QR kodni skanerlash
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass w-full max-w-sm rounded-3xl p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-950">QR kodni skanerlang</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200/60"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <QRScanner />
          </div>
        </div>
      )}
    </>
  );
}
