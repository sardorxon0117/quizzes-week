export default function StatsLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="glass mx-auto max-w-2xl rounded-2xl px-5 py-3.5 shadow-lg shadow-teal-900/5">
          <div className="skeleton h-4 w-20 rounded-full" />
        </div>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton mt-3 h-7 w-40 rounded-full" />
          <div className="skeleton mt-2 h-4 w-64 rounded-full" />

          <div className="skeleton mt-6 h-10 w-52 rounded-xl" />

          <div className="glass mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl shadow-lg shadow-teal-900/5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/40 px-4 py-4 text-center">
                <div className="skeleton mx-auto h-5 w-10 rounded-full" />
                <div className="skeleton mx-auto mt-2 h-2.5 w-14 rounded-full" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass flex items-center gap-3 rounded-2xl p-3.5 shadow-lg shadow-teal-900/5 sm:gap-4 sm:p-4">
                <div className="skeleton h-9 w-9 shrink-0 rounded-xl sm:h-10 sm:w-10" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="skeleton h-4 w-24 rounded-full" />
                  <div className="skeleton h-1.5 w-full rounded-full" />
                </div>
                <div className="skeleton h-8 w-12 shrink-0 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
