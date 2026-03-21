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

      {/* 글 목록 */}
      <Section title="Dev" posts={devPosts} deletingSlug={deletingSlug} onDelete={handleDelete} />
      <Section title="Writing" posts={writingPosts} deletingSlug={deletingSlug} onDelete={handleDelete} />

      {filtered.length === 0 && (
        <div style={{ color: "#555", fontSize: 13, textAlign: "center", marginTop: 40 }}>
          해당하는 글이 없어요.
        </div>
      )}
    </>
  );
}

function Section({
  title,
  posts,
  deletingSlug,
  onDelete,
}: {
  title: string;
  posts: PostMeta[];
  deletingSlug: string | null;
  onDelete: (slug: string) => void;
}) {
  if (posts.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {title} ({posts.length})
      </div>
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
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {post.status === "published" && (
              <Link href={`/blog/${post.slug}`} target="_blank" style={{
                padding: "6px 12px", borderRadius: 6,
                border: "1px solid #2a2a3e", color: "#888",
                fontSize: 12, textDecoration: "none",
              }}>
                보기
              </Link>
            )}
            <Link href={`/cooking/edit/${post.slug}`} style={{
              padding: "6px 12px", borderRadius: 6,
              background: "#1e1e38", color: "#c4b8f8",
              fontSize: 12, textDecoration: "none",
              border: "1px solid #2a2a3e",
            }}>
              수정
            </Link>
            <button
              onClick={() => onDelete(post.slug)}
              disabled={deletingSlug === post.slug}
              style={{
                padding: "6px 12px", borderRadius: 6,
                background: "transparent", color: deletingSlug === post.slug ? "#555" : "#c06060",
                fontSize: 12, border: "1px solid #3a2a2a",
                cursor: deletingSlug === post.slug ? "default" : "pointer",
              }}
            >
              {deletingSlug === post.slug ? "..." : "삭제"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
