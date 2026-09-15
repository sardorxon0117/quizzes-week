import StudentHeader from "@/components/StudentHeader";
import Footer from "@/components/Footer";

export default function HomeLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-1 px-5 py-10 sm:px-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <section className="order-2 lg:order-1 space-y-4">
            <div className="skeleton h-14 w-full max-w-lg rounded-2xl" />
            <div className="skeleton h-14 w-4/5 max-w-md rounded-2xl" />
            <div className="skeleton mt-4 h-6 w-full max-w-md rounded-xl" />
            <div className="skeleton h-20 w-full max-w-md rounded-2xl" />
          </section>

          <section className="glass order-1 rounded-3xl p-5 shadow-xl shadow-teal-900/10 sm:p-7 lg:order-2">
            <div className="mb-5 flex items-center justify-between">
              <div className="skeleton h-3 w-28 rounded-full" />
              <span className="h-2.5 w-2.5 rounded-full bg-[rgb(255,199,0)]/40" />
            </div>
            <div className="skeleton h-4 w-40 rounded-full" />
            <div className="mt-3 grid grid-cols-6 gap-1.5 sm:gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-xl" />
              ))}
            </div>
            <div className="skeleton mt-5 h-12 w-full rounded-xl" />
            <div className="my-6 h-px w-full bg-neutral-200/70" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
