"use client";

import { useState } from "react";
import type { PostMeta } from "../../lib/posts";

const TAG_COLORS: Record<string, string> = {
  "setup":      "#fbbf24",
  "next.js":    "#60a5fa",
  "claude-api": "#a78bfa",
  "automation": "#34d399",
  "supabase":   "#4ade80",
  "vercel":     "#f472b6",
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? "#94a3b8";
}

export default function PostList({ posts }: { posts: PostMeta[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));
  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <div>
      {/* Tag filter */}
      {allTags.length > 0 && (
        <div style={{
          display: "flex", gap: "0.5rem", flexWrap: "wrap",
          marginBottom: "1.5rem", alignItems: "center"
        }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              fontSize: "0.75rem", fontWeight: 600, padding: "0.3rem 0.75rem",
              borderRadius: "999px", border: "1px solid",
              cursor: "pointer", transition: "all 0.15s",
              borderColor: !activeTag ? "var(--accent-purple)" : "var(--border)",
              background: !activeTag ? "rgba(167,139,250,0.12)" : "transparent",
              color: !activeTag ? "var(--accent-purple)" : "var(--text-muted)",
            }}
          >
            전체 {posts.length}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              style={{
                fontSize: "0.75rem", fontWeight: 600, padding: "0.3rem 0.75rem",
                borderRadius: "999px", border: "1px solid",
                cursor: "pointer", transition: "all 0.15s",
                borderColor: activeTag === tag ? tagColor(tag) : "var(--border)",
                background: activeTag === tag ? tagColor(tag) + "18" : "transparent",
                color: activeTag === tag ? tagColor(tag) : "var(--text-muted)",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Post grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          해당 태그의 글이 없어요.
        </div>
      ) : (
        <div className="post-grid">
          {filtered.map((post) => (
            <div key={post.slug} className="post-card">
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, #a78bfa, #60a5fa)"
              }} />
              {post.tags.length > 0 && (
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  {post.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/tags/${tag}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: "0.7rem", fontWeight: 600,
                        padding: "0.15rem 0.5rem", borderRadius: "999px",
                        color: tagColor(tag),
                        background: tagColor(tag) + "18",
                        border: `1px solid ${tagColor(tag)}30`,
                        textDecoration: "none"
                      }}
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              )}
              <a href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <h2 style={{
                  margin: 0, fontSize: "0.95rem", fontWeight: 600,
                  color: "var(--text)", lineHeight: 1.45,
                  letterSpacing: "-0.01em", marginBottom: "0.75rem"
                }}>
                  {post.title}
                </h2>
              </a>
              <div style={{
                display: "flex", gap: "0.75rem", alignItems: "center",
                fontSize: "0.72rem", color: "var(--text-faint)"
              }}>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readingTime}분 읽기</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
