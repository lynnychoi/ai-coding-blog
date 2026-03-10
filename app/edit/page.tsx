"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type PostItem = { slug: string; title: string; date: string; type: string };
type ImageEntry = { file: File; desc: string; preview: string };
type Status = "idle" | "loading-list" | "loading-edit" | "done" | "error";

export default function EditPage() {
  const [password, setPassword] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") || "" : ""
  );
  const [showPw, setShowPw] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selected, setSelected] = useState<PostItem | null>(null);
  const [currentMd, setCurrentMd] = useState("");
  const [instructions, setInstructions] = useState("");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resultSlug, setResultSlug] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPosts = async () => {
    setStatus("loading-list");
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    } finally {
      setStatus("idle");
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const selectPost = async (post: PostItem) => {
    setSelected(post);
    setStatus("loading-edit");
    setInstructions("");
    setImages([]);
    try {
      const res = await fetch(`/api/edit/${post.slug}`);
      const data = await res.json();
      setCurrentMd(data.markdown || "");
    } finally {
      setStatus("idle");
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      setImages((prev) => [...prev, { file, desc: "", preview: URL.createObjectURL(file) }]);
    });
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!selected || !instructions.trim()) return;
    sessionStorage.setItem("admin_pw", password);
    setStatus("loading-edit");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("password", password);
    fd.append("instructions", instructions);
    images.forEach((img, i) => {
      fd.append(`image_${i}_file`, img.file);
      fd.append(`image_${i}_desc`, img.desc);
    });

    try {
      const res = await fetch(`/api/edit/${selected.slug}`, { method: "PUT", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "뭔가 잘못됐어");
        setStatus("error");
        return;
      }
      setResultSlug(data.slug);
      setStatus("done");
    } catch {
      setErrorMsg("네트워크 오류");
      setStatus("error");
    }
  };

  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e8f0",
      padding: "24px 20px 60px",
      maxWidth: 600,
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 28,
    },
    title: { fontSize: 18, fontWeight: 600, color: "#c4b8f8" },
    writeLink: { fontSize: 13, color: "#888", textDecoration: "none" },
    label: { fontSize: 13, color: "#888", marginBottom: 6, display: "block" },
    input: {
      width: "100%",
      background: "#13131e",
      border: "1px solid #2a2a3e",
      borderRadius: 10,
      color: "#e8e8f0",
      fontSize: 16,
      padding: "12px 14px",
      outline: "none",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      background: "#13131e",
      border: "1px solid #2a2a3e",
      borderRadius: 10,
      color: "#e8e8f0",
      fontSize: 16,
      padding: "14px",
      outline: "none",
      resize: "vertical",
      minHeight: 120,
      lineHeight: 1.6,
      boxSizing: "border-box",
    },
    previewBox: {
      background: "#13131e",
      border: "1px solid #2a2a3e",
      borderRadius: 10,
      padding: "12px 14px",
      fontSize: 12,
      color: "#666",
      fontFamily: "monospace",
      maxHeight: 120,
      overflow: "hidden",
      marginBottom: 16,
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
    },
    postItem: (active: boolean): React.CSSProperties => ({
      padding: "12px 14px",
      borderRadius: 10,
      border: active ? "1.5px solid #c4b8f8" : "1px solid #2a2a3e",
      background: active ? "rgba(196,184,248,0.06)" : "#13131e",
      cursor: "pointer",
      marginBottom: 8,
    }),
    postTitle: { fontSize: 14, fontWeight: 500, marginBottom: 3 },
    postMeta: { fontSize: 12, color: "#555" },
    section: { marginBottom: 20 },
    pwWrap: { position: "relative", marginBottom: 22 },
    pwToggle: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: "#888",
      cursor: "pointer",
      fontSize: 16,
    },
    imageRow: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      background: "#13131e",
      borderRadius: 10,
      padding: "10px 12px",
      marginBottom: 8,
    },
    imageThumb: { width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 },
    removeBtn: {
      background: "none",
      border: "none",
      color: "#555",
      fontSize: 18,
      cursor: "pointer",
      marginLeft: "auto",
    },
    addImageBtn: {
      width: "100%",
      padding: "10px 0",
      borderRadius: 10,
      border: "1.5px dashed #2a2a3e",
      background: "transparent",
      color: "#666",
      fontSize: 14,
      cursor: "pointer",
    },
    submitBtn: {
      width: "100%",
      padding: "15px 0",
      borderRadius: 12,
      background: status === "loading-edit" ? "#2a2a3e" : "#c4b8f8",
      color: status === "loading-edit" ? "#888" : "#0a0a0f",
      fontSize: 16,
      fontWeight: 700,
      border: "none",
      cursor: status === "loading-edit" ? "not-allowed" : "pointer",
      marginTop: 8,
    },
    backBtn: {
      background: "none",
      border: "none",
      color: "#888",
      cursor: "pointer",
      fontSize: 13,
      padding: 0,
      marginBottom: 20,
    },
    doneBox: { textAlign: "center", padding: "40px 20px" },
    doneLink: {
      display: "inline-block",
      marginTop: 16,
      padding: "12px 24px",
      background: "#c4b8f8",
      color: "#0a0a0f",
      borderRadius: 10,
      textDecoration: "none",
      fontWeight: 600,
    },
    errorBox: {
      background: "rgba(255,80,80,0.1)",
      border: "1px solid rgba(255,80,80,0.3)",
      borderRadius: 10,
      padding: "12px 14px",
      color: "#ff8080",
      fontSize: 14,
      marginBottom: 16,
    },
    descInput: {
      flex: 1,
      background: "transparent",
      border: "none",
      color: "#aaa",
      fontSize: 13,
      outline: "none",
    },
  };

  if (status === "done") {
    return (
      <div style={s.page}>
        <div style={s.doneBox}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>✓ 수정됐어 🎉</div>
          <p style={{ color: "#888", fontSize: 14 }}>배포까지 1-2분.</p>
          <Link href={`/blog/${resultSlug}`} style={s.doneLink}>
            블로그에서 보기
          </Link>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => { setStatus("idle"); setSelected(null); }}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14 }}
            >
              다른 글 수정
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.title}>글 수정</span>
        <Link href="/write" style={s.writeLink}>새 글 쓰기 →</Link>
      </div>

      {/* Password */}
      <div style={s.pwWrap}>
        <label style={s.label}>비밀번호</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={s.input}
            placeholder="••••••"
          />
          <button style={s.pwToggle} onClick={() => setShowPw(!showPw)} type="button">
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      {!selected ? (
        /* Post list */
        <div>
          <label style={s.label}>수정할 글 선택</label>
          {status === "loading-list" ? (
            <p style={{ color: "#555", fontSize: 14 }}>불러오는 중...</p>
          ) : (
            posts.map((post) => (
              <div key={post.slug} style={s.postItem(false)} onClick={() => selectPost(post)}>
                <div style={s.postTitle}>{post.title}</div>
                <div style={s.postMeta}>{post.date} · {post.type}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Edit form */
        <div>
          <button style={s.backBtn} onClick={() => setSelected(null)}>
            ← 목록으로
          </button>

          <div style={{ ...s.postItem(true), marginBottom: 20 }}>
            <div style={s.postTitle}>{selected.title}</div>
            <div style={s.postMeta}>{selected.date}</div>
          </div>

          {/* Current content preview */}
          {status === "loading-edit" ? (
            <p style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>현재 글 불러오는 중...</p>
          ) : currentMd ? (
            <div>
              <label style={s.label}>현재 글 (미리보기)</label>
              <div style={s.previewBox}>{currentMd.substring(0, 300)}...</div>
            </div>
          ) : null}

          {/* Edit instructions */}
          <div style={s.section}>
            <label style={s.label}>어떻게 수정할까? (자유롭게 적어줘)</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              style={s.textarea}
              placeholder={`- 마지막에 오늘의 레슨런 섹션 추가해줘\n- 세번째 단락을 더 상세하게\n- 제목 좀 더 임팩트 있게`}
            />
          </div>

          {/* Images */}
          <div style={s.section}>
            <label style={s.label}>이미지 추가 (선택)</label>
            {images.map((img, i) => (
              <div key={i} style={s.imageRow}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" style={s.imageThumb} />
                <input
                  type="text"
                  value={img.desc}
                  onChange={(e) =>
                    setImages((prev) =>
                      prev.map((item, j) => (j === i ? { ...item, desc: e.target.value } : item))
                    )
                  }
                  style={s.descInput}
                  placeholder="이 이미지는... (선택)"
                />
                <button style={s.removeBtn} onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}>
                  ✕
                </button>
              </div>
            ))}
            <button style={s.addImageBtn} onClick={() => fileInputRef.current?.click()}>
              + 이미지 추가
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleAddImage}
            />
          </div>

          {status === "error" && <div style={s.errorBox}>{errorMsg}</div>}

          <button
            style={s.submitBtn}
            onClick={handleSubmit}
            disabled={status === "loading-edit" || !instructions.trim()}
          >
            {status === "loading-edit" ? "Claude가 수정 중... ✍️" : "수정해줘 →"}
          </button>
        </div>
      )}
    </div>
  );
}
