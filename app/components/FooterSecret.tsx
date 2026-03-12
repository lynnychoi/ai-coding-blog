"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function FooterSecret() {
  const clickCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const handleClick = () => {
    clickCount.current += 1;

    if (timer.current) clearTimeout(timer.current);

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      router.push("/cooking/login");
      return;
    }

    // 3초 안에 5번 클릭 안 하면 초기화
    timer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 3000);
  };

  return (
    <span
      onClick={handleClick}
      style={{
        fontSize: "0.72rem",
        color: "var(--text-3)",
        fontFamily: "'Fira Code', monospace",
        cursor: "default",
        userSelect: "none",
      }}
    >
      © 2026 Lynn Choi
    </span>
  );
}
