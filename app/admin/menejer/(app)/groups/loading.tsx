export default function GroupsLoading() {
  return (
    <div className="p-6 sm:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="skeleton h-7 w-32 rounded-full" />
          <div className="skeleton mt-2 h-3.5 w-20 rounded-full" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-3xl p-4 shadow-lg shadow-teal-900/5">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton mt-2 h-3 w-24 rounded-full" />
            <div className="mt-4 flex gap-1.5">
              <div className="skeleton h-8 flex-1 rounded-lg" />
              <div className="skeleton h-8 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
