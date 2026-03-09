import { getAllPosts } from "../lib/posts";

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

export default function Home() {
  const posts = getAllPosts();

  return (
    <div>
      {/* Hero — 홈에서만 */}
      <section className="hero">
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "min(600px, 100%)", height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(167,139,250,0.12) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <h1 className="hero-title">
          <span style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #f472b6 50%, #a78bfa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            기획자가
          </span>
          <br />
          <span style={{ color: "var(--text)" }}>직접 만들기 시작했다</span>
        </h1>
        <p className="hero-desc">
          디자이너이자 기획자, 이제 막 AI 코딩을 시작한 Lynn의 개발 기록.
          배운 것, 실수한 것, 고쳐나간 것들을 씁니다.
        </p>
        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/about" style={{
            textDecoration: "none", fontSize: "0.8rem", color: "var(--text-muted)",
            padding: "0.35rem 0.875rem", borderRadius: "999px",
            border: "1px solid var(--border)"
          }}>소개 읽기</a>
          <a href="https://github.com/lynnychoi" target="_blank" rel="noopener noreferrer" style={{
            textDecoration: "none", fontSize: "0.8rem", color: "var(--text-muted)",
            padding: "0.35rem 0.875rem", borderRadius: "999px",
            border: "1px solid var(--border)"
          }}>GitHub ↗</a>
        </div>
        <svg viewBox="0 0 860 50" style={{ width: "100%", marginTop: "2.5rem", opacity: 0.4 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path d="M0,25 C140,50 280,0 420,25 C560,50 700,0 860,25 L860,50 L0,50 Z" fill="url(#waveGrad)" />
        </svg>
      </section>

      {/* Post list */}
      {posts.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem 1rem",
          color: "var(--text-muted)", fontSize: "0.9rem"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✦</div>
          아직 포스트가 없어요.<br />
          <code style={{
            background: "var(--bg-card)", padding: "0.2rem 0.6rem",
            borderRadius: "4px", fontSize: "0.85rem", marginTop: "0.5rem",
            display: "inline-block"
          }}>npm run generate:post</code>
        </div>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <div key={post.slug} className="post-card">
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, #a78bfa, #60a5fa)"
              }} />
              {post.tags.length > 0 && (
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  {post.tags.map((tag) => (
                    <a key={tag} href={`/tags/${tag}`} style={{
                      fontSize: "0.7rem", fontWeight: 600,
                      padding: "0.15rem 0.5rem", borderRadius: "999px",
                      color: tagColor(tag),
                      background: tagColor(tag) + "18",
                      border: `1px solid ${tagColor(tag)}30`,
                      textDecoration: "none"
                    }}>
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
              <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                {post.date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
