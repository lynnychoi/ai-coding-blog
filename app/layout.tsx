import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "./components/PageTransition";
import ScrollTop from "./components/ScrollTop";
import StickyHeader from "./components/StickyHeader";
import FooterSecret from "./components/FooterSecret";

export const metadata: Metadata = {
  title: "Lynn.ai — 기획자의 코딩 기록",
  description: "디자이너이자 기획자, AI 코딩을 시작한 Lynn의 개발 기록",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Fira+Code:wght@400;500&family=Gowun+Dodum&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css" rel="stylesheet" />
      </head>
      <body>
        <StickyHeader />
        <div className="site-wrapper">
          <main className="site-main">
            <ScrollTop />
            <PageTransition>{children}</PageTransition>
          </main>

          <footer style={{
            borderTop: "1px solid var(--border)",
            padding: "1.5rem 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}>
            <FooterSecret />
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)", fontFamily: "'Fira Code', monospace" }}>
              dev log → AI → blog post
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
