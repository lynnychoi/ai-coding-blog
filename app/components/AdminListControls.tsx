"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminListControls() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status").then(r => r.json()).then(d => setLoggedIn(d.loggedIn)).catch(() => {});
  }, []);

  if (!loggedIn) return null;

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
      <Link href="/cooking/write" style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#c4b8f8",
        background: "rgba(196, 184, 248, 0.1)",
        border: "1px solid rgba(196, 184, 248, 0.3)",
        borderRadius: 20,
        padding: "6px 14px",
        textDecoration: "none",
        letterSpacing: "0.02em",
      }}>
        + 새 글 쓰기
      </Link>
    </div>
  );
}
