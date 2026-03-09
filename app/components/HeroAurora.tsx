"use client";
import { useRef, useEffect } from "react";

export default function HeroAurora() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 스크롤하면 블롭 페이드아웃
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const fadeEnd = window.innerHeight * 0.45;
      const opacity = Math.max(0, 1 - window.scrollY / fadeEnd);
      el.style.opacity = String(opacity);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-aurora-wrap"
      aria-hidden
    >
      <div className="hero-aurora-blob blob1" />
      <div className="hero-aurora-blob blob2" />
      <div className="hero-aurora-blob blob3" />
    </div>
  );
}
