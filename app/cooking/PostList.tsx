"use client";
import { PostMeta } from "../../lib/posts";
import Link from "next/link";
import { useState } from "react";

type Filter = "all" | "published" | "unpublished";

export default function PostList({ initialPosts }: { initialPosts: PostMeta[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [posts, setPosts] = useState(initialPosts);

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);
  const devPosts = filtered.filter((p) => p.type === "dev");
  const writingPosts = filtered.filter((p) => p.type !== "dev");

  async function handleDelete(slug: string) {
    if (!confirm(`"${slug}" 글을 삭제할까요? 되돌릴 수 없어요.`)) return;
    setDeletingSlug(slug);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        alert(`삭제 실패: ${err.error}`);
        return;
      }
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      alert("삭제 중 오류가 발생했어요.");
    } finally {
      setDeletingSlug(null);
    }
  }

  const filterBtnStyle = (f: Filter) => ({
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #2a2a3e",
    background: filter === f ? "#a8f0d8" : "#0d0d18",
    color: filter === f ? "#0a0a0f" : "#888",
    fontSize: 12,
    fontWeight: filter === f ? 700 : 400,
    cursor: "pointer",
  });

  return (
    <>
      {/* 필터 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={filterBtnStyle("all")} onClick={() => setFilter("all")}>전체 ({posts.length})</button>
        <button style={filterBtnStyle("published")} onClick={() => setFilter("published")}>
          공개 ({posts.filter((p) => p.status === "published").length})
        </button>
        <button style={filterBtnStyle("unpublished")} onClick={() => setFilter("unpublished")}>
          비공개 ({posts.filter((p) => p.status === "unpublished").length})
        </button>
      </div>

      {/* 글 목록 — 섹션별 '+ 새 글'로 진입하면 해당 타입이 자동 선택됨 */}
      <Section title="Dev" newType="dev" posts={devPosts} deletingSlug={deletingSlug} onDelete={handleDelete} />
      <Section title="Writing" newType="writing" posts={writingPosts} deletingSlug={deletingSlug} onDelete={handleDelete} />
    </>
  );
}

const iconBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: 6,
  border: "1px solid #2a2a3e",
  background: "transparent",
  color: "#888",
  textDecoration: "none",
  cursor: "pointer",
  flexShrink: 0,
};

function Section({
  title,
  newType,
  posts,
  deletingSlug,
  onDelete,
}: {
  title: string;
  newType: "dev" | "writing";
  posts: PostMeta[];
  deletingSlug: string | null;
  onDelete: (slug: string) => void;
}) {
  return (
    <div style={{ marginBottom: 32 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#555", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {title} ({posts.length})
        </div>
        <Link href={`/cooking/write?type=${newType}`} style={{
          fontSize: 12, color: "#a8f0d8", textDecoration: "none",
          border: "1px solid #1e3a30", borderRadius: 6, padding: "4px 10px", fontWeight: 600,
        }}>+ 새 글</Link>
      </div>
      {posts.length === 0 && (
        <div style={{ color: "#3a3a4e", fontSize: 12, padding: "2px 2px 4px" }}>아직 없어요</div>
      )}
      {posts.map((post) => (
        <div key={post.slug} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderRadius: 10,
          border: `1px solid ${post.status === "unpublished" ? "#2a1a3e" : "#1a1a2e"}`,
          background: post.status === "unpublished" ? "#100a1a" : "#0d0d18",
          marginBottom: 8,
          gap: 12,
          opacity: post.status === "unpublished" ? 0.75 : 1,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {post.title}
              </div>
              {post.status === "unpublished" && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px",
                  borderRadius: 10, background: "#3a1a5e", color: "#c4a0f0",
                  flexShrink: 0, letterSpacing: "0.05em",
                }}>비공개</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>{post.date}</div>
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
            {post.status === "published" && (
              <Link href={`/blog/${post.slug}`} target="_blank" title="보기" style={iconBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Link>
            )}
            <Link href={`/cooking/edit/${post.slug}`} title="수정" style={{ ...iconBtn, color: "#c4b8f8" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
            <Link href={`/cooking/publish/${post.slug}`} title="외부 게시" style={{ ...iconBtn, color: "#a8f0d8" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
            <button
              onClick={() => onDelete(post.slug)}
              disabled={deletingSlug === post.slug}
              title="삭제"
              style={{
                ...iconBtn,
                color: deletingSlug === post.slug ? "#555" : "#c06060",
                cursor: deletingSlug === post.slug ? "default" : "pointer",
                background: "none",
                border: "none",
              } as React.CSSProperties}
            >
              {deletingSlug === post.slug ? (
                <span style={{ fontSize: 11 }}>...</span>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
