import { getAllPosts } from "../lib/posts";
import { currentItems } from "../content/currently";
import PostList from "./components/PostList";

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
  const featured = posts[0] ?? null;
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  return (
    <div>
      {/* Hero */}
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
        <>
          {/* Stats bar */}
          <div style={{
            display: "flex", gap: "1.5rem", marginBottom: "2.5rem",
            fontSize: "0.8rem", color: "var(--text-faint)"
          }}>
            <span>
              <span style={{ color: "var(--accent-purple)", fontWeight: 700, fontSize: "1rem" }}>
                {posts.length}
              </span>
              &nbsp;개의 글
            </span>
            <span>
              <span style={{ color: "var(--accent-blue)", fontWeight: 700, fontSize: "1rem" }}>
                {allTags.length}
              </span>
              &nbsp;개의 태그
            </span>
          </div>

          {/* Featured post */}
          {featured && (
            <div style={{ marginBottom: "2.5rem" }}>
              <p style={{
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em",
                color: "var(--accent-yellow)", textTransform: "uppercase",
                marginBottom: "0.75rem"
              }}>
                ✦ 최신 글
              </p>
              <a href={`/blog/${featured.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "14px", padding: "1.5rem 1.75rem",
                  position: "relative", overflow: "hidden",
                  transition: "border-color 0.15s, background 0.15s"
                }}
                  className="featured-card"
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, #fbbf24, #f472b6, #a78bfa)"
                  }} />
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
                    {featured.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: "0.7rem", fontWeight: 600,
                        padding: "0.15rem 0.5rem", borderRadius: "999px",
                        color: tagColor(tag),
                        background: tagColor(tag) + "18",
                        border: `1px solid ${tagColor(tag)}30`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 style={{
                    fontSize: "1.15rem", fontWeight: 700, color: "var(--text)",
                    lineHeight: 1.4, letterSpacing: "-0.02em", marginBottom: "0.75rem"
                  }}>
                    {featured.title}
                  </h2>
                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "var(--text-faint)" }}>
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.readingTime}분 읽기</span>
                  </div>
                </div>
              </a>
            </div>
          )}

          {/* Currently working on */}
          <div style={{ marginBottom: "2.5rem" }}>
            <p style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em",
              color: "var(--accent-blue)", textTransform: "uppercase",
              marginBottom: "0.875rem"
            }}>
              ⟳ 요즘 하고 있는 것들
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {currentItems.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "10px", fontSize: "0.85rem"
                }}>
                  <span style={{ fontSize: "1rem" }}>{item.emoji}</span>
                  <div>
                    <span style={{ color: "var(--text)", fontWeight: 600 }}>{item.title}</span>
                    <span style={{ color: "var(--text-faint)", marginLeft: "0.5rem" }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All posts with tag filter */}
          <div>
            <p style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em",
              color: "var(--text-faint)", textTransform: "uppercase",
              marginBottom: "1rem"
            }}>
              모든 글
            </p>
            <PostList posts={posts} />
          </div>
        </>
      )}
    </div>
  );
}
