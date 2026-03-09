import { getAllPosts } from "../../lib/posts";

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

export default function TagsPage() {
  const posts = getAllPosts();

  const tagMap: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      tagMap[tag] = (tagMap[tag] ?? 0) + 1;
    }
  }

  const tags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", paddingTop: "2rem" }}>
      <p style={{
        fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.12em",
        color: "var(--accent-purple)", textTransform: "uppercase", marginBottom: "0.75rem"
      }}>
        Tags
      </p>
      <h1 style={{
        fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em",
        marginBottom: "2.5rem",
        background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
      }}>
        태그 목록
      </h1>

      {tags.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>아직 태그가 없어요.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {tags.map(([tag, count]) => (
            <a key={tag} href={`/tags/${tag}`} style={{
              textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1rem", borderRadius: "999px",
              border: `1px solid ${tagColor(tag)}30`,
              background: `${tagColor(tag)}10`,
              transition: "background 0.15s"
            }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: tagColor(tag) }}>
                #{tag}
              </span>
              <span style={{
                fontSize: "0.7rem", color: "var(--text-faint)",
                background: "var(--bg-card)", padding: "0.1rem 0.4rem",
                borderRadius: "999px"
              }}>
                {count}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
