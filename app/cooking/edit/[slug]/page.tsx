"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type GifResult = { id: string; title: string; preview: string; url: string };
type ImageEntry = { file: File; desc: string; preview: string };
type ActiveTab = "ai" | "giphy" | "image";
type EditorMode = "edit" | "preview";
type SaveStatus = "idle" | "saving" | "saved" | "error";

type Fields = {
  title: string;
  date: string;
  datetime: string;
  tags: string;
  type: string;
  notes: string;
};

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
  gifThumb: { width: "100%", aspectRatio: "1", objectFit: "cover" as const, borderRadius: 6, cursor: "pointer" },
  inlineInput: { background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 6, color: "#e8e8f0", fontSize: 13, padding: "6px 10px", outline: "none" },
  row: { display: "flex", gap: 10, marginBottom: 10 },
  errorBox: { background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 8, padding: "10px 12px", color: "#ff8080", fontSize: 13, marginTop: 8 },
  successBox: { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 12px", color: "#4ade80", fontSize: 13, marginTop: 8 },
  modeBtn: (active: boolean) => ({
    flex: 1, padding: "7px 0", background: active ? "#1e1e30" : "transparent",
    border: active ? "1px solid #3a3a5e" : "1px solid #1a1a2e", borderRadius: 6,
    color: active ? "#c4b8f8" : "#555", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
  }),
  preview: {
    minHeight: 320, background: "#13131e", border: "1px solid #2a2a3e", borderRadius: 8,
    padding: "16px", color: "#e8e8f0", fontSize: 15, lineHeight: 1.8,
  } as React.CSSProperties,
  notesBox: {
    background: "#0e0e1a", border: "1px solid #2a2a4a", borderRadius: 8,
    padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "#9090c0",
    whiteSpace: "pre-wrap" as const, minHeight: 60,
  },
};

function buildMarkdown(fields: Fields, body: string): string {
  const tags = fields.tags.split(",").map(t => t.trim()).filter(Boolean);
  const tagsStr = tags.length ? `[${tags.map(t => `"${t}"`).join(", ")}]` : "[]";
  const notesLine = fields.notes.trim() ? `notes: "${fields.notes.replace(/"/g, '\\"')}"\n` : "";
  const fm = `---\ntitle: "${fields.title}"\ndate: ${fields.date}\ndatetime: ${fields.datetime}\ntags: ${tagsStr}\ntype: ${fields.type}\n${notesLine}---`;
  const titleLine = fields.title ? `\n# ${fields.title}\n` : "";
  return `${fm}${titleLine}\n${body}`;
}

