import { getAllPosts } from "../lib/posts";
import { currentItems } from "../content/currently";
import PostList from "./components/PostList";
import HeroAurora from "./components/HeroAurora";
import HeroContent from "./components/HeroContent";
import AdminBar from "./components/AdminBar";
import FadeIn from "./components/FadeIn";

export default async function Home() {
  const posts = await getAllPosts();
  const devPosts = posts.filter((p) => p.type === "dev");
  const writingPosts = posts.filter((p) => p.type === "writing");
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <HeroAurora />
        <div className="hero-content-wrap">
          <HeroContent desc="디자이너이자 기획자. AI 코딩을 시작한 Lynn의 개발 기록. 배운 것, 실수한 것, 고쳐나간 것들을 씁니다." />
        </div>
      </section>

      {posts.length === 0 ? (
        <div style={{ padding: "4rem 0", color: "var(--text-3)", fontSize: "0.875rem" }}>
          아직 포스트가 없어요.
        </div>
      ) : (
        <>
          {/* Stats */}
          <FadeIn>
            <div className="stats-bar">
              <span><strong>{devPosts.length}</strong> dev logs</span>
              <span><strong>{writingPosts.length}</strong> writings</span>
              <span><strong>{allTags.length}</strong> tags</span>
            </div>
          </FadeIn>

          {/* Latest Dev Log */}
          {devPosts.length > 0 && (
            <FadeIn delay={0.05}>
              <div className="latest-block">
                <p className="section-label" style={{ color: "var(--accent)" }}>✦ Dev Log</p>
                {devPosts.map((post) => (
                  <a key={post.slug} href={`/blog/${post.slug}`} className="latest-row latest-row--dev">
                    <div className="latest-content">
                      <span className="latest-title">{post.title}</span>
                      <span className="latest-meta">{post.date} · {post.readingTime}min read</span>
                    </div>
                  </a>
                ))}
              </div>
            </FadeIn>
          )}

          {/* Latest Writing */}
          {writingPosts.length > 0 && (
            <FadeIn delay={0.1}>
              <div className="latest-block">
                <p className="section-label" style={{ color: "#c4b5fd" }}>✦ Writing</p>
                {writingPosts.map((post) => (
                  <a key={post.slug} href={`/blog/${post.slug}`} className="latest-row latest-row--writing">
                    <div className="latest-content">
                      <span className="latest-title">{post.title}</span>
                      <span className="latest-meta">{post.date}</span>
                    </div>
                  </a>
                ))}
              </div>
            </FadeIn>
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

        </>
      )}
      <AdminBar />
    </div>
  );
}
