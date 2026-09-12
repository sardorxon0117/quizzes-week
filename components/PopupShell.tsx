"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PopupShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Render into document.body via a portal instead of in-place. Any
  // ancestor that uses `backdrop-filter` (our own `.glass` cards, used all
  // over the app) becomes a containing block for `position: fixed`
  // descendants in WebKit/Safari — so without a portal this popup was being
  // sized and centered relative to that glass card, not the viewport,
  // which is why it looked squeezed into a small box instead of covering
  // the screen.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="popup-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-sm rounded-3xl p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-950">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/8 text-neutral-600 transition-colors hover:bg-neutral-900/15 hover:text-neutral-900"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
