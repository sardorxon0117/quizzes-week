import StudentHeader from "@/components/StudentHeader";
import Footer from "@/components/Footer";
import QRScanner from "@/components/QRScanner";
import CodeEntry from "@/components/CodeEntry";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />
      <main className="flex-1 px-5 sm:px-8 py-8 sm:py-12">
        <div className="max-w-sm mx-auto">
          <QRScanner />
          <div className="flex items-center gap-3 my-8">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">yoki</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          <CodeEntry />
        </div>
      </main>
      <Footer />
    </div>
  );
}
