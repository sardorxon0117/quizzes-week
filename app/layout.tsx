import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quizzes Week — PDP University",
  description: "PDP University talabalari o'rtasidagi interaktiv viktorina musobaqasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-[#fbfffe] antialiased">
        <div className="bg-blobs" aria-hidden="true">
          <span className="bg-blob-1" />
          <span className="bg-blob-2" />
          <span className="bg-blob-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
