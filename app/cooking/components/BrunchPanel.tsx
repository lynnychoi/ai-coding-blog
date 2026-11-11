"use client";

import { useState, useMemo } from "react";
import { COLORS, COMMON } from "../styles";

const S = COMMON;

type BrunchBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "defbox"; text: string }
  | { type: "takeaway"; text: string }
  | { type: "gif"; alt: string; url: string }
  | { type: "image"; alt: string; url: string }
  | { type: "codeblock"; lang: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "divider" };

function stripMd(text: string): string {
  return text
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
      const items: string[] = [];
      while (i < lines.length && (/^[-*] /.test(lines[i]) || /^\d+\. /.test(lines[i]))) {
        items.push(stripMd(lines[i].replace(/^[-*\d.]+\s/, ""))); i++;
      }
      blocks.push({ type: "list", items }); continue;
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
    if (b.type === "list")      { parts.push(b.items.map(it => `• ${it}`).join("\n")); continue; }
    if (b.type === "codeblock") { parts.push(b.text); continue; }
  }
  return parts.join("\n\n").trim();
}

type Props = { title?: string; body: string };

export default function BrunchPanel({ title, body }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const blocks = useMemo(() => mergeParas(parseBlocks(body)), [body]);
  const fullText = useMemo(() => blocksToPlainText(blocks), [blocks]);

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

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 16, lineHeight: 1.7 }}>
        본문 전체 복사 → 브런치 붙여넣기 → 소제목 위치 찾아서 서식 변경 → GIF 카드 위치에 삽입
      </div>

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
            return <div key={i} style={{ borderTop: "1px solid #1e1e2e", margin: "4px 0" }} />;
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
                <span style={{ fontSize: 14, fontWeight: 600, color: "#c0c0f0" }}>{block.text}</span>
              </div>
            );
          }

          if (block.type === "gif") {
            return (
              <div key={i} style={{ background: "#0d0d1a", border: "1px dashed #3a3a6a", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt={block.alt} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: "#6060a0", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>여기 GIF 삽입</div>
                  <div style={{ fontSize: 12, color: "#5050a0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{block.alt || "(제목 없음)"}</div>
                </div>
                <a href={block.url} target="_blank" rel="noopener noreferrer"
                  style={{ ...S.smallBtn, fontSize: 11, padding: "5px 10px", textDecoration: "none", color: "#9090d0", borderColor: "#3a3a6a", flexShrink: 0 }}>
                  Giphy 열기
                </a>
              </div>
            );
          }

          if (block.type === "image") {
            return (
              <div key={i} style={{ background: "#0d0d1a", border: "1px dashed #3a3a4a", borderRadius: 8, padding: "9px 12px" }}>
                <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>여기 이미지 삽입</div>
                <div style={{ fontSize: 12, color: "#4a4a7a" }}>{block.alt || block.url}</div>
              </div>
            );
          }

          if (block.type === "paragraph") {
            return (
              <div key={i} style={{ padding: "6px 2px" }}>
                <div style={{ fontSize: 13, color: "#7070a0", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{block.text}</div>
              </div>
            );
          }

          if (block.type === "quote") {
            return (
              <div key={i} style={{ padding: "6px 2px 6px 10px", borderLeft: "2px solid #3a3a6a" }}>
                <div style={{ fontSize: 13, color: "#6060a0", fontStyle: "italic" }}>{block.text}</div>
              </div>
            );
          }

          if (block.type === "defbox") {
            return (
              <div key={i} style={{ padding: "6px 2px 6px 10px", borderLeft: "2px solid #4a4a8a" }}>
                <div style={{ fontSize: 13, color: "#6060a0" }}>{block.text}</div>
              </div>
            );
          }

          if (block.type === "takeaway") {
            return (
              <div key={i} style={{ padding: "6px 2px 6px 10px", borderLeft: "2px solid #c9a94a" }}>
                <div style={{ fontSize: 13, color: "#c9a94a" }}>{block.text}</div>
              </div>
            );
          }

          if (block.type === "list") {
            return (
              <div key={i} style={{ padding: "6px 2px" }}>
                {block.items.map((it, j) => (
                  <div key={j} style={{ fontSize: 13, color: "#7070a0", lineHeight: 1.8 }}>• {it}</div>
                ))}
              </div>
            );
          }

          if (block.type === "codeblock") {
            return (
              <div key={i} style={{ padding: "6px 2px" }}>
                <pre style={{ fontSize: 11, color: "#6060a0", fontFamily: "'Fira Code', monospace", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{block.text}</pre>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
