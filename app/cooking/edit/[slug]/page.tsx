"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { COLORS, COMMON } from "../../styles";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import type { GifResult, ImageEntry, ActiveTab, EditorMode, SaveStatus, Fields } from "../../types";
import TypeStatusRow from "../../components/TypeStatusRow";
import TagsInput from "../../components/TagsInput";
import ImageUploadList from "../../components/ImageUploadList";

const DARK = {
  ...COMMON,
  textarea: { ...COMMON.textarea, fontFamily: "monospace" },
  slug: { fontSize: 13, color: "#4a4a6a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  saveBtn: (s: SaveStatus) => ({
    padding: "8px 18px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: s === "saving" ? "not-allowed" as const : "pointer" as const,
    background: s === "saved" ? COLORS.success : s === "error" ? COLORS.error : s === "saving" ? COLORS.borderCard : COLORS.primary,
    color: s === "saving" ? "#888" : COLORS.bg,
  }),
  tabBar: { display: "flex", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg },
  tab: (active: boolean) => ({ flex: 1, padding: "12px 0", background: "transparent", border: "none", color: active ? COLORS.primary : COLORS.textMuted, fontSize: 14, fontWeight: active ? 700 : 400, cursor: "pointer", borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent" }),
  panel: { padding: "14px 16px" },
  gifGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 },
  gifThumb: { width: "100%", aspectRatio: "1", objectFit: "cover" as const, borderRadius: 6, cursor: "pointer" },
  inlineInput: { background: COLORS.bgCard, border: `1px solid ${COLORS.borderCard}`, borderRadius: 6, color: COLORS.text, fontSize: 13, padding: "6px 10px", outline: "none" },
  row: { display: "flex", gap: 10, marginBottom: 10 },
  modeBtn: (active: boolean) => ({
    flex: 1, padding: "7px 0", background: active ? "#1e1e30" : "transparent",
    border: active ? "1px solid #3a3a5e" : `1px solid ${COLORS.border}`, borderRadius: 6,
    color: active ? COLORS.primary : COLORS.textMuted, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
  }),
  preview: {
    minHeight: 320, background: COLORS.bgCard, border: `1px solid ${COLORS.borderCard}`, borderRadius: 8,
    padding: "16px", color: COLORS.text, fontSize: 15, lineHeight: 1.8,
  } as React.CSSProperties,
  notesBox: {
    background: COLORS.bgPrompt, border: `1px solid ${COLORS.borderPrompt}`, borderRadius: 8,
    padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: COLORS.textPrompt,
    whiteSpace: "pre-wrap" as const, minHeight: 60,
  },
};

function buildMarkdown(fields: Fields, body: string): string {
  const tags = fields.tags.split(",").map(t => t.trim()).filter(Boolean);
  const tagsStr = tags.length ? `[${tags.map(t => `"${t}"`).join(", ")}]` : "[]";
  const notesLine = fields.notes.trim() ? `notes: "${fields.notes.replace(/"/g, '\\"')}"\n` : "";
  const statusLine = fields.status === "unpublished" ? `status: unpublished\n` : "";
  const fm = `---\ntitle: "${fields.title}"\ndate: ${fields.date}\ndatetime: ${fields.datetime}\ntags: ${tagsStr}\ntype: ${fields.type}\n${notesLine}${statusLine}---`;
  const titleLine = fields.title ? `\n# ${fields.title}\n` : "";
  return `${fm}${titleLine}\n${body}`;
}

