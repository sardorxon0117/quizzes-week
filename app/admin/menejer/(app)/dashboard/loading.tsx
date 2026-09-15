export default function DashboardLoading() {
  return (
    <div className="p-6 sm:p-10">
      <div className="skeleton h-7 w-40 rounded-full" />
      <div className="skeleton mt-2 h-4 w-64 rounded-full" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-3xl p-5 shadow-lg shadow-teal-900/5">
            <div className="skeleton h-8 w-16 rounded-lg" />
            <div className="skeleton mt-3 h-3 w-24 rounded-full" />
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-3xl p-5 shadow-lg shadow-teal-900/5">
        <div className="skeleton mb-4 h-4 w-32 rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
