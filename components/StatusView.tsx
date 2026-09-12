export type StatusPhase = "checking" | "redirecting" | "error";

export default function StatusView({
  phase,
  errorMessage,
  onRetry,
}: {
  phase: StatusPhase;
  errorMessage?: string;
  onRetry?: () => void;
}) {
  if (phase === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="rgb(220,38,38)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="rgb(220,38,38)" strokeWidth="2" />
          </svg>
        </div>
        <p className="max-w-xs text-sm font-semibold leading-6 text-neutral-800">{errorMessage}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-[rgb(0,175,166)] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 transition-transform active:scale-95"
          >
            Qayta urinish
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-[rgb(0,175,166)]/20 border-t-[rgb(0,175,166)]" />
      <p className="text-sm font-semibold text-neutral-700">
        {phase === "redirecting" ? "Savolga yo'naltirilmoqda..." : "Tekshirilmoqda..."}
      </p>
    </div>
  );
}
