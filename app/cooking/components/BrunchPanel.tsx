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

    // 코드 블록
    if (line.startsWith("```")) {
      flushPara();
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      if (code.join("").trim()) blocks.push({ type: "codeblock", lang, text: code.join("\n") });
      i++;
      continue;
    }

    // 소소제목
    if (line.startsWith("### ")) {
      flushPara();
      blocks.push({ type: "heading", level: 3, text: stripMd(line.slice(4)) });
      i++; continue;
    }
    // 소제목
    if (line.startsWith("## ")) {
      flushPara();
      blocks.push({ type: "heading", level: 2, text: stripMd(line.slice(3)) });
      i++; continue;
    }
    // h1 무시 (글 제목)
    if (line.startsWith("# ")) { i++; continue; }

    // takeaway
    if (line.startsWith("> !! ") || line === "> !!") {
      flushPara();
      blocks.push({ type: "takeaway", text: stripMd(line.replace(/^> !! ?/, "")) });
      i++; continue;
    }

    // defbox (> 단어란?)
    if (/^> .+란\?/.test(line)) {
      flushPara();
      blocks.push({ type: "defbox", text: stripMd(line.slice(2)) });
      i++; continue;
    }

    // blockquote (여러 줄 합치기)
    if (line.startsWith("> ")) {
      flushPara();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "quote", text: stripMd(quoteLines.join("\n")) });
      continue;
    }

    // 이미지/GIF
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      flushPara();
      const [, alt, url] = imgMatch;
      const isGif = url.includes("giphy.com") || url.toLowerCase().endsWith(".gif");
      blocks.push(isGif ? { type: "gif", alt, url } : { type: "image", alt, url });
      i++; continue;
    }

    // 구분선
    if (line.trim() === "---") {
      flushPara();
      blocks.push({ type: "divider" });
      i++; continue;
    }

    // 리스트 (-/*/1.)
    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && (/^[-*] /.test(lines[i]) || /^\d+\. /.test(lines[i]))) {
        items.push(stripMd(lines[i].replace(/^[-*\d.]+\s/, "")));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // 빈 줄 → 단락 구분
    if (line.trim() === "") {
      flushPara();
      i++; continue;
    }

    paraLines.push(line);
    i++;
  }

  flushPara();
  return blocks;
}

// 연속 paragraph들을 하나로 합치기
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

type Props = { title?: string; body: string };

export default function BrunchPanel({ title, body }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const blocks = useMemo(() => mergeParas(parseBlocks(body)), [body]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => {
    const done = copiedKey === id;
    return (
      <button
        title={done ? "복사됨" : "복사"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
          color: done ? COLORS.success : "#c0c0d0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => copy(text, id)}
      >
        {done ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="2" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    );
  };

  if (!body.trim()) {
    return <div style={{ padding: "14px 16px", color: "#555", fontSize: 13 }}>글 본문이 없어요.</div>;
  }

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>
        블록별로 복사 → 브런치 에디터에 붙여넣기. GIF는 Giphy에서 열어서 직접 저장.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* 대제목 */}
        {title && (
          <div style={row}>
            <div style={{ flex: 1 }}>
              <Tag label="대제목" />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e0e0f0" }}>{title}</div>
            </div>
            <CopyBtn text={title} id="__title__" />
          </div>
        )}

        {blocks.map((block, i) => {
          const key = String(i);

          if (block.type === "divider") {
            return <div key={key} style={{ borderTop: "1px solid #2a2a4a", margin: "2px 0" }} />;
          }

          if (block.type === "heading") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label={block.level === 2 ? "소제목" : "소소제목"} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#c0c0f0" }}>{block.text}</div>
                </div>
                <CopyBtn text={block.text} id={key} />
              </div>
            );
          }

          if (block.type === "paragraph") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label="본문" />
                  <div style={{ fontSize: 13, color: "#a0a0c0", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{block.text}</div>
                </div>
                <CopyBtn text={block.text} id={key} />
              </div>
            );
          }

          if (block.type === "quote") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label="인용구" />
                  <div style={{ fontSize: 13, color: "#8080b0", fontStyle: "italic", paddingLeft: 8, borderLeft: "2px solid #4a4a8a" }}>{block.text}</div>
                </div>
                <CopyBtn text={block.text} id={key} />
              </div>
            );
          }

          if (block.type === "defbox") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label="단어 설명" />
                  <div style={{ fontSize: 13, color: "#8080b0", paddingLeft: 8, borderLeft: "2px solid #5a5a9a" }}>{block.text}</div>
                </div>
                <CopyBtn text={block.text} id={key} />
              </div>
            );
          }

          if (block.type === "takeaway") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label="Takeaway" color="#c9a94a" />
                  <div style={{ fontSize: 13, color: "#c9a94a", paddingLeft: 8, borderLeft: "2px solid #c9a94a" }}>{block.text}</div>
                </div>
                <CopyBtn text={block.text} id={key} />
              </div>
            );
          }

          if (block.type === "list") {
            const listText = block.items.map(it => `• ${it}`).join("\n");
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label="목록" />
                  <div style={{ fontSize: 13, color: "#a0a0c0", lineHeight: 1.8 }}>
                    {block.items.map((it, j) => <div key={j}>• {it}</div>)}
                  </div>
                </div>
                <CopyBtn text={listText} id={key} />
              </div>
            );
          }

          if (block.type === "codeblock") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label={block.lang ? `코드 (${block.lang})` : "코드"} />
                  <pre style={{ fontSize: 11, color: "#7070a0", fontFamily: "'Fira Code', monospace", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" as const }}>{block.text}</pre>
                </div>
                <CopyBtn text={block.text} id={key} />
              </div>
            );
          }

          if (block.type === "gif") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label="GIF" color="#6a6aaa" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={block.url} alt={block.alt} style={{ maxWidth: 100, maxHeight: 70, objectFit: "cover" as const, borderRadius: 4, display: "block", marginBottom: 4 }} />
                  <div style={{ fontSize: 11, color: "#6060a0" }}>{block.alt || "(제목 없음)"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 4, flexShrink: 0 }}>
                  <a href={block.url} target="_blank" rel="noopener noreferrer"
                    style={{ ...S.smallBtn, fontSize: 10, padding: "3px 9px", textDecoration: "none", textAlign: "center" as const, color: "#c0c0f0", borderColor: "#3a3a6a" }}>
                    Giphy 열기
                  </a>
                  <CopyBtn text={block.url} id={key} />
                </div>
              </div>
            );
          }

          if (block.type === "image") {
            return (
              <div key={key} style={row}>
                <div style={{ flex: 1 }}>
                  <Tag label="이미지" />
                  <div style={{ fontSize: 12, color: "#6060a0", wordBreak: "break-all" as const }}>{block.alt || block.url}</div>
                </div>
                <CopyBtn text={block.url} id={key} />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function Tag({ label, color = "#555" }: { label: string; color?: string }) {
  return <div style={{ fontSize: 10, color, marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{label}</div>;
}

const row: React.CSSProperties = {
  background: "#0e0e18",
  border: "1px solid #1e1e2e",
  borderRadius: 8,
  padding: "10px 12px",
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
};
