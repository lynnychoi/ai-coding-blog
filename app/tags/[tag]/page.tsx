import { getAllPosts } from "../../../lib/posts";
import { notFound } from "next/navigation";

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

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set(posts.flatMap((p) => p.tags));
  return Array.from(tags).map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const posts = getAllPosts().filter((p) => p.tags.includes(tag));
  if (posts.length === 0) notFound();

  const color = tagColor(tag);

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", paddingTop: "2rem" }}>
      <a href="/tags" className="back-link">← 태그 목록</a>

      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{
          fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em",
          color: "var(--accent-purple)", textTransform: "uppercase", marginBottom: "0.75rem"
        }}>
          Tag
        </p>
        <h1 style={{
          fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em",
          marginBottom: "0.5rem", color
        }}>
          #{tag}
        </h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-faint)" }}>
          {posts.length}개의 포스트
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}`} className="post-card" style={{ display: "block" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${color}, ${color}88)`
              }} />
              <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginBottom: "0.5rem" }}>
                {post.date}
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>
                {post.title}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
