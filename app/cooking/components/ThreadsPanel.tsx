"use client";

import { useState, useEffect } from "react";
import { COLORS, COMMON } from "../styles";

const S = COMMON;

type Props = { title: string; body: string; tags: string; slug?: string };

export default function ThreadsPanel({ title, body, tags, slug }: Props) {
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(!!slug);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  // 마운트 시 저장된 변환 결과 불러오기
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/admin/threads-cache/${slug}`)
      .then(r => r.json())
      .then((d: { posts?: string[] | null }) => {
        if (d.posts) setPosts(d.posts);
      })
      .catch(() => {})
      .finally(() => setCacheLoading(false));
  }, [slug]);

  const saveCache = async (newPosts: string[]) => {
    if (!slug) return;
    try {
      await fetch(`/api/admin/threads-cache/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: newPosts }),
      });
    } catch {}
  };

  const convert = async () => {
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/threads-convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tags }),
      });
      const data = await res.json() as { posts?: string[]; error?: string };
      if (!res.ok || data.error) { setError(data.error || "변환 실패"); return; }
      const newPosts = data.posts ?? [];
      setPosts(newPosts);
      saveCache(newPosts);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  const copyPost = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(posts.join("\n\n---\n\n"));
    setCopied(-1);
    setTimeout(() => setCopied(null), 2000);
  };

  if (cacheLoading) {
    return (
      <div style={{ padding: "14px 16px", color: "#555", fontSize: 13 }}>
        저장된 변환 결과 확인 중...
      </div>
    );
  }

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 12, lineHeight: 1.6 }}>
        블로그 글을 Threads 연속 포스트로 변환해줘. 각 포스트 복사해서 Threads에 직접 붙여넣기.
      </div>

      <button
        style={{
          ...S.primaryBtn,
          width: "100%",
          opacity: loading || !body.trim() ? 0.5 : 1,
          marginBottom: posts.length ? 16 : 0,
        }}
        onClick={convert}
        disabled={loading || !body.trim()}
      >
        {loading ? "변환 중... ✍️" : posts.length ? "🔄 다시 변환하기" : "🧵 스레드로 변환하기"}
      </button>

      {error && <div style={{ ...S.errorBox, marginTop: 8 }}>{error}</div>}

      {posts.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#888" }}>{posts.length}개 포스트</span>
            <button
              style={{ ...S.smallBtn, color: copied === -1 ? COLORS.success : undefined }}
              onClick={copyAll}
            >
              {copied === -1 ? "전체 복사됨 ✓" : "전체 복사"}
            </button>
          </div>

          {posts.map((post, i) => (
            <div key={i} style={{
              background: "#0e0e18",
              border: `1px solid ${COLORS.borderCard}`,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>{i + 1} / {posts.length}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: post.length > 460 ? "#f87171" : "#555" }}>
                    {post.length}자
                  </span>
                  <button
                    style={{
                      ...S.smallBtn,
                      color: copied === i ? COLORS.success : undefined,
                      borderColor: copied === i ? COLORS.success : undefined,
                    }}
                    onClick={() => copyPost(post, i)}
                  >
                    {copied === i ? "복사됨 ✓" : "복사"}
                  </button>
                </div>
              </div>
              <textarea
                value={post}
                onChange={e => setPosts(prev => prev.map((p, j) => j === i ? e.target.value : p))}
                style={{
                  ...S.textarea,
                  minHeight: 100,
                  fontSize: 13,
                  lineHeight: 1.7,
                  resize: "vertical" as const,
                  fontFamily: "inherit",
                }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
