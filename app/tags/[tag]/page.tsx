import { getPublishedPosts } from "../../../lib/posts";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  const tags = new Set(posts.flatMap((p) => p.tags));
  return Array.from(tags).map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const posts = getPublishedPosts().filter((p) => p.tags.includes(tag));
  if (posts.length === 0) notFound();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: "3rem" }}>
      <a href="/tags" className="back-link">← Tags</a>

      <div style={{ marginBottom: "3rem" }}>
        <p style={{
          fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em",
          color: "var(--text-3)", textTransform: "uppercase",
          fontFamily: "'Fira Code', monospace", marginBottom: "1rem"
        }}>
          Tag
        </p>
        <h1 style={{
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)", fontWeight: 800,
          letterSpacing: "-0.04em", marginBottom: "0.5rem",
          color: "var(--accent)"
        }}>
          #{tag}
        </h1>
        <p style={{
          fontSize: "0.72rem", color: "var(--text-3)",
          fontFamily: "'Fira Code', monospace"
        }}>
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <a key={post.slug} href={`/blog/${post.slug}`} className="post-row">
            <span className="post-row-date">{post.date}</span>
            <span className="post-row-title">{post.title}</span>
            <div className="post-row-meta">
              <span className="post-row-time">{post.readingTime}m</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
