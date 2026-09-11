import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quizzes Week — PDP University",
  description: "PDP University talabalari o'rtasidagi interaktiv viktorina musobaqasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