export default function ComprehensiveEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [fields, setFields] = useState<Fields>({ title: "", date: "", datetime: "", tags: "", type: "dev", notes: "" });
  const [originalFields, setOriginalFields] = useState<Fields>({ title: "", date: "", datetime: "", tags: "", type: "dev", notes: "" });
  const [body, setBody] = useState("");
  const [originalBody, setOriginalBody] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [originalMarkdown, setOriginalMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [notesEditMode, setNotesEditMode] = useState(false);
  const [tab, setTab] = useState<ActiveTab>("ai");
  const [instructions, setInstructions] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiImages, setAiImages] = useState<ImageEntry[]>([]);
  const aiFileRef = useRef<HTMLInputElement>(null);
  const [gifQuery, setGifQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const imgFileRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading) setMarkdown(buildMarkdown(fields, body));
  }, [fields, body, loading]);

  useEffect(() => {
    fetch(`/api/admin/posts/${slug}`)
      .then(r => r.json())
      .then((d: { markdown?: string; fields?: Fields; body?: string }) => {
        if (!d.markdown) { router.push("/cooking"); return; }
        const f = d.fields ?? { title: "", date: "", datetime: "", tags: "", type: "dev", notes: "" };
        const b = d.body ?? "";
        setFields(f); setOriginalFields(f);
        setBody(b); setOriginalBody(b);
        setMarkdown(d.markdown); setOriginalMarkdown(d.markdown);
      })
      .catch(() => router.push("/cooking"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  useEffect(() => {
    fetch("/api/admin/giphy")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setGifs(d as GifResult[]); });
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) { setBody(prev => prev + "\n" + text); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = body.substring(0, start);
    const after = body.substring(end);
    const newBody = before + "\n" + text + "\n" + after;
    setBody(newBody);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length + 2;
      ta.focus();
    });
  }, [body]);

  const updateField = (key: keyof Fields, val: string) => setFields(prev => ({ ...prev, [key]: val }));

  const searchGifs = async () => {
    setGifLoading(true);
    const url = gifQuery.trim() ? `/api/admin/giphy?q=${encodeURIComponent(gifQuery)}` : "/api/admin/giphy";
    const res = await fetch(url);
    const data = await res.json() as GifResult[];
    if (Array.isArray(data)) setGifs(data);
    setGifLoading(false);
  };

  const handleAiEdit = async () => {
    if (!instructions.trim()) return;
    setAiLoading(true);
    setAiError("");
    const currentMarkdown = buildMarkdown(fields, body);
    const fd = new FormData();
    fd.append("markdown", currentMarkdown);
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
        setOriginalMarkdown(prev => prev);
        const bodyMatch = data.markdown.match(/^---[\s\S]*?---\n(# .+\n)?([\s\S]*)$/);
        if (bodyMatch) setBody(bodyMatch[2]?.trim() ?? "");
        setInstructions("");
        setAiImages([]);
      }
    } catch {
      setAiError("네트워크 오류");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file => {
      setAiImages(prev => [...prev, { file, desc: "", preview: URL.createObjectURL(file) }]);
    });
    e.target.value = "";
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(file => {
      setImageEntries(prev => [...prev, { file, desc: "", preview: URL.createObjectURL(file) }]);
    });
    e.target.value = "";
  };

  const uploadAndInsert = async (entry: ImageEntry) => {
    const today = new Date().toISOString().substring(0, 10);
    const safeName = entry.file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const webPath = `/images/blog/${today}-${safeName}`;
    const fd = new FormData();
    fd.append("markdown", buildMarkdown(fields, body));
    fd.append("instructions", "이미지만 업로드해줘. 글은 그대로 반환해줘.");
    fd.append("slug", slug);
    fd.append("commit", "false");
    fd.append("image_0_file", entry.file);
    fd.append("image_0_desc", entry.desc);
    await fetch("/api/admin/generate-edit", { method: "POST", body: fd });
    insertAtCursor(`![${entry.desc || safeName}](${webPath})`);
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveError("");
    const toSave = buildMarkdown(fields, body);
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: toSave }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setSaveStatus("error"); setSaveError(data.error || "저장 실패"); }
      else {
        setSaveStatus("saved");
        setOriginalFields(fields); setOriginalBody(body); setOriginalMarkdown(toSave);
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch {
      setSaveStatus("error");
      setSaveError("네트워크 오류");
    }
  };

  const hasChanges = JSON.stringify(fields) !== JSON.stringify(originalFields) || body !== originalBody;
  const previewMarkdown = buildMarkdown(fields, body);

  if (loading) {
    return <div style={{ ...DARK.page, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#555" }}>불러오는 중...</div>;
  }

  return (
    <div style={DARK.page}>
      <div style={DARK.top}>
        <Link href="/cooking" style={DARK.back}>← 대시보드</Link>
        <span style={DARK.slug}>{slug}</span>
        <button style={DARK.saveBtn(hasChanges ? saveStatus : "idle")} onClick={handleSave} disabled={saveStatus === "saving" || !hasChanges}>
          {saveStatus === "saving" ? "저장 중..." : saveStatus === "saved" ? "저장됨 ✓" : saveStatus === "error" ? "오류" : hasChanges ? "저장하기" : "변경없음"}
        </button>
      </div>

      {saveError && <div style={{ ...DARK.errorBox, margin: "8px 16px" }}>{saveError}</div>}

      <div style={DARK.section}>
        <label style={DARK.label}>제목</label>
        <input style={{ ...DARK.input, marginBottom: 12, fontSize: 17, fontWeight: 600 }}
          value={fields.title} onChange={e => updateField("title", e.target.value)} placeholder="제목" />

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={DARK.label}>날짜</label>
            <input type="date" style={DARK.input} value={fields.date} onChange={e => updateField("date", e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={DARK.label}>타입</label>
            <select style={{ ...DARK.input, cursor: "pointer" }} value={fields.type} onChange={e => updateField("type", e.target.value)}>
              <option value="dev">dev</option>
              <option value="writing">writing</option>
            </select>
          </div>
        </div>

        <label style={DARK.label}>태그 (쉼표로 구분)</label>
        <input style={{ ...DARK.input, marginBottom: 0 }}
          value={fields.tags} onChange={e => updateField("tags", e.target.value)} placeholder="next.js, css, 실수" />
      </div>

      <div style={DARK.section}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <button onClick={() => setNotesExpanded(p => !p)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
            <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>원본 메모 / 소스</span>
            <span style={{ color: "#555", fontSize: 12 }}>{notesExpanded ? "▲" : "▼"}</span>
          </button>
          {notesExpanded && (
            <button style={DARK.smallBtn} onClick={() => setNotesEditMode(p => !p)}>
              {notesEditMode ? "완료" : "✏️ 편집"}
            </button>
          )}
        </div>
        {notesExpanded && (
          notesEditMode ? (
            <textarea value={fields.notes} onChange={e => updateField("notes", e.target.value)}
              style={{ ...DARK.textarea, minHeight: 120, fontFamily: "inherit" }}
              placeholder={"- 오늘 히어로 섹션 만들었음\n- 오로라 블롭 3개"} />
          ) : (
            <div style={DARK.notesBox}>
              {fields.notes.trim() || <span style={{ color: "#3a3a5e", fontStyle: "italic" }}>저장된 메모 없음. 편집 버튼으로 추가할 수 있어.</span>}
            </div>
          )
        )}
      </div>

      <div style={DARK.section}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button style={DARK.modeBtn(editorMode === "edit")} onClick={() => setEditorMode("edit")}>✏️ 편집</button>
          <button style={DARK.modeBtn(editorMode === "preview")} onClick={() => setEditorMode("preview")}>👁 미리보기</button>
        </div>
        {editorMode === "edit" ? (
          <>
            <textarea ref={textareaRef} value={body} onChange={e => setBody(e.target.value)}
              style={{ ...DARK.textarea, minHeight: 320 }} spellCheck={false} placeholder="본문을 여기에 작성해줘..." />
            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {[["## 소제목", "## "], ["**굵게**", "**굵게**"], ["~~취소~~", "~~취소~~"], ["> 인용", "> "], ["---", "---"]].map(([label, val]) => (
                <button key={label} style={DARK.smallBtn} onClick={() => insertAtCursor(val)}>{label}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={DARK.preview}>
            <style>{`
              .md-preview h1 { font-size: 1.6rem; font-weight: 800; margin: 0.8em 0 0.4em; color: #f0eeff; line-height: 1.3; }
              .md-preview h2 { font-size: 1.25rem; font-weight: 700; margin: 1.2em 0 0.4em; color: #d4ccff; line-height: 1.35; }
              .md-preview h3 { font-size: 1.05rem; font-weight: 600; margin: 1em 0 0.3em; color: #c0b8f0; }
              .md-preview p { margin: 0.6em 0; }
              .md-preview strong { color: #f0eeff; font-weight: 700; }
              .md-preview em { color: #b0aadd; font-style: italic; }
              .md-preview del { color: #666; text-decoration: line-through; }
              .md-preview blockquote { border-left: 3px solid #4a4a8a; margin: 1em 0; padding: 0.4em 0 0.4em 1em; color: #9090c0; font-style: italic; background: rgba(74,74,138,0.08); border-radius: 0 6px 6px 0; }
              .md-preview hr { border: none; border-top: 1px solid #2a2a4e; margin: 1.5em 0; }
              .md-preview ul, .md-preview ol { padding-left: 1.4em; margin: 0.5em 0; }
              .md-preview li { margin: 0.25em 0; }
              .md-preview code { background: #1e1e35; color: #c4b8f8; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: monospace; }
              .md-preview pre { background: #1e1e35; border-radius: 8px; padding: 12px; overflow-x: auto; margin: 0.8em 0; }
              .md-preview pre code { background: none; padding: 0; }
              .md-preview img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
              .md-preview a { color: #c4b8f8; text-decoration: underline; }
            `}</style>
            <div className="md-preview">
              {fields.title && <h1>{fields.title}</h1>}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div style={DARK.tabBar}>
        {(["ai", "giphy", "image"] as ActiveTab[]).map(t => (
          <button key={t} style={DARK.tab(tab === t)} onClick={() => setTab(t)}>
            {t === "ai" ? "AI 수정" : t === "giphy" ? "GIF" : "이미지"}
          </button>
        ))}
      </div>

      {tab === "ai" && (
        <div style={DARK.panel}>
          <label style={DARK.label}>수정 지시</label>
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
            style={{ ...DARK.textarea, minHeight: 100 }}
            placeholder={"- 마지막에 레슨런 섹션 추가\n- 제목 더 임팩트 있게"} />
          <div style={{ marginTop: 10 }}>
            {aiImages.map((img, i) => (
              <div key={i} style={{ ...DARK.row, alignItems: "center", background: "#13131e", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                <input type="text" value={img.desc}
                  onChange={e => setAiImages(prev => prev.map((item, j) => j === i ? { ...item, desc: e.target.value } : item))}
                  style={{ ...DARK.inlineInput, flex: 1 }} placeholder="이미지 설명..." />
                <button onClick={() => setAiImages(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
            ))}
            <button style={DARK.smallBtn} onClick={() => aiFileRef.current?.click()}>+ 이미지 첨부</button>
            <input ref={aiFileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAiImage} />
          </div>
          {aiError && <div style={DARK.errorBox}>{aiError}</div>}
          <button style={{ ...DARK.primaryBtn, width: "100%", marginTop: 12, opacity: aiLoading || !instructions.trim() ? 0.5 : 1 }}
            onClick={handleAiEdit} disabled={aiLoading || !instructions.trim()}>
            {aiLoading ? "Claude가 수정 중... ✍️" : "AI로 수정하기 →"}
          </button>
          {!aiLoading && hasChanges && <div style={DARK.successBox}>수정됐어! 위에서 확인하고 저장하기 눌러줘.</div>}
        </div>
      )}

      {tab === "giphy" && (
        <div style={DARK.panel}>
          <div style={{ ...DARK.row, alignItems: "center" }}>
            <input type="text" value={gifQuery} onChange={e => setGifQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchGifs()}
              style={{ ...DARK.inlineInput, flex: 1 }} placeholder="GIF 검색..." />
            <button style={DARK.smallBtn} onClick={searchGifs} disabled={gifLoading}>{gifLoading ? "..." : "검색"}</button>
          </div>
          <div style={DARK.gifGrid}>
            {gifs.map(gif => (
              <div key={gif.id} onClick={() => insertAtCursor(`![${gif.title}](${gif.url})`)} style={{ cursor: "pointer" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gif.preview} alt={gif.title} style={DARK.gifThumb} title={gif.title} />
              </div>
            ))}
          </div>
          {gifs.length === 0 && !gifLoading && <div style={{ color: "#555", fontSize: 13, textAlign: "center", marginTop: 20 }}>GIF를 검색해봐</div>}
          <div style={{ color: "#444", fontSize: 11, marginTop: 12, textAlign: "center" }}>클릭하면 커서 위치에 삽입돼</div>
        </div>
      )}

      {tab === "image" && (
        <div style={DARK.panel}>
          {imageEntries.map((img, i) => (
            <div key={i} style={{ background: "#13131e", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ ...DARK.row, alignItems: "center", marginBottom: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                <input type="text" value={img.desc}
                  onChange={e => setImageEntries(prev => prev.map((item, j) => j === i ? { ...item, desc: e.target.value } : item))}
                  style={{ ...DARK.inlineInput, flex: 1 }} placeholder="이미지 설명 (alt text)" />
                <button onClick={() => setImageEntries(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <button style={{ ...DARK.smallBtn, width: "100%" }} onClick={() => uploadAndInsert(img)}>업로드하고 삽입 →</button>
            </div>
          ))}
          <button style={{ ...DARK.smallBtn, width: "100%" }} onClick={() => imgFileRef.current?.click()}>+ 이미지 추가</button>
          <input ref={imgFileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageAdd} />
          <div style={{ color: "#444", fontSize: 11, marginTop: 12, textAlign: "center" }}>업로드하면 커서 위치에 마크다운 삽입돼</div>
        </div>
      )}

      <div style={{ display: "none" }}>{previewMarkdown}{markdown}{originalMarkdown}</div>
    </div>
  );
}
