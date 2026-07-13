"use client";
import { useEffect, useState } from "react";

export default function ReadingProgress({ isWriting = false }: { isWriting?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const gradient = isWriting
    ? "linear-gradient(90deg, #93c5fd, #c4b5fd)"
    : "linear-gradient(90deg, var(--accent), #c4b5fd)";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: "2px",
        background: gradient,
        zIndex: 100,
        transition: "width 0.1s linear",
        pointerEvents: "none",
      }}
    />
  );
}
