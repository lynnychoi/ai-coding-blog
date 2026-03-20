"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminBar({ slug }: { slug?: string }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then(r => r.json())
      .then(d => setLoggedIn(d.loggedIn))
      .catch(() => {});
  }, []);

  if (!loggedIn) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 999,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 6,
    }}>
      {slug && (
        <Link href={`/cooking/edit/${slug}`} style={{
          padding: "7px 14px",
          borderRadius: 20,
          background: "rgba(196, 184, 248, 0.15)",
          border: "1px solid rgba(196, 184, 248, 0.4)",
          color: "#c4b8f8",
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          letterSpacing: "0.02em",
        }}>
          ✏️ 편집
        </Link>
      )}
      <Link href="/cooking" style={{
        padding: "8px 16px",
        borderRadius: 20,
        background: "rgba(20, 20, 30, 0.75)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e8e8f0",
        fontSize: 12,
        fontWeight: 600,
        textDecoration: "none",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        letterSpacing: "0.02em",
      }}>
        🍳 Cooking Station
      </Link>
    </div>
  );
}
