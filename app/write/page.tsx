"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type ImageEntry = { file: File; desc: string; preview: string };
type Status = "idle" | "loading" | "done" | "error";

export default function WritePage() {
  const [password, setPassword] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") || "" : ""
  );
  const [showPw, setShowPw] = useState(false);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<"dev" | "writing">("dev");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [resultSlug, setResultSlug] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { file, desc: "", preview }]);
    });
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    sessionStorage.setItem("admin_pw", password);

    setStatus("loading");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("password", password);
    fd.append("notes", notes);
    fd.append("tags", tags);
    fd.append("type", type);
    images.forEach((img, i) => {
      fd.append(`image_${i}_file`, img.file);
      fd.append(`image_${i}_desc`, img.desc);
    });

    try {
      const res = await fetch("/api/write", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "뭔가 잘못됐어");
        setStatus("error");
        return;
      }
      setResultSlug(data.slug);
      setStatus("done");
      setNotes("");
      setTags("");
      setImages([]);
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
      fontFamily: "inherit",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 32,
    },
    title: { fontSize: 18, fontWeight: 600, color: "#a8f0d8" },
    editLink: { fontSize: 13, color: "#888", textDecoration: "none" },
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
      minHeight: 180,
      lineHeight: 1.6,
      boxSizing: "border-box",
    },
    section: { marginBottom: 22 },
    row: { display: "flex", gap: 8, alignItems: "center" },
    pwWrap: { position: "relative" },
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
    typeBtn: (active: boolean): React.CSSProperties => ({
      flex: 1,
      padding: "10px 0",
      borderRadius: 8,
      border: active ? "1.5px solid #a8f0d8" : "1.5px solid #2a2a3e",
      background: active ? "rgba(168,240,216,0.08)" : "transparent",
      color: active ? "#a8f0d8" : "#666",
      fontSize: 14,
      cursor: "pointer",
    }),
    imageThumb: {
      width: 64,
      height: 64,
      objectFit: "cover",
      borderRadius: 8,
      flexShrink: 0,
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
    removeBtn: {
      background: "none",
      border: "none",
      color: "#555",
      fontSize: 18,
      cursor: "pointer",
      padding: 0,
      marginLeft: "auto",
    },
    addImageBtn: {
      width: "100%",
      padding: "11px 0",
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
      background: status === "loading" ? "#2a2a3e" : "#a8f0d8",
      color: status === "loading" ? "#888" : "#0a0a0f",
      fontSize: 16,
      fontWeight: 700,
      border: "none",
      cursor: status === "loading" ? "not-allowed" : "pointer",
      marginTop: 8,
    },
    doneBox: {
      textAlign: "center",
      padding: "40px 20px",
    },
    doneTitle: { fontSize: 22, marginBottom: 8 },
    doneLink: {
      display: "inline-block",
      marginTop: 16,
      padding: "12px 24px",
      background: "#a8f0d8",
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
      placeholder: "#555",
    },
  };

  if (status === "done") {
    return (
      <div style={s.page}>
        <div style={s.doneBox}>
          <div style={s.doneTitle}>✓ 올라갔어 🎉</div>
          <p style={{ color: "#888", fontSize: 14 }}>
            Claude가 쓴 글이 GitHub에 커밋됐어. 배포까지 1-2분.
          </p>
          <Link href={`/blog/${resultSlug}`} style={s.doneLink}>
            블로그에서 보기
          </Link>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => setStatus("idle")}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14 }}
            >
              또 쓰기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.title}>새 글 쓰기</span>
        <Link href="/edit" style={s.editLink}>기존 글 수정 →</Link>
      </div>

      {/* Password */}
      <div style={s.section}>
        <label style={s.label}>비밀번호</label>
        <div style={s.pwWrap}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={s.input}
            placeholder="••••••"
            autoComplete="current-password"
          />
          <button style={s.pwToggle} onClick={() => setShowPw(!showPw)} type="button">
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div style={s.section}>
        <label style={s.label}>오늘 뭐 했어? 키워드나 메모로 적어줘</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={s.textarea}
          placeholder={`- 히어로 섹션 만들었음\n- 오로라 블롭 3개\n- 모바일에서 안 보이는 버그 고침\n- CSS full-bleed로 해결`}
        />
      </div>

      {/* Tags */}
      <div style={s.section}>
        <label style={s.label}>태그 (쉼표로 구분)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={s.input}
          placeholder="next.js, css, 실수"
        />
      </div>

      {/* Type */}
      <div style={s.section}>
        <label style={s.label}>타입</label>
        <div style={s.row}>
          <button style={s.typeBtn(type === "dev")} onClick={() => setType("dev")}>
            dev
          </button>
          <button style={s.typeBtn(type === "writing")} onClick={() => setType("writing")}>
            writing
          </button>
        </div>
      </div>

      {/* Images */}
      <div style={s.section}>
        <label style={s.label}>이미지 (선택)</label>
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
            <button
              style={s.removeBtn}
              onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
            >
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

      {/* Error */}
      {status === "error" && <div style={s.errorBox}>{errorMsg}</div>}

      {/* Submit */}
      <button
        style={s.submitBtn}
        onClick={handleSubmit}
        disabled={status === "loading" || !notes.trim()}
      >
        {status === "loading" ? "Claude가 글 쓰는 중... ✍️" : "Claude한테 올려줘 →"}
      </button>
    </div>
  );
}
