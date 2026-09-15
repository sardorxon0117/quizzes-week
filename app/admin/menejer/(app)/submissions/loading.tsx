export default function SubmissionsLoading() {
  return (
    <div className="p-6 sm:p-10">
      <div className="mb-6">
        <div className="skeleton h-7 w-32 rounded-full" />
        <div className="skeleton mt-2 h-3.5 w-24 rounded-full" />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-24 rounded-xl" />
        ))}
      </div>

      <div className="glass overflow-hidden rounded-3xl shadow-lg shadow-teal-900/5">
        <div className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
