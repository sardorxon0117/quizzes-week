"use client";

import { useState } from "react";
import QRScanner from "./QRScanner";
import PopupShell from "./PopupShell";

export default function ScannerModal() {
  const [open, setOpen] = useState(false);

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
        <PopupShell title="QR kodni skanerlang" onClose={() => setOpen(false)}>
          <QRScanner />
        </PopupShell>
      )}
    </>
  );
}
