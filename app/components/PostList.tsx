"use client";

import { useState } from "react";
import type { PostMeta } from "../../lib/posts";

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
        <div className="tag-filter-bar" style={{ marginBottom: "1.5rem" }}>
          <button
            className={`tag-filter-btn${!activeTag ? " active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter-btn${activeTag === tag ? " active" : ""}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Post list */}
      {filtered.length === 0 ? (
        <div style={{ padding: "2rem 0", color: "var(--text-3)", fontSize: "0.85rem" }}>
          해당 태그의 글이 없어요.
        </div>
      ) : (
        <div className="post-list">
          {filtered.map((post) => (
            <a key={post.slug} href={`/blog/${post.slug}`} className="post-row">
              <span className="post-row-date">{post.date}</span>
              <span className="post-row-title">{post.title}</span>
              <div className="post-row-meta">
                <span className="post-row-time">{post.readingTime}m</span>
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="tag-pill" onClick={(e) => {
                    e.preventDefault();
                    setActiveTag(tag === activeTag ? null : tag);
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
