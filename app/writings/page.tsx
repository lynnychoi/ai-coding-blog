import { getAllPosts } from "../../lib/posts";

const categoryLabel: Record<string, string> = {
  diary: "일기",
  essay: "에세이",
  note: "메모",
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDiaryDate(dateStr: string) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = DAYS[d.getDay()];
  return { short: `${mm}.${dd}`, day };
}

export default function WritingsPage() {
  const posts = getAllPosts().filter((p) => p.type === "writing");

  return (
    <div className="writings-page" style={{ maxWidth: 680, margin: "0 auto", paddingTop: "3rem" }}>
      <p className="section-label">Writing</p>
      <h1 style={{
        fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        marginBottom: "0.5rem",
        color: "var(--text)",
      }}>
        글
      </h1>
      <p style={{
        fontSize: "0.85rem",
        color: "var(--text-3)",
        fontFamily: "'Fira Code', monospace",
        marginBottom: "3.5rem",
      }}>
        개발 말고, 그냥 쓰고 싶어서 쓴 것들.
      </p>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>아직 글이 없어요.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {posts.map((post) => {
            const { short, day } = formatDiaryDate(post.date);
            return (
              <a key={post.slug} href={`/blog/${post.slug}`} className="diary-card">
                <div className="diary-card-header">
                  <span className="diary-card-date">{short}</span>
                  <span className="diary-card-day">{day}요일</span>
                  {post.category && (
                    <span className="diary-card-category">
                      {categoryLabel[post.category] ?? post.category}
                    </span>
                  )}
                </div>
                <h2 className="diary-card-title">{post.title}</h2>
                {post.excerpt && (
                  <p className="diary-card-excerpt">{post.excerpt}</p>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
