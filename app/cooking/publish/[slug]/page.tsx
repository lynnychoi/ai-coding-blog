"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { COLORS, COMMON } from "../../styles";
import ThreadsPanel from "../../components/ThreadsPanel";
import BrunchPanel from "../../components/BrunchPanel";

const S = COMMON;

type Tab = "threads" | "brunch";

type PostData = {
  title: string;
  body: string;
  tags: string;
};

export default function PublishPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tab, setTab] = useState<Tab>("threads");
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/posts/${slug}`)
      .then(r => r.json())
      .then((d: { title?: string; body?: string; tags?: string; error?: string }) => {
        if (d.error) { setError(d.error); return; }
        setPost({
          title: d.title ?? "",
          body: d.body ?? "",
          tags: d.tags ?? "",
        });
      })
      .catch(() => setError("글을 불러오지 못했어요."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#555" }}>
        불러오는 중...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ ...S.page, padding: 24 }}>
        <div style={S.errorBox}>{error || "글을 찾을 수 없어요."}</div>
        <Link href="/cooking" style={{ ...S.smallBtn, display: "inline-block", marginTop: 12, textDecoration: "none" }}>← 대시보드</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "threads", label: "🧵 Threads" },
    { key: "brunch", label: "🫧 브런치" },
  ];

  return (
    <div style={S.page}>
      {/* 상단 */}
      <div style={S.top}>
        <Link href={`/cooking/edit/${slug}`} style={S.back}>← 편집으로</Link>
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          외부 게시
        </span>
        <a
          href={`/blog/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#555", textDecoration: "none", border: "1px solid #1c1c2a", borderRadius: 5, padding: "3px 8px" }}
        >
          글 보기 ↗
        </a>
      </div>

      {/* 글 제목 표시 */}
      <div style={{ padding: "10px 16px 0", fontSize: 13, color: "#7070a0" }}>
        {post.title}
      </div>

      {/* 탭 바 */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg, marginTop: 12 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "transparent",
              border: "none",
              color: tab === t.key ? COLORS.primary : COLORS.textMuted,
              fontSize: 14,
              fontWeight: tab === t.key ? 700 : 400,
              cursor: "pointer",
              borderBottom: tab === t.key ? `2px solid ${COLORS.primary}` : "2px solid transparent",
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 패널 */}
      {tab === "threads" && (
        <ThreadsPanel title={post.title} body={post.body} tags={post.tags} slug={slug} />
      )}
      {tab === "brunch" && (
        <BrunchPanel title={post.title} body={post.body} />
      )}
    </div>
  );
}
