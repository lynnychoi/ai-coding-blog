import { getAllPosts } from "../../lib/posts";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminPage() {
  const posts = getAllPosts();
  const devPosts = posts.filter((p) => p.type === "dev");
  const writingPosts = posts.filter((p) => p.type !== "dev");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e8f0",
      padding: "28px 20px 60px",
      maxWidth: 640,
      margin: "0 auto",
    }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#a8f0d8" }}>🍳 Kitchen</div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>글 {posts.length}개</div>
        </div>
        <LogoutButton />
      </div>

      {/* 새 글 쓰기 버튼 */}
      <Link href="/cooking/write" style={{
        display: "block",
        textAlign: "center",
        padding: "14px",
        borderRadius: 12,
        background: "#a8f0d8",
        color: "#0a0a0f",
        fontWeight: 700,
        fontSize: 15,
        textDecoration: "none",
        marginBottom: 32,
      }}>
        + 새 글 쓰기
      </Link>

      {/* Dev 글 목록 */}
      <Section title="Dev" posts={devPosts} />
      <Section title="Writing" posts={writingPosts} />
    </div>
  );
}

function Section({ title, posts }: { title: string; posts: ReturnType<typeof getAllPosts> }) {
  if (posts.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {title} ({posts.length})
      </div>
      {posts.map((post) => (
        <div key={post.slug} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid #1a1a2e",
          background: "#0d0d18",
          marginBottom: 8,
          gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {post.title}
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>{post.date}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Link href={`/blog/${post.slug}`} target="_blank" style={{
              padding: "6px 12px", borderRadius: 6,
              border: "1px solid #2a2a3e", color: "#888",
              fontSize: 12, textDecoration: "none",
            }}>
              보기
            </Link>
            <Link href={`/cooking/edit/${post.slug}`} style={{
              padding: "6px 12px", borderRadius: 6,
              background: "#1e1e38", color: "#c4b8f8",
              fontSize: 12, textDecoration: "none",
              border: "1px solid #2a2a3e",
            }}>
              수정
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
