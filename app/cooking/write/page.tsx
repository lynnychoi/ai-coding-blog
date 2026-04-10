"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLORS, COMMON } from "../styles";
import type { ImageEntry, Status, NoteItem } from "../types";
import TypeStatusRow from "../components/TypeStatusRow";
import TagsInput from "../components/TagsInput";
import ImageUploadList from "../components/ImageUploadList";

const S = { ...COMMON };

export default function WritePage() {
  const router = useRouter();
  const [notes, setNotes]     = useState("");
  const [prompt, setPrompt]   = useState("");
  const [tags, setTags]       = useState("");
  const [type, setType]       = useState<"dev" | "writing">("dev");
  const [postStatus, setPostStatus] = useState<"published" | "unpublished">("unpublished");
  const [date, setDate]       = useState(() => new Date().toISOString().substring(0, 10));
  const [images, setImages]   = useState<ImageEntry[]>([]);
  const [status, setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [noteList, setNoteList]           = useState<NoteItem[]>([]);
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [loadingNotes, setLoadingNotes]   = useState(false);
  const [preview, setPreview]             = useState<{ path: string; content: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchNoteList = async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch("/api/admin/scratch-notes");
      const data = await res.json() as { notes?: NoteItem[]; error?: string };
      setNoteList(data.notes ?? []);
    } catch {
      setNoteList([]);
    }
    setLoadingNotes(false);
  };

  const handleSelectNote = async (notePath: string) => {
    if (preview?.path === notePath) { setPreview(null); return; }
    setLoadingPreview(true);
    try {
      const res = await fetch(`/api/admin/scratch-notes?file=${encodeURIComponent(notePath)}`);
      const data = await res.json() as { content?: string };
      if (data.content) setPreview({ path: notePath, content: data.content });
    } catch { /* silent */ }
    setLoadingPreview(false);
  };

  const handleLoadNote = () => {
    if (!preview) return;
    setNotes(prev => prev ? prev + "\n\n---\n\n" + preview.content : preview.content);
    setPreview(null);
    setShowNotePanel(false);
  };

  useEffect(() => {
    if (showNotePanel && noteList.length === 0) fetchNoteList();
  }, [showNotePanel]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    setStatus("loading");
    setErrorMsg("");
    const fd = new FormData();
    fd.append("notes", notes);
    fd.append("prompt", prompt);
    fd.append("tags", tags);
    fd.append("type", type);
    fd.append("status", postStatus);
    fd.append("date", date);
    fd.append("_admin", "1");
    images.forEach((img, i) => {
      fd.append(`image_${i}_file`, img.file);
      fd.append(`image_${i}_desc`, img.desc);
    });
    try {
      const res = await fetch("/api/write", { method: "POST", body: fd });
      const text = await res.text();
      let data: { slug?: string; error?: string } = {};
      try { data = JSON.parse(text); } catch {
        setErrorMsg(`서버 오류 (${res.status}): ${text.substring(0, 200) || "(빈 응답)"}`); setStatus("error"); return;
      }
      if (!res.ok || !data.slug) { setErrorMsg(data.error || `서버 오류 (${res.status})`); setStatus("error"); return; }
      router.push(`/cooking/edit/${data.slug}?new=1`);
    } catch (e) {
      setErrorMsg(`연결 실패: ${e instanceof Error ? e.message : String(e)}`); setStatus("error");
    }
  };

  return (
    <div style={S.page}>
      <div style={S.top}>
        <Link href="/cooking" style={S.back}>← 대시보드</Link>
        <a href="/style-guide.html" target="_blank" style={{ fontSize: 11, color: "#555", textDecoration: "none", border: "1px solid #1c1c2a", borderRadius: 5, padding: "3px 8px" }}>📖 Style</a>
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, flex: 1 }}>새 글 쓰기</span>
      </div>

      {/* 재료 */}
      <div style={S.section}>
        <label style={S.label}>재료</label>
        <span style={{ fontSize: 11, color: "#3a3a5a", marginBottom: 8, display: "block" }}>
          오늘 뭐 했어? 키워드, 메모, 순서 상관없이 ✦ 저장돼서 나중에 편집 페이지에서 볼 수 있어
        </span>

        <div style={{ marginBottom: 8 }}>
          <button onClick={() => setShowNotePanel(v => !v)}
            style={{ ...S.smallBtn, fontSize: 11, color: "#6060a0", borderColor: "#2a2a4a" }}>
            {showNotePanel ? "▲ 닫기" : "📋 scratch-notes에서 불러오기"}
          </button>
        </div>

        {showNotePanel && (
          <div style={{ background: "#0e0e1a", border: "1px solid #2a2a4a", borderRadius: 8, padding: 10, marginBottom: 10 }}>
            {loadingNotes ? (
              <div style={{ color: "#555", fontSize: 12, textAlign: "center", padding: "12px 0" }}>불러오는 중...</div>
            ) : noteList.length === 0 ? (
              <div style={{ color: "#555", fontSize: 12, textAlign: "center", padding: "12px 0" }}>scratch-notes에 파일이 없어 (로컬 실행 중일 때만 보여)</div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflowY: "auto" }}>
                  {noteList.map(note => {
                    const isSelected = preview?.path === note.path;
                    return (
                      <button key={note.path} onClick={() => handleSelectNote(note.path)}
                        style={{ background: isSelected ? "#1a1a32" : "transparent", border: `1px solid ${isSelected ? "#4a4a8a" : "#2a2a3e"}`, borderRadius: 6, padding: "7px 10px", textAlign: "left", cursor: "pointer", display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#4a4a7a", background: "#1a1a2e", borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>{note.project}</span>
                        <span style={{ fontSize: 12, color: isSelected ? "#c0c0f0" : "#9090c0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note.filename.replace(/\.md$/, "")}</span>
                        <span style={{ fontSize: 10, color: "#3a3a5a", flexShrink: 0 }}>{note.date}</span>
                      </button>
                    );
                  })}
                </div>
                {loadingPreview && (
                  <div style={{ color: "#555", fontSize: 12, textAlign: "center", padding: "10px 0" }}>불러오는 중...</div>
                )}
                {preview && !loadingPreview && (
                  <div style={{ marginTop: 8, background: "#0a0a14", border: "1px solid #2a2a4a", borderRadius: 8, padding: "10px 12px" }}>
                    <pre style={{ fontSize: 11, color: "#8080b0", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 180, overflowY: "auto", margin: 0, fontFamily: "'Fira Code', monospace" }}>
                      {preview.content}
                    </pre>
                    <button onClick={handleLoadNote}
                      style={{ marginTop: 10, width: "100%", padding: "8px 0", borderRadius: 7, border: "none", background: "#2a2a6a", color: "#a0a0f0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      이걸로 불러오기 →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          style={{ ...S.textarea, minHeight: 180 }}
          placeholder={"- 히어로 섹션 만들었음\n- 오로라 블롭 3개\n- 모바일에서 안 보이는 버그 고침"} />
      </div>

      {/* Claude에게 */}
      <div style={S.section}>
        <label style={S.label}>Claude에게 <span style={{ color: "#3a3a5a", fontWeight: 400 }}>(선택)</span></label>
        <span style={{ fontSize: 11, color: "#3a3a5a", marginBottom: 8, display: "block" }}>특별히 강조하거나 빼고 싶은 것 ✦ 글 생성할 때만 쓰이고 저장 안 됨</span>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
          style={{ ...S.promptTA, minHeight: 80 }}
          placeholder={"예) 버그 고친 과정을 중심으로 써줘\n예) 초보자 독자 배려해서 용어 설명 많이 넣어줘"} />
      </div>

      {/* 태그 + 타입 + 공개여부 + 날짜 */}
      <div style={S.section}>
        <TagsInput value={tags} onChange={setTags} />
        <TypeStatusRow
          type={type} onTypeChange={setType}
          status={postStatus} onStatusChange={setPostStatus}
        />
        <div style={{ marginTop: 8 }}>
          <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: 1, display: "block", marginBottom: 6 }}>작성 날짜</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ background: "#13131e", border: "1px solid #2a2a4a", borderRadius: 8, color: "#c0c0f0", fontSize: 13, padding: "8px 12px", width: "100%", boxSizing: "border-box" as const }} />
        </div>
      </div>

      {/* 이미지 */}
      <div style={S.section}>
        <ImageUploadList images={images} onChange={setImages} />
      </div>

      {status === "error" && <div style={{ ...S.errorBox, margin: "0 16px 12px" }}>{errorMsg}</div>}

      <button
        style={{
          width: "calc(100% - 32px)", margin: "16px 16px 0", display: "block",
          padding: "15px 0", borderRadius: 12, fontSize: 16, fontWeight: 700, border: "none",
          background: status === "loading" ? COLORS.borderCard : COLORS.primary,
          color: status === "loading" ? "#888" : COLORS.bg,
          cursor: status === "loading" ? "not-allowed" : "pointer",
        }}
        onClick={handleSubmit}
        disabled={status === "loading" || !notes.trim()}
      >
        {status === "loading" ? "Claude가 글 쓰는 중... ✍️" : "Claude한테 초안 만들어줘 →"}
      </button>
      <p style={{ textAlign: "center", fontSize: 12, color: "#3a3a5a", marginTop: 10 }}>
        생성 후 편집 페이지에서 바로 수정할 수 있어
      </p>
    </div>
  );
}
