import { getAllPosts } from "../../lib/posts";
import PostList from "../components/PostList";

export default function BlogPage() {
  const posts = getAllPosts().filter((p) => p.type === "dev");

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: "3rem" }}>
      <p className="section-label">Dev Log</p>
      <h1 style={{
        fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        marginBottom: "0.5rem",
        color: "var(--text)",
      }}>
        개발 기록
      </h1>
      <p style={{
        fontSize: "0.85rem",
        color: "var(--text-3)",
        fontFamily: "'Fira Code', monospace",
        marginBottom: "3.5rem",
      }}>
        {posts.length} posts
      </p>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>아직 포스트가 없어요.</p>
      ) : (
        <>
          {/* Latest */}
          <div className="latest-block">
            <p className="section-label">✦ Latest</p>
            {posts.slice(0, 3).map((post) => {
              const d = new Date(post.date);
              const dateLabel = `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
              return (
                <a key={post.slug} href={`/blog/${post.slug}`} className="latest-row">
                  <span className="latest-date">{dateLabel}</span>
                  <div className="latest-content">
                    <span className="latest-title">{post.title}</span>
                    <span className="latest-meta">{post.readingTime}min read</span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* All — 태그 필터 포함 */}
          <div>
            <p className="section-label">All</p>
            <PostList posts={posts} />
          </div>
        </>
      )}
    </div>
  );
}
