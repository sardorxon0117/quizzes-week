"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

const buttons: { cmd: string; label: string; title: string }[] = [
  { cmd: "bold", label: "B", title: "Qalin (Bold)" },
  { cmd: "italic", label: "I", title: "Kursiv (Italic)" },
  { cmd: "insertUnorderedList", label: "•—", title: "Ro'yxat" },
];

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (ref.current && isFirstRender.current) {
      ref.current.innerHTML = value || "";
      isFirstRender.current = false;
    }
  }, [value]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML || "");
  }

  function handleLink() {
    const selection = window.getSelection();
    const existingHref =
      selection && selection.anchorNode
        ? (selection.anchorNode.parentElement?.closest("a")?.getAttribute("href") ?? "")
        : "";
    const url = window.prompt("Havola manzilini kiriting (https://...)", existingHref || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      exec("unlink");
      return;
    }
    exec("createLink", url.trim());
  }

  return (
    <div className="rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200/70 bg-white/60 px-2 py-2">
        {buttons.map((b) => (
          <button
            key={b.cmd}
            type="button"
            title={b.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(b.cmd)}
            className={`min-w-[34px] rounded-lg px-2.5 py-1.5 text-sm font-bold text-neutral-700 hover:bg-[rgb(0,175,166)]/10 hover:text-[rgb(0,145,137)] ${
              b.cmd === "italic" ? "italic" : ""
            }`}
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          title="Havola qo'shish"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className="min-w-[34px] rounded-lg px-2.5 py-1.5 text-sm font-bold text-neutral-700 hover:bg-[rgb(0,175,166)]/10 hover:text-[rgb(0,145,137)]"
        >
          🔗
        </button>
        <button
          type="button"
          title="Havolani olib tashlash"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("unlink")}
          className="min-w-[34px] rounded-lg px-2.5 py-1.5 text-xs font-bold text-neutral-500 hover:bg-red-500/10 hover:text-red-500"
        >
          Havolasiz
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        onBlur={() => onChange(ref.current?.innerHTML || "")}
        className="prose-content min-h-[160px] px-4 py-3.5 text-[15px] leading-7 text-neutral-800 focus:outline-none"
      />
    </div>
  );
}
