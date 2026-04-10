"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  type: "dev" | "writing";
  slugs: string[];
}

export default function AdminListControls({ type, slugs }: Props) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status").then(r => r.json()).then(d => setLoggedIn(d.loggedIn)).catch(() => {});
  }, []);

  if (!loggedIn) return null;

  return (
    <>
      {/* 새 글 쓰기 버튼 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <Link href={`/cooking/write`} style={{
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

      {/* 각 글 편집 버튼 — 절대 위치로 각 post-row / diary-card 위에 올림 */}
      <style>{`
        .has-admin-controls .post-row,
        .has-admin-controls .diary-card,
        .has-admin-controls .latest-row {
          position: relative;
        }
        .admin-edit-link {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: #6060a0;
          background: transparent;
          border: none;
          padding: 4px 8px;
          text-decoration: none;
          opacity: 0;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .has-admin-controls .post-row:hover .admin-edit-link,
        .has-admin-controls .diary-card:hover .admin-edit-link,
        .has-admin-controls .latest-row:hover .admin-edit-link {
          opacity: 1;
        }
      `}</style>

      {/* slug별 편집 링크를 JS로 삽입 */}
      <EditInjector slugs={slugs} />
    </>
  );
}

function EditInjector({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    const container = document.querySelector(".admin-list-page");
    if (!container) return;
    container.classList.add("has-admin-controls");

    const rows = container.querySelectorAll<HTMLAnchorElement>(".post-row, .diary-card, .latest-row");
    rows.forEach((row) => {
      const href = row.getAttribute("href") ?? "";
      const slug = href.replace("/blog/", "");
      if (!slugs.includes(slug)) return;
      if (row.querySelector(".admin-edit-link")) return;

      const link = document.createElement("a");
      link.href = `/cooking/edit/${slug}`;
      link.className = "admin-edit-link";
      link.textContent = "✏ 편집";
      link.onclick = (e) => e.stopPropagation();
      row.appendChild(link);
    });

    return () => {
      container.classList.remove("has-admin-controls");
      container.querySelectorAll(".admin-edit-link").forEach(el => el.remove());
    };
  }, [slugs]);

  return null;
}
