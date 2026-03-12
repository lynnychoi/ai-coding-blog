"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type ImageEntry = { file: File; desc: string; preview: string };
type Status = "idle" | "loading" | "done" | "error";

const S: Record<string, React.CSSProperties> = {
  page:     { minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", padding: "0 0 80px" },
  top:      { position: "sticky", top: 0, zIndex: 30, background: "#0a0a0f", borderBottom: "1px solid #1a1a2e", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 },
  back:     { fontSize: 13, color: "#555", textDecoration: "none" },
  topTitle: { fontSize: 14, fontWeight: 600, color: "#e8e8f0", flex: 1 },
  section:  { padding: "14px 16px", borderBottom: "1px solid #1a1a2e" },
  label:    { fontSize: 11, color: "#555", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 1 } as React.CSSProperties,
  labelSub: { fontSize: 11, color: "#3a3a5a", marginBottom: 8, display: "block" },
  input:    { width: "100%", background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e8e8f0", fontSize: 15, padding: "10px 12px", outline: "none", boxSizing: "border-box" } as React.CSSProperties,
  textarea: { width: "100%", background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e8e8f0", fontSize: 14, padding: "12px", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" } as React.CSSProperties,
  promptTA: { width: "100%", background: "#0e0e1a", border: "1px dashed #2a2a4a", borderRadius: 8, color: "#9090c0", fontSize: 14, padding: "12px", outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" } as React.CSSProperties,
  imageRow: { display: "flex", gap: 10, alignItems: "center", background: "#13131e", borderRadius: 8, padding: "10px 12px", marginBottom: 8 },
  smallBtn: { padding: "7px 14px", borderRadius: 8, border: "1.5px solid #2a2a3e", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" },
  errorBox: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 8, padding: "10px 12px", color: "#ff8080", fontSize: 13, margin: "0 16px 12px" },
};

function submitBtnStyle(status: Status): React.CSSProperties {
  return {
    width: "calc(100% - 32px)", margin: "16px 16px 0", display: "block",
    padding: "15px 0", borderRadius: 12,
    background: status === "loading" ? "#2a2a3e" : "#c4b8f8",
    color: status === "loading" ? "#888" : "#0a0a0f",
    fontSize: 16, fontWeight: 700, border: "none",
    cursor: status === "loading" ? "not-allowed" : "pointer",
  };
}

export default function AdminWritePage() {
  const [notes, setNotes]   = useState("");
  const [prompt, setPrompt] = useState("");
  const [tags, setTags]     = useState("");
  const [type, setType]     = useState<"dev" | "writing">("dev");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [resultSlug, setResultSlug] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) =>
      setImages((prev) => [...prev, { file, desc: "", preview: URL.createObjectURL(file) }])
    );
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    const fd = new FormData();
    fd.append("notes", notes);
    fd.append("prompt", prompt);
    fd.append("tags", tags);
    fd.append("type", type);
    fd.append("_admin", "1");
    images.forEach((img, i) => {
      fd.append(`image_${i}_file`, img.file);
      fd.append(`image_${i}_desc`, img.desc);
    });
    try {
      const res  = await fetch("/api/write", { method: "POST", body: fd });
      const data = await res.json() as { slug?: string; error?: string };
      if (!res.ok) { setErrorMsg(data.error || "뭔가 잘못됐어"); setStatus("error"); return; }
      setResultSlug(data.slug ?? "");
      setStatus("done");
      setNotes(""); setPrompt(""); setTags(""); setImages([]);
    } catch {
      setErrorMsg("네트워크 오류"); setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div style={S.page}>
        <div style={S.top}>
          <Link href="/cooking" style={S.back}>← 대시보드</Link>
          <span style={S.topTitle}>새 글 쓰기</span>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>✓ 올라갔어 🎉</div>
          <p style={{ color: "#888", fontSize: 14 }}>배포까지 1-2분.</p>
          <Link href={`/blog/${resultSlug}`} style={{ display: "inline-block", marginTop: 16, padding: "12px 24px", background: "#c4b8f8", color: "#0a0a0f", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
            블로그에서 보기
          </Link>
          <div style={{ marginTop: 14, display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/cooking/write" style={{ color: "#c4b8f8", fontSize: 13 }}>+ 또 쓰기</Link>
            <Link href="/cooking" style={{ color: "#555", fontSize: 13 }}>← 대시보드</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* 상단 바 */}
      <div style={S.top}>
        <Link href="/cooking" style={S.back}>← 대시보드</Link>
        <span style={S.topTitle}>새 글 쓰기</span>
      </div>

      {/* 재료 */}
      <div style={S.section}>
        <label style={S.label}>재료</label>
        <span style={S.labelSub}>오늘 뭐 했어? 키워드, 메모, 순서 상관없이 ✦ 저장돼서 나중에 편집 페이지에서 볼 수 있어</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...S.textarea, minHeight: 180 }}
          placeholder={"- 히어로 섹션 만들었음\n- 오로라 블롭 3개\n- 모바일에서 안 보이는 버그 고침\n- localtunnel 써봤는데 포트 충돌남\n- npm run dev --port 3001로 해결"}
        />
      </div>

      {/* Claude에게 */}
      <div style={S.section}>
        <label style={S.label}>Claude에게 <span style={{ color: "#3a3a5a", fontWeight: 400 }}>(선택)</span></label>
        <span style={S.labelSub}>특별히 강조하거나 빼고 싶은 것 ✦ 글 생성할 때만 쓰이고 저장 안 됨</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ ...S.promptTA, minHeight: 80 }}
          placeholder={"예) 버그 고친 과정을 중심으로 써줘\n예) 초보자 독자 배려해서 용어 설명 많이 넣어줘"}
        />
      </div>

      {/* 태그 */}
      <div style={S.section}>
        <label style={S.label}>태그 <span style={{ color: "#3a3a5a", fontWeight: 400 }}>(쉼표로 구분)</span></label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} style={S.input} placeholder="next.js, css, 실수" />
      </div>

      {/* 타입 */}
      <div style={S.section}>
        <label style={S.label}>타입</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["dev", "writing"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 14, cursor: "pointer",
              border: type === t ? "1.5px solid #c4b8f8" : "1.5px solid #2a2a3e",
              background: type === t ? "rgba(196,184,248,0.08)" : "transparent",
              color: type === t ? "#c4b8f8" : "#555",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* 이미지 */}
      <div style={S.section}>
        <label style={S.label}>이미지 <span style={{ color: "#3a3a5a", fontWeight: 400 }}>(선택)</span></label>
        {images.map((img, i) => (
          <div key={i} style={S.imageRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.preview} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
            <input
              type="text" value={img.desc}
              onChange={(e) => setImages((prev) => prev.map((item, j) => j === i ? { ...item, desc: e.target.value } : item))}
              style={{ flex: 1, background: "transparent", border: "none", color: "#aaa", fontSize: 13, outline: "none" }}
              placeholder="이 이미지는..."
            />
            <button onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <button onClick={() => fileInputRef.current?.click()} style={{ ...S.smallBtn, width: "100%" }}>+ 이미지 추가</button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAddImage} />
      </div>

      {status === "error" && <div style={S.errorBox}>{errorMsg}</div>}
      <button style={submitBtnStyle(status)} onClick={handleSubmit} disabled={status === "loading" || !notes.trim()}>
        {status === "loading" ? "Claude가 글 쓰는 중... ✍️" : "Claude한테 올려줘 →"}
      </button>
    </div>
  );
}
