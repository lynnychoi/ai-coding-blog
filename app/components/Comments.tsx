"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: number;
  name: string;
  content: string;
  createdAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/comments/${slug}`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했어요.");
      } else {
        setComments((prev) => [...prev, data]);
        setName("");
        setContent("");
        setSuccess(true);
      }
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
      <h3 style={{
        fontSize: "0.9rem", fontWeight: 700, color: "var(--text)",
        marginBottom: "1.5rem", letterSpacing: "-0.01em"
      }}>
        댓글 {comments.length > 0 ? `(${comments.length})` : ""}
      </h3>

      {/* Comment list */}
      {comments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          {comments.map((c) => (
            <div key={c.id} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "10px", padding: "1rem 1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "var(--accent-purple)" }}>
                  {c.name}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input
          type="text"
          placeholder="이름 (닉네임도 OK)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "0.625rem 0.875rem",
            color: "var(--text)", fontSize: "0.875rem",
            outline: "none", width: "100%",
            fontFamily: "inherit",
          }}
        />
        <textarea
          placeholder="댓글을 남겨주세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          required
          rows={4}
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "0.625rem 0.875rem",
            color: "var(--text)", fontSize: "0.875rem",
            outline: "none", width: "100%", resize: "vertical",
            fontFamily: "inherit", lineHeight: 1.6,
          }}
        />
        {error && (
          <p style={{ fontSize: "0.8rem", color: "#f87171", margin: 0 }}>{error}</p>
        )}
        {success && (
          <p style={{ fontSize: "0.8rem", color: "#34d399", margin: 0 }}>댓글이 등록됐어요 ✓</p>
        )}
        <div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)",
              color: "var(--accent-purple)", borderRadius: "8px",
              padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {loading ? "등록 중..." : "댓글 남기기"}
          </button>
        </div>
      </form>
    </div>
  );
}
