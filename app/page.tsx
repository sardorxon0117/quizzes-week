import StudentHeader from "@/components/StudentHeader";
import Footer from "@/components/Footer";
import QRScanner from "@/components/QRScanner";
import CodeEntry from "@/components/CodeEntry";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,#f4fffd_0%,#ffffff_52%,#fff9dc_100%)]">
      <StudentHeader />
      <main className="flex-1 px-5 py-8 sm:px-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <section className="order-2 lg:order-1">
            <p className="mb-5 inline-flex border-2 border-[rgb(0,175,166)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[rgb(0,145,137)] sm:text-xs">
              PDP University · Quizzes Week
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-neutral-950 sm:text-7xl">
              Bilimingizni<br /><span className="text-[rgb(0,175,166)]">namoyish qiling.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">
              QR kodni skanerlang, guruhingizni tanlang va bugungi savolga javob bering.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-3 border-y-2 border-neutral-950 py-4 text-center">
              <div><strong className="block text-2xl font-black">01</strong><span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Scan</span></div>
              <div className="border-x border-neutral-300"><strong className="block text-2xl font-black">02</strong><span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Javob</span></div>
              <div><strong className="block text-2xl font-black">03</strong><span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">Natija</span></div>
            </div>
          </section>

          <section className="order-1 border-2 border-neutral-950 bg-white p-4 shadow-[8px_8px_0_rgb(0,175,166)] sm:p-6 lg:order-2">
            <div className="mb-5 flex items-center justify-between border-b-2 border-neutral-950 pb-4">
              <div><p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-950">Savolga kirish</p><p className="mt-1 text-xs text-neutral-500">Kamerani QR kodga qarating</p></div>
              <span className="h-3 w-3 bg-[rgb(255,199,0)]" />
            </div>
            <QRScanner />
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">yoki kod bilan</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            <CodeEntry />
          </section>
      </main>
      <Footer />
    </div>
  );
}
