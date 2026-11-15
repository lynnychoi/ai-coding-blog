"use client";

import { useState, useMemo } from "react";
import { COLORS, COMMON } from "../styles";

const S = COMMON;

// ─── Types ───────────────────────────────────────────────────────────────────

type FormatType = "bold" | "italic" | "strikethrough" | "underline" | "inlineCode" | "링크";
type Suggestion = { text: string; format: FormatType };

type BrunchBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "defbox"; text: string }
  | { type: "takeaway"; text: string }
  | { type: "gif"; alt: string; url: string }
  | { type: "image"; alt: string; url: string }
  | { type: "codeblock"; lang: string; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "divider" };

// ─── Styles ──────────────────────────────────────────────────────────────────

const FORMAT_STYLES: Record<FormatType, { bg: string; color: string; label: string; textStyle?: React.CSSProperties }> = {
  bold:          { bg: "#2e2800", color: "#ffd040", label: "볼드",       textStyle: { fontWeight: 700 } },
  italic:        { bg: "#1a1a30", color: "#a090f8", label: "기울임",     textStyle: { fontStyle: "italic" } },
  strikethrough: { bg: "#2e0f0f", color: "#ff7060", label: "취소선",     textStyle: { textDecoration: "line-through" } },
  underline:     { bg: "#091826", color: "#70b8ff", label: "밑줄",       textStyle: { textDecoration: "underline" } },
  inlineCode:    { bg: "#1e1a08", color: "#c8b040", label: "볼드(코드)", textStyle: { fontFamily: "monospace" } },
  링크:          { bg: "#081e1e", color: "#40d0c8", label: "링크",       textStyle: { textDecoration: "underline" } },
};

const BLOCK_BADGE: Record<string, { color: string; bg: string; label: string }> = {
  색상:    { color: "#60e090", bg: "#0d2010", label: "색상" },
  핵심:    { color: "#ffb830", bg: "#1e1200", label: "핵심" },
  불렛:    { color: "#90c8f0", bg: "#081822", label: "불렛" },
  번호목록: { color: "#90c8f0", bg: "#081822", label: "번호목록" },
  구분선:  { color: "#707080", bg: "#111118", label: "구분선" },
  코드블록: { color: "#c8b040", bg: "#1e1a08", label: "코드블록" },
};

// ─── Markdown parsing ─────────────────────────────────────────────────────────

function stripMd(text: string): string {
  return text
    .replace(/<u>(.+?)<\/u>/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

function parseBlocks(md: string): BrunchBlock[] {
  const lines = md.split("\n");
  const blocks: BrunchBlock[] = [];
  let i = 0;
  let paraLines: string[] = [];

  const flushPara = () => {
    const text = paraLines.join("\n").trim();
    if (text) blocks.push({ type: "paragraph", text: stripMd(text) });
    paraLines = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flushPara();
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      if (code.join("").trim()) blocks.push({ type: "codeblock", lang, text: code.join("\n") });
      i++; continue;
    }
    if (line.startsWith("### ")) { flushPara(); blocks.push({ type: "heading", level: 3, text: stripMd(line.slice(4)) }); i++; continue; }
    if (line.startsWith("## "))  { flushPara(); blocks.push({ type: "heading", level: 2, text: stripMd(line.slice(3)) }); i++; continue; }
    if (line.startsWith("# ")) { i++; continue; }
    if (line.startsWith("> !! ") || line === "> !!") {
      flushPara(); blocks.push({ type: "takeaway", text: stripMd(line.replace(/^> !! ?/, "")) }); i++; continue;
    }
    if (/^> .+란\?/.test(line)) { flushPara(); blocks.push({ type: "defbox", text: stripMd(line.slice(2)) }); i++; continue; }
    if (line.startsWith("> ")) {
      flushPara();
      const ql: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) { ql.push(lines[i].slice(2)); i++; }
      blocks.push({ type: "quote", text: stripMd(ql.join("\n")) }); continue;
    }
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      flushPara();
      const [, alt, url] = imgMatch;
      const isGif = url.includes("giphy.com") || url.toLowerCase().endsWith(".gif");
      blocks.push(isGif ? { type: "gif", alt, url } : { type: "image", alt, url });
      i++; continue;
    }
    if (line.trim() === "---") { flushPara(); blocks.push({ type: "divider" }); i++; continue; }
    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      flushPara();
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && (/^[-*] /.test(lines[i]) || /^\d+\. /.test(lines[i]))) {
        items.push(stripMd(lines[i].replace(/^[-*\d.]+\s/, ""))); i++;
      }
      blocks.push({ type: "list", ordered, items }); continue;
    }
    if (line.trim() === "") { flushPara(); i++; continue; }
    paraLines.push(line); i++;
  }
  flushPara();
  return blocks;
}

