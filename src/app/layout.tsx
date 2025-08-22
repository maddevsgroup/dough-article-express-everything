import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "article",
  description: "a blogbase application – a DOUGH ai enabled starter that needs custom refinement and tailoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-10 border-b border-black/10 bg-[var(--cream)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--cream)]/80">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold">Article</Link>
            <nav className="flex items-center gap-2">
              <Link className="btn btn-secondary" href="/blog">Blogs</Link>
              <Link className="btn btn-primary" href="/management">Management</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
