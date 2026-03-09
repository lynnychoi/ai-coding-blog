import { getAllPosts } from "../lib/posts";
import { currentItems } from "../content/currently";
import PostList from "./components/PostList";

export default function Home() {
  const posts = getAllPosts();
  const featured = posts[0] ?? null;
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <p className="hero-eyebrow">기획자의 코딩 기록</p>
        <h1 className="hero-title">
          <span style={{ color: "var(--accent)" }}>기획자가</span>
          <br />
          <span style={{ color: "var(--text)" }}>직접 만들기 시작했다.</span>
        </h1>
        <p className="hero-desc">
          디자이너이자 기획자. AI 코딩을 시작한 Lynn의 개발 기록.
          배운 것, 실수한 것, 고쳐나간 것들을 씁니다.
        </p>
      </section>

      {posts.length === 0 ? (
        <div style={{ padding: "4rem 0", color: "var(--text-3)", fontSize: "0.875rem" }}>
          아직 포스트가 없어요.
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-bar">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{allTags.length}</strong> tags</span>
          </div>

          {/* Featured */}
          {featured && (
            <a href={`/blog/${featured.slug}`} className="featured-post">
              <p className="featured-label">✦ Latest</p>
              <h2 className="featured-title">{featured.title}</h2>
              <div className="featured-meta">
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readingTime}min read</span>
                {featured.tags.slice(0, 2).map((t) => (
                  <span key={t} style={{ color: "var(--accent)", opacity: 0.7 }}>[{t}]</span>
                ))}
              </div>
            </a>
          )}

          {/* Currently */}
          <div style={{ marginBottom: "3rem" }}>
            <p className="section-label">Currently</p>
            <div className="currently-strip">
              {currentItems.map((item, i) => (
                <div key={i} className="currently-item">
                  <span className="currently-emoji">{item.emoji}</span>
                  <div className="currently-title">{item.title}</div>
                  <div className="currently-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* All posts */}
          <div>
            <p className="section-label">All Posts</p>
            <PostList posts={posts} />
          </div>
        </>
      )}
    </div>
  );
}
