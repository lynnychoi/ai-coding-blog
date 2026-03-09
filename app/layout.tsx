import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Coding Blog",
  description: "AI로 코딩하면서 배운 것들을 자동으로 기록합니다",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="site-wrapper">
          <header className="site-header">
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="/" style={{ textDecoration: "none" }}>
                <span style={{
                  fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em",
                  background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                  AI Coding Blog
                </span>
              </a>
              <nav style={{ display: "flex", gap: "1.25rem" }}>
                <a href="/" className="nav-link">글 목록</a>
                <a href="/tags" className="nav-link">태그</a>
                <a href="/about" className="nav-link">소개</a>
              </nav>
            </div>
          </header>

          <main className="site-main">{children}</main>

          <footer style={{
            borderTop: "1px solid var(--border)", padding: "1.5rem 0",
            textAlign: "center", color: "var(--text-faint)", fontSize: "0.75rem"
          }}>
            dev log → AI → blog post ✦ made with Claude
          </footer>
        </div>
      </body>
    </html>
  );
}
