"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type ImageEntry = { file: File; desc: string; preview: string };
type Status = "idle" | "loading" | "done" | "error";

export default function AdminWritePage() {
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<"dev" | "writing">("dev");
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [resultSlug, setResultSlug] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((file) => {
      setImages((prev) => [...prev, { file, desc: "", preview: URL.createObjectURL(file) }]);
    });
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    setStatus("loading");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("notes", notes);
    fd.append("tags", tags);
    fd.append("type", type);
    fd.append("date", date);
    fd.append("_admin", "1"); // cookie auth 사용 표시
    images.forEach((img, i) => {
      fd.append(`image_${i}_file`, img.file);
      fd.append(`image_${i}_desc`, img.desc);
    });

    try {
      const res = await fetch("/api/write", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "뭔가 잘못됐어"); setStatus("error"); return; }
      setResultSlug(data.slug);
      setStatus("done");
      setNotes(""); setTags(""); setImages([]);
    } catch {
      setErrorMsg("네트워크 오류");
      setStatus("error");
    }
  };

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", padding: "24px 20px 60px", maxWidth: 600, margin: "0 auto" },
    back: { fontSize: 13, color: "#555", textDecoration: "none", display: "inline-block", marginBottom: 24 },
    title: { fontSize: 18, fontWeight: 600, color: "#a8f0d8", marginBottom: 28 },
    label: { fontSize: 13, color: "#888", marginBottom: 6, display: "block" },
    input: { width: "100%", background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 10, color: "#e8e8f0", fontSize: 16, padding: "12px 14px", outline: "none", boxSizing: "border-box" as const },
    textarea: { width: "100%", background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 10, color: "#e8e8f0", fontSize: 16, padding: "14px", outline: "none", resize: "vertical" as const, minHeight: 180, lineHeight: 1.6, boxSizing: "border-box" as const },
    section: { marginBottom: 22 },
    imageRow: { display: "flex", gap: 10, alignItems: "center", background: "#13131e", borderRadius: 10, padding: "10px 12px", marginBottom: 8 },
    submitBtn: { width: "100%", padding: "15px 0", borderRadius: 12, background: status === "loading" ? "#2a2a3e" : "#a8f0d8", color: status === "loading" ? "#888" : "#0a0a0f", fontSize: 16, fontWeight: 700, border: "none", cursor: status === "loading" ? "not-allowed" as const : "pointer" as const, marginTop: 8 },
    errorBox: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 10, padding: "12px 14px", color: "#ff8080", fontSize: 14, marginBottom: 16 },
  };

  if (status === "done") {
    return (
      <div style={s.page}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>✓ 올라갔어 🎉</div>
          <p style={{ color: "#888", fontSize: 14 }}>배포까지 1-2분.</p>
          <Link href={`/blog/${resultSlug}`} style={{ display: "inline-block", marginTop: 16, padding: "12px 24px", background: "#a8f0d8", color: "#0a0a0f", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>블로그에서 보기</Link>
          <div style={{ marginTop: 12 }}>
            <Link href="/admin" style={{ color: "#555", fontSize: 13 }}>← 대시보드</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Link href="/admin" style={s.back}>← 대시보드</Link>
      <div style={s.title}>새 글 쓰기</div>

      <div style={s.section}>
        <label style={s.label}>오늘 뭐 했어? 키워드나 메모로 적어줘</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={s.textarea}
          placeholder={"- 히어로 섹션 만들었음\n- 오로라 블롭 3개\n- 모바일에서 안 보이는 버그 고침"} />
      </div>

      <div style={s.section}>
        <label style={s.label}>날짜</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...s.input, colorScheme: "dark" }} />
      </div>

      <div style={s.section}>
        <label style={s.label}>태그 (쉼표로 구분)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} style={s.input} placeholder="next.js, css, 실수" />
      </div>

      <div style={s.section}>
        <label style={s.label}>타입</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["dev", "writing"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: type === t ? "1.5px solid #a8f0d8" : "1.5px solid #2a2a3e", background: type === t ? "rgba(168,240,216,0.08)" : "transparent", color: type === t ? "#a8f0d8" : "#666", fontSize: 14, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={s.section}>
        <label style={s.label}>이미지 (선택)</label>
        {images.map((img, i) => (
          <div key={i} style={s.imageRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.preview} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
            <input type="text" value={img.desc} onChange={(e) => setImages((prev) => prev.map((item, j) => j === i ? { ...item, desc: e.target.value } : item))} style={{ flex: 1, background: "transparent", border: "none", color: "#aaa", fontSize: 13, outline: "none" }} placeholder="이 이미지는..." />
            <button onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <button onClick={() => fileInputRef.current?.click()} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "1.5px dashed #2a2a3e", background: "transparent", color: "#666", fontSize: 14, cursor: "pointer" }}>+ 이미지 추가</button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAddImage} />
      </div>

      {status === "error" && <div style={s.errorBox}>{errorMsg}</div>}
      <button style={s.submitBtn} onClick={handleSubmit} disabled={status === "loading" || !notes.trim()}>
        {status === "loading" ? "Claude가 글 쓰는 중... ✍️" : "Claude한테 올려줘 →"}
      </button>
    </div>
  );
}
