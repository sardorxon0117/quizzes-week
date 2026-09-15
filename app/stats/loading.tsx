export default function StatsLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="glass mx-auto max-w-4xl rounded-2xl px-5 py-3.5 shadow-lg shadow-teal-900/5">
          <div className="skeleton h-4 w-20 rounded-full" />
        </div>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="skeleton h-7 w-56 rounded-full" />
          <div className="skeleton mt-2 h-4 w-72 rounded-full" />

          <div className="glass mt-6 overflow-hidden rounded-3xl shadow-lg shadow-teal-900/5">
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
