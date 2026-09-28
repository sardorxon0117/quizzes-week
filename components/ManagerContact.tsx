export const MANAGER_URL = "https://t.me/sardorkhon_me";

const TONES = {
  primary: {
    box: "border-[rgb(0,175,166)]/30 bg-[rgb(0,175,166)]/10",
    text: "text-[rgb(0,145,137)]",
    button: "bg-[rgb(0,175,166)]",
  },
  danger: {
    box: "border-red-200 bg-red-50",
    text: "text-red-600",
    button: "bg-red-600",
  },
};

/** Tinted banner with a short message and a "Menejer bilan bog'lanish" button to the manager's Telegram. */
export default function ManagerContact({
  text,
  tone = "primary",
  buttonLabel = "Menejer bilan bog'lanish",
  className = "",
}: {
  text: string;
  tone?: keyof typeof TONES;
  buttonLabel?: string;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div className={`rounded-xl border p-3 ${t.box} ${className}`}>
      <p className={`text-xs font-bold ${t.text}`}>{text}</p>
      <a
        href={MANAGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-transform active:scale-95 ${t.button}`}
      >
        {buttonLabel}
      </a>
    </div>
  );
}