export default function ComprehensiveEditPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const slug = params.slug as string;

  const [fields, setFields] = useState<Fields>({ title: "", date: "", datetime: "", tags: "", type: "dev", notes: "", status: "published" });
  const [originalFields, setOriginalFields] = useState<Fields>({ title: "", date: "", datetime: "", tags: "", type: "dev", notes: "", status: "published" });
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
  const [gifError, setGifError] = useState("");
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
        const f = d.fields ?? { title: "", date: "", datetime: "", tags: "", type: "dev", notes: "", status: "published" };
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
    setGifError("");
    const url = gifQuery.trim() ? `/api/admin/giphy?q=${encodeURIComponent(gifQuery)}` : "/api/admin/giphy";
    const res = await fetch(url);
    if (!res.ok) {
      setGifError("GIPHY_API_KEY가 없거나 만료됐어. .env.local에 추가해줘.");
      setGifs([]);
      setGifLoading(false);
      return;
    }
    const data = await res.json() as GifResult[];
    if (Array.isArray(data)) setGifs(data);
    else setGifError("GIF 로드 실패.");
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
        <a href="/style-guide.html" target="_blank" style={{ fontSize: 11, color: "#555", textDecoration: "none", border: "1px solid #1c1c2a", borderRadius: 5, padding: "3px 8px" }}>📖 Style</a>
        <span style={DARK.slug}>{slug}</span>
        <button style={DARK.saveBtn(hasChanges ? saveStatus : "idle")} onClick={handleSave} disabled={saveStatus === "saving" || !hasChanges}>
          {saveStatus === "saving" ? "저장 중..." : saveStatus === "saved" ? "저장됨 ✓" : saveStatus === "error" ? "오류" : hasChanges ? "저장하기" : "변경없음"}
        </button>
      </div>

      {isNew && (
        <div style={{ margin: "8px 16px", padding: "10px 14px", background: "#1a2e1a", border: "1px solid #2a4a2a", borderRadius: 8, fontSize: 13, color: "#86efac" }}>
          ✦ 초안이 생성됐어. 여기서 바로 수정하거나 AI한테 더 요청해봐. 만족하면 저장하기.
        </div>
      )}
      {saveError && <div style={{ ...DARK.errorBox, margin: "8px 16px" }}>{saveError}</div>}

      <div style={DARK.section}>
        <label style={DARK.label}>제목</label>
        <input style={{ ...DARK.input, marginBottom: 12, fontSize: 17, fontWeight: 600 }}
          value={fields.title} onChange={e => updateField("title", e.target.value)} placeholder="제목" />

        <div style={{ marginBottom: 12 }}>
          <label style={DARK.label}>날짜</label>
          <input type="date" style={DARK.input} value={fields.date} onChange={e => updateField("date", e.target.value)} />
        </div>

        <TypeStatusRow
          type={fields.type as "dev" | "writing"} onTypeChange={v => updateField("type", v)}
          status={fields.status} onStatusChange={v => updateField("status", v)}
        />

        <TagsInput value={fields.tags} onChange={v => updateField("tags", v)} />
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
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" as const, alignItems: "center" }}>
              {[["## 소제목", "## "], ["### 소소제목", "### "]].map(([l, v]) => (
                <button key={l} style={DARK.smallBtn} onClick={() => insertAtCursor(v)}>{l}</button>
              ))}
              <span style={{ width: 1, height: 14, background: "#2a2a4a", display: "inline-block" }} />
              {[["**굵게**", "**굵게**"], ["*기울임*", "*기울임*"], ["~~취소~~", "~~취소~~"], ["`코드`", "`코드`"]].map(([l, v]) => (
                <button key={l} style={DARK.smallBtn} onClick={() => insertAtCursor(v)}>{l}</button>
              ))}
              <span style={{ width: 1, height: 14, background: "#2a2a4a", display: "inline-block" }} />
              {[["> 인용", "> "], ["> 단어란?", "> 단어란? "], ["takeaway", "> !! 내용"], ["---", "---"]].map(([l, v]) => (
                <button key={l} style={DARK.smallBtn} onClick={() => insertAtCursor(v)}>{l}</button>
              ))}
              <span style={{ width: 1, height: 14, background: "#2a2a4a", display: "inline-block" }} />
              {[["- 목록", "- "], ["1. 목록", "1. "], ["```코드블록", "```\n코드\n```"]].map(([l, v]) => (
                <button key={l} style={DARK.smallBtn} onClick={() => insertAtCursor(v)}>{l}</button>
              ))}
            </div>
          </>
        ) : (
          <div style={DARK.preview}>
            {fields.title && <h1 className="post-title-preview" style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "1.5rem", color: "var(--text-1)", lineHeight: 1.3 }}>{fields.title}</h1>}
            <MarkdownRenderer content={body} isWriting={fields.type === "writing"} />
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
          {gifError && <div style={{ color: "#f87171", fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>{gifError}</div>}
          {!gifError && gifs.length === 0 && !gifLoading && <div style={{ color: "#555", fontSize: 13, textAlign: "center", marginTop: 20 }}>GIF를 검색해봐</div>}
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
