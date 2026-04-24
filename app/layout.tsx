import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwipeScholar — Find Your Research Match",
  description: "Swipe through UMD professor cards, find your research match, send the perfect cold email.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "#F8F7F5" }}>
        <header
          className="sticky top-0 z-50 border-b border-gray-100 shadow-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)" }}
        >
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xl">🎓</span>
              <span className="font-extrabold text-lg tracking-tight" style={{ color: "#D85A30" }}>
                SwipeScholar
              </span>
            </a>
            <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>
              UMD Research Discovery
            </p>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
