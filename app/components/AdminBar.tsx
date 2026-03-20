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
      gap: 8,
      alignItems: "center",
    }}>
      {slug && (
        <Link href={`/admin/edit/${slug}`} style={{
          padding: "8px 16px",
          borderRadius: 10,
          background: "#c4b8f8",
          color: "#0a0a0f",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          ✏️ 편집
        </Link>
      )}
      <Link href="/admin" style={{
        padding: "8px 16px",
        borderRadius: 10,
        background: "#a8f0d8",
        color: "#0a0a0f",
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}>
        Admin
      </Link>
    </div>
  );
}
