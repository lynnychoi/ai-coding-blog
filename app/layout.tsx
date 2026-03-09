import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lynn.ai — 기획자의 코딩 기록",
  description: "디자이너이자 기획자, AI 코딩을 시작한 Lynn의 개발 기록",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="site-wrapper">
          <header className="site-header">
            <a href="/" className="logo">
              <span className="logo-name">Lynn</span>
              <span className="logo-dot">.ai</span>
            </a>
            <nav className="site-nav">
              <a href="/" className="nav-link">Blog</a>
              <a href="/tags" className="nav-link">Tags</a>
              <a href="/about" className="nav-link">About</a>
            </nav>
          </header>

          <main className="site-main">{children}</main>

          <footer style={{
            borderTop: "1px solid var(--border)",
            padding: "1.5rem 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)", fontFamily: "'Fira Code', monospace" }}>
              © 2026 Lynn Choi
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)", fontFamily: "'Fira Code', monospace" }}>
              dev log → AI → blog post
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
