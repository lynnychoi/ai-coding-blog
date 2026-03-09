import { getAllPosts } from "../../lib/posts";

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
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: "3rem" }}>
      <p style={{
        fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em",
        color: "var(--text-3)", textTransform: "uppercase",
        fontFamily: "'Fira Code', monospace", marginBottom: "1.25rem"
      }}>
        Tags
      </p>
      <h1 style={{
        fontSize: "clamp(1.75rem, 5vw, 2.5rem)", fontWeight: 800,
        letterSpacing: "-0.04em", marginBottom: "3rem",
        color: "var(--text)"
      }}>
        태그 목록
      </h1>

      {tags.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>아직 태그가 없어요.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {tags.map(([tag, count]) => (
            <a key={tag} href={`/tags/${tag}`} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.875rem 0",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
              className="tag-row"
            >
              <span style={{
                fontSize: "0.9rem", fontWeight: 600,
                color: "var(--text-2)", letterSpacing: "-0.01em",
                transition: "color 0.15s"
              }}
                className="tag-row-name"
              >
                {tag}
              </span>
              <span style={{
                fontSize: "0.72rem", color: "var(--text-3)",
                fontFamily: "'Fira Code', monospace"
              }}>
                {count} post{count !== 1 ? "s" : ""}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