function mergeParas(blocks: BrunchBlock[]): BrunchBlock[] {
  const result: BrunchBlock[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === "paragraph") {
      const texts: string[] = [(blocks[i] as { type: "paragraph"; text: string }).text];
      while (i + 1 < blocks.length && blocks[i + 1].type === "paragraph") {
        i++;
        texts.push((blocks[i] as { type: "paragraph"; text: string }).text);
      }
      result.push({ type: "paragraph", text: texts.join("\n\n") });
    } else {
      result.push(blocks[i]);
    }
    i++;
  }
  return result;
}

function blocksToPlainText(blocks: BrunchBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.type === "image") continue;
    if (b.type === "gif") { parts.push("."); continue; }
    if (b.type === "divider") { parts.push(""); continue; }
    if (b.type === "heading")  { parts.push(b.text); continue; }
    if (b.type === "paragraph") { parts.push(b.text); continue; }
    if (b.type === "quote")     { parts.push(b.text); continue; }
    if (b.type === "defbox")    { parts.push(b.text); continue; }
    if (b.type === "takeaway")  { parts.push(b.text); continue; }
    if (b.type === "list")      { parts.push(b.items.map((it, idx) => b.ordered ? `${idx + 1}. ${it}` : `• ${it}`).join("\n")); continue; }
    if (b.type === "codeblock") { parts.push(b.text); continue; }
  }
  return parts.join("\n\n").trim();
}

// ─── Hint extraction (pure markdown, no AI) ───────────────────────────────────

