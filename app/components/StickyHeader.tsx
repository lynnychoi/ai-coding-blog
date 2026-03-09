"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function StickyHeader() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    setVisible(false);

    const isDesktop = window.innerWidth >= 641;

    // 데스크탑이거나 홈이 아닌 페이지는 바로 표시
    if (isDesktop || !isHome) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }

    // 모바일 홈에서만 스크롤 후 표시
    const threshold = window.innerHeight * 0.6;
    const check = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [pathname, isHome]);

  return (
    <header
      className="site-header-fixed"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      <div className="header-inner">
        <a href="/" className="logo">
          <span className="logo-name">Lynn</span>
          <span className="logo-dot">.ai</span>
        </a>
        <nav className="site-nav">
          <a href="/blog" className="nav-link">Dev Log</a>
          <a href="/writings" className="nav-link">Writing</a>
          <a href="/about" className="nav-link">About</a>
        </nav>
      </div>
    </header>
  );
}
