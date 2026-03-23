import { getAllPosts } from "../../lib/posts";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import PostList from "./PostList";

export default async function AdminPage() {
  const posts = await getAllPosts();

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
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
        marginBottom: 20,
      }}>
        + 새 글 쓰기
      </Link>

      {/* 필터 + 글 목록 (client component) */}
      <PostList initialPosts={posts} />
    </div>
  );
}