function extractInlineHints(md: string): Suggestion[] {
  const hints: Suggestion[] = [];
  let m: RegExpExecArray | null;

  const boldRe = /\*\*(.+?)\*\*/g;
  while ((m = boldRe.exec(md)) !== null) {
    if (m[1].trim()) hints.push({ text: m[1], format: "bold" });
  }

  const noDouble = md.replace(/\*\*[^*\n]+?\*\*/g, s => " ".repeat(s.length));
  const italicRe = /\*([^*\n]+?)\*/g;
  while ((m = italicRe.exec(noDouble)) !== null) {
    if (m[1].trim()) hints.push({ text: m[1], format: "italic" });
  }

  const strikeRe = /~~(.+?)~~/g;
  while ((m = strikeRe.exec(md)) !== null) {
    if (m[1].trim()) hints.push({ text: m[1], format: "strikethrough" });
  }

  const ulRe = /<u>(.+?)<\/u>/g;
  while ((m = ulRe.exec(md)) !== null) {
    if (m[1].trim()) hints.push({ text: m[1], format: "underline" });
  }

  const codeRe = /`([^`\n]+?)`/g;
  while ((m = codeRe.exec(md)) !== null) {
    if (m[1].trim()) hints.push({ text: m[1], format: "inlineCode" });
  }

  const linkRe = /\[([^\]\n]+?)\]\([^)\n]+?\)/g;
  while ((m = linkRe.exec(md)) !== null) {
    if (m[1].trim()) hints.push({ text: m[1], format: "링크" });
  }

  return hints;
}

// ─── Inline hint rendering ────────────────────────────────────────────────────

function applyHints(text: string, suggestions: Suggestion[]): React.ReactNode {
  const inlineSuggestions = suggestions.filter(s => text.includes(s.text));
  if (inlineSuggestions.length === 0) return text;

  type Match = { start: number; end: number; format: FormatType };
  const matches: Match[] = [];
  for (const s of inlineSuggestions) {
    let pos = 0;
    while (pos < text.length) {
      const idx = text.indexOf(s.text, pos);
      if (idx === -1) break;
      const overlaps = matches.some(mx => idx < mx.end && idx + s.text.length > mx.start);
      if (!overlaps) matches.push({ start: idx, end: idx + s.text.length, format: s.format });
      pos = idx + 1;
    }
  }
  matches.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let cur = 0;
  for (const mx of matches) {
    if (mx.start > cur) nodes.push(text.slice(cur, mx.start));
    const fmt = FORMAT_STYLES[mx.format];
    nodes.push(
      <span key={mx.start} style={{ background: fmt.bg, borderRadius: 3, padding: "0 2px", ...fmt.textStyle }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: fmt.color,
          background: fmt.bg, border: `1px solid ${fmt.color}`,
          borderRadius: 3, padding: "0 4px", marginRight: 3,
          verticalAlign: "middle", letterSpacing: "0.03em", whiteSpace: "nowrap",
        }}>
          {fmt.label}
        </span>
        {text.slice(mx.start, mx.end)}
      </span>
    );
    cur = mx.end;
  }
  if (cur < text.length) nodes.push(text.slice(cur));
  return <>{nodes}</>;
}

function BBadge({ id }: { id: string }) {
  const b = BLOCK_BADGE[id];
  if (!b) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: b.color,
      background: b.bg, border: `1px solid ${b.color}`,
      borderRadius: 4, padding: "2px 7px", flexShrink: 0,
      letterSpacing: "0.03em",
    }}>{b.label}</span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = { title?: string; body: string };

export default function BrunchPanel({ title, body }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const blocks = useMemo(() => mergeParas(parseBlocks(body)), [body]);
  const fullText = useMemo(() => blocksToPlainText(blocks), [blocks]);
  const hints = useMemo(() => extractInlineHints(body), [body]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const CopyBtn = ({ text, id, label }: { text: string; id: string; label?: string }) => {
    const done = copiedKey === id;
    return (
      <button
        onClick={() => copy(text, id)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: done ? "#1a2e1a" : "#13131e",
          border: `1px solid ${done ? "#2a5a2a" : "#2a2a4a"}`,
          borderRadius: 8, padding: "8px 14px",
          color: done ? COLORS.success : "#c0c0d0",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}
      >
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M3 13V5a2 2 0 0 1 2-2h8" /></svg>
        )}
        {label && <span>{done ? "복사됨" : label}</span>}
      </button>
    );
  };

  if (!body.trim()) {
    return <div style={{ padding: "14px 16px", color: "#555", fontSize: 13 }}>글 본문이 없어요.</div>;
  }

  const presentFormats = (Object.keys(FORMAT_STYLES) as FormatType[]).filter(f => hints.some(h => h.format === f));

  return (
    <div style={{ padding: "14px 16px" }}>
      {/* 안내 */}
      <div style={{ fontSize: 12, color: "#a0a0b8", marginBottom: 16, lineHeight: 1.7 }}>
        본문 전체 복사 → 브런치 붙여넣기 → 힌트 보고 서식 적용 → GIF 카드 위치에 삽입
      </div>

      {/* 인라인 힌트 범례 */}
      {presentFormats.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
          {presentFormats.map(f => (
            <span key={f} style={{
              fontSize: 10, fontWeight: 700,
              color: FORMAT_STYLES[f].color, background: FORMAT_STYLES[f].bg,
              border: `1px solid ${FORMAT_STYLES[f].color}`, borderRadius: 4, padding: "2px 7px",
            }}>
              {FORMAT_STYLES[f].label}
            </span>
          ))}
          <span style={{ fontSize: 10, color: "#3a3a5a" }}>표시된 텍스트에 해당 서식 적용</span>
        </div>
      )}

      {/* 대제목 */}
      {title && (
        <div style={{ background: "#0e0e18", border: "1px solid #2a2a3e", borderRadius: 10, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>대제목</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e0e0f0" }}>{title}</div>
          </div>
          <CopyBtn text={title} id="__title__" />
        </div>
      )}

      {/* 본문 전체 복사 */}
      <div style={{ marginBottom: 16 }}>
        <CopyBtn text={fullText} id="__body__" label="본문 전체 복사" />
      </div>

      {/* 블록 프리뷰 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {blocks.map((block, i) => {
          if (block.type === "divider") {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
                <div style={{ flex: 1, borderTop: "1px solid #1e1e2e" }} />
                <BBadge id="구분선" />
                <div style={{ flex: 1, borderTop: "1px solid #1e1e2e" }} />
              </div>
            );
          }

          if (block.type === "heading") {
            return (
              <div key={i} style={{ background: "#111128", border: "1px solid #3a3a6a", borderRadius: 8, padding: "9px 12px", display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, flexShrink: 0,
                  background: block.level === 2 ? "#2a2a5a" : "#1e1e3a",
                  color: block.level === 2 ? "#a0a0f8" : "#7070c8",
                  letterSpacing: "0.05em",
                }}>
                  {block.level === 2 ? "소제목" : "소소제목"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#c0c0f0" }}>
                  {applyHints(block.text, hints)}
                </span>
              </div>
            );
          }

          if (block.type === "gif") {
            const downloadUrl = `/api/admin/giphy-download?url=${encodeURIComponent(block.url)}`;
            return (
              <div key={i} style={{ background: "#0d0d1a", border: "1px dashed #3a3a6a", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt={block.alt} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: "#6060a0", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>여기 GIF 삽입</div>
                  <div style={{ fontSize: 12, color: "#5050a0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{block.alt || "(제목 없음)"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                  <a href={downloadUrl} download
                    style={{ ...S.smallBtn, fontSize: 11, padding: "5px 10px", textDecoration: "none", textAlign: "center", color: "#a8f0d8", borderColor: "#2a5a4a", flexShrink: 0 }}>
                    ⬇ GIF 저장
                  </a>
                  <a href={block.url} target="_blank" rel="noopener noreferrer"
                    style={{ ...S.smallBtn, fontSize: 11, padding: "5px 10px", textDecoration: "none", textAlign: "center", color: "#9090d0", borderColor: "#3a3a6a", flexShrink: 0 }}>
                    Giphy 열기
                  </a>
                </div>
              </div>
            );
          }

          if (block.type === "image") {
            return (
              <div key={i} style={{ background: "#0d0d1a", border: "1px dashed #3a3a4a", borderRadius: 8, padding: "9px 12px" }}>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>여기 이미지 삽입</div>
                <div style={{ fontSize: 12, color: "#7070a0" }}>{block.alt || block.url}</div>
              </div>
            );
          }

          if (block.type === "paragraph") {
            return (
              <div key={i} style={{ padding: "6px 2px" }}>
                <div style={{ fontSize: 13, color: "#c8c8d8", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                  {applyHints(block.text, hints)}
                </div>
              </div>
            );
          }

          if (block.type === "quote") {
            return (
              <div key={i} style={{ padding: "6px 2px 6px 10px", borderLeft: "2px solid #5a5a7a", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, fontSize: 13, color: "#b0b0cc", fontStyle: "italic" }}>
                  {applyHints(block.text, hints)}
                </div>
                <BBadge id="색상" />
              </div>
            );
          }

          if (block.type === "defbox") {
            return (
              <div key={i} style={{ padding: "6px 2px 6px 10px", borderLeft: "2px solid #5a5a9a", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, fontSize: 13, color: "#b0b0cc" }}>
                  {applyHints(block.text, hints)}
                </div>
                <BBadge id="색상" />
              </div>
            );
          }

          if (block.type === "takeaway") {
            return (
              <div key={i} style={{ padding: "6px 2px 6px 10px", borderLeft: "2px solid #c9a94a", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, fontSize: 13, color: "#d4b84a" }}>
                  {applyHints(block.text, hints)}
                </div>
                <BBadge id="핵심" />
              </div>
            );
          }

          if (block.type === "list") {
            return (
              <div key={i} style={{ padding: "6px 2px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  {block.items.map((it, j) => (
                    <div key={j} style={{ fontSize: 13, color: "#c8c8d8", lineHeight: 1.8 }}>
                      {block.ordered ? `${j + 1}.` : "•"} {applyHints(it, hints)}
                    </div>
                  ))}
                </div>
                <BBadge id={block.ordered ? "번호목록" : "불렛"} />
              </div>
            );
          }

          if (block.type === "codeblock") {
            return (
              <div key={i} style={{ padding: "6px 2px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <pre style={{ flex: 1, fontSize: 11, color: "#9090b0", fontFamily: "'Fira Code', monospace", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{block.text}</pre>
                <BBadge id="코드블록" />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
