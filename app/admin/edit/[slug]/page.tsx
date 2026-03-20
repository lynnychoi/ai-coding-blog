"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type GifResult = { id: string; title: string; preview: string; url: string };
type ImageEntry = { file: File; desc: string; preview: string };
type ActiveTab = "ai" | "giphy" | "image";
type SaveStatus = "idle" | "saving" | "saved" | "error";

const DARK = {
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", padding: "0 0 80px" } as React.CSSProperties,
  top: { position: "sticky" as const, top: 0, zIndex: 30, background: "#0a0a0f", borderBottom: "1px solid #1a1a2e", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 },
  back: { fontSize: 13, color: "#555", textDecoration: "none" },
  slug: { fontSize: 13, color: "#4a4a6a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  saveBtn: (s: SaveStatus) => ({
    padding: "8px 18px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: s === "saving" ? "not-allowed" as const : "pointer" as const,
    background: s === "saved" ? "#22c55e" : s === "error" ? "#ef4444" : s === "saving" ? "#2a2a3e" : "#c4b8f8",
    color: s === "saving" ? "#888" : "#0a0a0f",
  }),
  section: { padding: "14px 16px", borderBottom: "1px solid #1a1a2e" },
  label: { fontSize: 11, color: "#555", marginBottom: 4, display: "block", textTransform: "uppercase" as const, letterSpacing: 1 },
  input: { width: "100%", background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e8e8f0", fontSize: 15, padding: "10px 12px", outline: "none", boxSizing: "border-box" as const },
  textarea: { width: "100%", background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e8e8f0", fontSize: 13, padding: "12px", outline: "none", resize: "vertical" as const, lineHeight: 1.7, boxSizing: "border-box" as const, fontFamily: "monospace" },
  tabBar: { display: "flex", borderBottom: "1px solid #1a1a2e", background: "#0a0a0f" },
  tab: (active: boolean) => ({ flex: 1, padding: "12px 0", background: "transparent", border: "none", color: active ? "#c4b8f8" : "#555", fontSize: 14, fontWeight: active ? 700 : 400, cursor: "pointer", borderBottom: active ? "2px solid #c4b8f8" : "2px solid transparent" }),
  panel: { padding: "14px 16px" },
  smallBtn: { padding: "7px 14px", borderRadius: 8, border: "1.5px solid #2a2a3e", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" },
  primaryBtn: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#c4b8f8", color: "#0a0a0f", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  gifGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 },
  gifThumb: { width: "100%", aspectRatio: "1", objectFit: "cover" as const, borderRadius: 6, cursor: "pointer", border: "2px solid transparent" },
  inlineInput: { background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 6, color: "#e8e8f0", fontSize: 13, padding: "6px 10px", outline: "none" },
  row: { display: "flex", gap: 10, marginBottom: 10 },
  errorBox: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 8, padding: "10px 12px", color: "#ff8080", fontSize: 13, marginTop: 8 },
  successBox: { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 12px", color: "#4ade80", fontSize: 13, marginTop: 8 },
};

export default function ComprehensiveEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Core content
  const [markdown, setMarkdown] = useState("");
  const [originalMarkdown, setOriginalMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [postDate, setPostDate] = useState("");

  // Active tab
  const [tab, setTab] = useState<ActiveTab>("ai");

  // AI tab
  const [instructions, setInstructions] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiImages, setAiImages] = useState<ImageEntry[]>([]);
  const aiFileRef = useRef<HTMLInputElement>(null);

  // Giphy tab
  const [gifQuery, setGifQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);

  // Image tab
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const imgFileRef = useRef<HTMLInputElement>(null);

  // Save
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load post
  useEffect(() => {
    fetch(`/api/admin/posts/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.markdown) {
          setMarkdown(d.markdown);
          setOriginalMarkdown(d.markdown);
          const match = d.markdown.match(/^date:\s*(\d{4}-\d{2}-\d{2})/m);
          if (match) setPostDate(match[1]);
        } else router.push("/admin");
      })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleDateChange = (newDate: string) => {
    setPostDate(newDate);
    setMarkdown(prev => prev.replace(/^(date:\s*)\S+/m, `$1${newDate}`));
  };

  // Load trending GIFs on mount
  useEffect(() => {
    fetch("/api/admin/giphy")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setGifs(d); });
  }, []);

  // Insert text at cursor
  const insertAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) { setMarkdown(prev => prev + "\n" + text); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = markdown.substring(0, start);
    const after = markdown.substring(end);
    const newMd = before + "\n" + text + "\n" + after;
    setMarkdown(newMd);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length + 2;
      ta.focus();
    });
  }, [markdown]);

  // Giphy search
  const searchGifs = async () => {
    setGifLoading(true);
    const url = gifQuery.trim()
      ? `/api/admin/giphy?q=${encodeURIComponent(gifQuery)}`
      : "/api/admin/giphy";
    const res = await fetch(url);
    const data = await res.json() as GifResult[];
    if (Array.isArray(data)) setGifs(data);
    setGifLoading(false);
  };

  // Insert GIF
  const insertGif = (gif: GifResult) => {
    insertAtCursor(`![${gif.title}](${gif.url})`);
  };

  // AI edit
  const handleAiEdit = async () => {
    if (!instructions.trim()) return;
    setAiLoading(true);
    setAiError("");
    const fd = new FormData();
    fd.append("markdown", markdown);
    fd.append("instructions", instructions);
    fd.append("slug", slug);
    fd.append("commit", "false");
    aiImages.forEach((img, i) => {
      fd.append(`image_${i}_file`, img.file);
      fd.append(`image_${i}_desc`, img.desc);
    });
    try {
      const res = await fetch("/api/admin/generate-edit", { method: "POST", body: fd });
      const data = await res.json() as { markdown?: string; error?: string };
      if (!res.ok || data.error) { setAiError(data.error || "오류 발생"); }
      else if (data.markdown) {
        setMarkdown(data.markdown);
        setInstructions("");
        setAiImages([]);
      }
    } catch {
      setAiError("네트워크 오류");
    } finally {
      setAiLoading(false);
    }
  };

  // Add image for AI context
  const handleAiImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file => {
      setAiImages(prev => [...prev, { file, desc: "", preview: URL.createObjectURL(file) }]);
    });
    e.target.value = "";
  };

  // Add image to insert
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file => {
      setImageEntries(prev => [...prev, { file, desc: "", preview: URL.createObjectURL(file) }]);
    });
    e.target.value = "";
  };

  // Upload image and insert markdown
  const uploadAndInsert = async (entry: ImageEntry) => {
    const today = new Date().toISOString().substring(0, 10);
    const safeName = entry.file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const webPath = `/images/blog/${today}-${safeName}`;

    // Upload via generate-edit with no instructions (just image)
    const fd = new FormData();
    fd.append("markdown", markdown);
    fd.append("instructions", "이미지만 업로드하고 현재 글 그대로 반환해줘");
    fd.append("slug", slug);
    fd.append("commit", "false");
    fd.append("image_0_file", entry.file);
    fd.append("image_0_desc", entry.desc);
    const res = await fetch("/api/admin/generate-edit", { method: "POST", body: fd });
    const data = await res.json() as { markdown?: string };
    // Insert at cursor regardless
    insertAtCursor(`![${entry.desc || safeName}](${webPath})`);
    if (data.markdown) setMarkdown(data.markdown);
  };

  // Save
  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveError("");
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setSaveStatus("error"); setSaveError(data.error || "저장 실패"); }
      else { setSaveStatus("saved"); setOriginalMarkdown(markdown); setTimeout(() => setSaveStatus("idle"), 3000); }
    } catch {
      setSaveStatus("error");
      setSaveError("네트워크 오류");
    }
  };

  const hasChanges = markdown !== originalMarkdown;

  if (loading) {
    return <div style={{ ...DARK.page, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#555" }}>불러오는 중...</div>;
  }

  return (
    <div style={DARK.page}>
      {/* Top bar */}
      <div style={DARK.top}>
        <Link href="/admin" style={DARK.back}>← 대시보드</Link>
        <span style={DARK.slug}>{slug}</span>
        <button
          style={DARK.saveBtn(hasChanges ? saveStatus : "idle")}
          onClick={handleSave}
          disabled={saveStatus === "saving" || !hasChanges}
        >
          {saveStatus === "saving" ? "저장 중..." : saveStatus === "saved" ? "저장됨 ✓" : saveStatus === "error" ? "오류" : hasChanges ? "저장하기" : "변경없음"}
        </button>
      </div>

      {saveError && <div style={{ ...DARK.errorBox, margin: "8px 16px" }}>{saveError}</div>}

      {/* Date picker */}
      {postDate && (
        <div style={DARK.section}>
          <label style={DARK.label}>날짜</label>
          <input
            type="date"
            value={postDate}
            onChange={e => handleDateChange(e.target.value)}
            style={{ ...DARK.input, colorScheme: "dark" }}
          />
        </div>
      )}

      {/* Markdown editor */}
      <div style={DARK.section}>
        <label style={DARK.label}>마크다운 직접 수정</label>
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          style={{ ...DARK.textarea, minHeight: 320 }}
          spellCheck={false}
        />
        <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {[
            ["# 제목", "# "],
            ["## 소제목", "## "],
            ["**굵게**", "**굵게**"],
            ["~~취소~~", "~~취소~~"],
            ["> 인용", "> "],
            ["---", "---"],
          ].map(([label, val]) => (
            <button key={label} style={DARK.smallBtn} onClick={() => insertAtCursor(val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={DARK.tabBar}>
        {(["ai", "giphy", "image"] as ActiveTab[]).map(t => (
          <button key={t} style={DARK.tab(tab === t)} onClick={() => setTab(t)}>
            {t === "ai" ? "AI 수정" : t === "giphy" ? "GIF" : "이미지"}
          </button>
        ))}
      </div>

      {/* AI tab */}
      {tab === "ai" && (
        <div style={DARK.panel}>
          <label style={DARK.label}>수정 지시</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            style={{ ...DARK.textarea, minHeight: 100 }}
            placeholder={"- 마지막에 레슨런 섹션 추가\n- 제목 더 임팩트 있게\n- 세 번째 단락 더 구체적으로"}
          />

          {/* AI image attach */}
          <div style={{ marginTop: 10 }}>
            {aiImages.map((img, i) => (
              <div key={i} style={{ ...DARK.row, alignItems: "center", background: "#13131e", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                <input
                  type="text" value={img.desc}
                  onChange={e => setAiImages(prev => prev.map((item, j) => j === i ? { ...item, desc: e.target.value } : item))}
                  style={{ ...DARK.inlineInput, flex: 1 }} placeholder="이미지 설명..."
                />
                <button onClick={() => setAiImages(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
            ))}
            <button style={DARK.smallBtn} onClick={() => aiFileRef.current?.click()}>+ 이미지 첨부</button>
            <input ref={aiFileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAiImage} />
          </div>

          {aiError && <div style={DARK.errorBox}>{aiError}</div>}

          <button
            style={{ ...DARK.primaryBtn, width: "100%", marginTop: 12, opacity: aiLoading || !instructions.trim() ? 0.5 : 1 }}
            onClick={handleAiEdit}
            disabled={aiLoading || !instructions.trim()}
          >
            {aiLoading ? "Claude가 수정 중... ✍️" : "AI로 수정하기 →"}
          </button>
          {!aiLoading && markdown !== originalMarkdown && (
            <div style={DARK.successBox}>AI 수정 완료! 위 마크다운 확인 후 저장하기 눌러줘.</div>
          )}
        </div>
      )}

      {/* Giphy tab */}
      {tab === "giphy" && (
        <div style={DARK.panel}>
          <div style={{ ...DARK.row, alignItems: "center" }}>
            <input
              type="text" value={gifQuery}
              onChange={e => setGifQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchGifs()}
              style={{ ...DARK.inlineInput, flex: 1 }}
              placeholder="GIF 검색..."
            />
            <button style={DARK.smallBtn} onClick={searchGifs} disabled={gifLoading}>
              {gifLoading ? "..." : "검색"}
            </button>
          </div>

          <div style={DARK.gifGrid}>
            {gifs.map(gif => (
              <div key={gif.id} onClick={() => insertGif(gif)} style={{ cursor: "pointer" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gif.preview} alt={gif.title} style={DARK.gifThumb} title={gif.title} />
              </div>
            ))}
          </div>
          {gifs.length === 0 && !gifLoading && (
            <div style={{ color: "#555", fontSize: 13, textAlign: "center", marginTop: 20 }}>GIF를 검색해봐</div>
          )}
          <div style={{ color: "#444", fontSize: 11, marginTop: 12, textAlign: "center" }}>클릭하면 커서 위치에 삽입돼</div>
        </div>
      )}

      {/* Image tab */}
      {tab === "image" && (
        <div style={DARK.panel}>
          {imageEntries.map((img, i) => (
            <div key={i} style={{ background: "#13131e", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ ...DARK.row, alignItems: "center", marginBottom: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                <input
                  type="text" value={img.desc}
                  onChange={e => setImageEntries(prev => prev.map((item, j) => j === i ? { ...item, desc: e.target.value } : item))}
                  style={{ ...DARK.inlineInput, flex: 1 }} placeholder="이미지 설명 (alt text)"
                />
                <button onClick={() => setImageEntries(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <button
                style={{ ...DARK.smallBtn, width: "100%" }}
                onClick={() => uploadAndInsert(img)}
              >
                업로드하고 삽입 →
              </button>
            </div>
          ))}

          <button style={{ ...DARK.smallBtn, width: "100%" }} onClick={() => imgFileRef.current?.click()}>
            + 이미지 추가
          </button>
          <input ref={imgFileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageAdd} />
          <div style={{ color: "#444", fontSize: 11, marginTop: 12, textAlign: "center" }}>업로드하면 커서 위치에 마크다운 삽입돼</div>
        </div>
      )}
    </div>
  );
}
