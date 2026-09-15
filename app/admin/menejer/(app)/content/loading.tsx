export default function ContentLoading() {
  return (
    <div className="p-6 sm:p-10">
      <div className="mb-8">
        <div className="skeleton h-7 w-56 rounded-full" />
        <div className="skeleton mt-2 h-3.5 w-80 rounded-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-lg shadow-teal-900/5 sm:p-6">
            <div className="skeleton mb-3 h-3 w-20 rounded-full" />
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
