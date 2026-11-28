"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import type { Components } from "react-markdown";

const DEF_PATTERN = /^[^\s].*?(란[?:]|이란[?:])/;

function extractBlockquoteText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractBlockquoteText).join("");
  if (children && typeof children === "object" && "props" in (children as object)) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    return extractBlockquoteText(el.props.children);
  }
  return "";
}

const markdownComponents: Components = {
  blockquote({ children }) {
    const text = extractBlockquoteText(children);
    const trimmed = text.trimStart();
    if (trimmed.startsWith("!! ")) {
      return <div className="takeaway-box">{trimmed.slice(3).trim()}</div>;
    }
    const isDef = DEF_PATTERN.test(trimmed);
    if (isDef) {
      const match = trimmed.match(/^([\s\S]*?(?:란[?:]|이란[?:]))\s*([\s\S]*)/);
      if (match) {
        return (
          <div className="def-box">
            <span className="def-box-prefix">// </span>
            <span className="def-box-term">{match[1]}</span>
            {match[2] ? " " + match[2] : ""}
          </div>
        );
      }
      return <div className="def-box"><span className="def-box-prefix">// </span>{children}</div>;
    }
    return <blockquote>{children}</blockquote>;
  },
  img({ src, alt }) {
    if (!alt) return <img src={src} alt="" />;
    return (
      <figure className="post-figure">
        <img src={src} alt={alt} />
        <figcaption>{alt}</figcaption>
      </figure>
    );
  },
  // 이미지만 있는 단락은 <p> 대신 fragment로 — <p> 안에 <figure> 금지(HTML 규칙)
  p({ children, node }) {
    const isImageOnly = node?.children?.every(
      n => (n.type === "element" && (n as { tagName?: string }).tagName === "img") ||
           (n.type === "text" && (n as { value?: string }).value?.trim() === "")
    );
    if (isImageOnly) return <>{children}</>;
    return <p>{children}</p>;
  },
};

interface Props {
  content: string;
  isWriting?: boolean;
}

export default function MarkdownRenderer({ content, isWriting }: Props) {
  return (
    <article className={isWriting ? "post-body writing-body" : "post-body"}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
