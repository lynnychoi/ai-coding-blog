import { getPost, getPublishedPosts, getAdjacentPosts } from "../../../lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import "highlight.js/styles/github-dark.css";
import Comments from "../../components/Comments";
import ReadingProgress from "../../components/ReadingProgress";
import AdminBar from "../../components/AdminBar";

// 단어 설명 패턴: 추출된 텍스트가 "단어란?" 또는 "단어란:" 으로 시작
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
            <span className="def-box-prefix">// </span><span className="def-box-term">{match[1]}</span>{match[2] ? ' ' + match[2] : ''}
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
};

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.status === "unpublished") notFound();

  const isWriting = post.type === "writing";
  const { prev, next } = await getAdjacentPosts(slug, post.type);

  return (
    <div style={{ maxWidth: isWriting ? 600 : 680, margin: "0 auto" }}>
      <ReadingProgress isWriting={isWriting} />
      <a href={isWriting ? "/writings" : "/blog"} className="back-link">
        ← {isWriting ? "Writing" : "Dev Log"}
      </a>

      {/* Post meta */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          flexWrap: "wrap", marginBottom: "1.25rem"
        }}>
          {isWriting && post.category && (
            <span style={{
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#c4b5fd",
              fontFamily: "'Fira Code', monospace"
            }}>
              {post.category}
            </span>
          )}
          <span style={{
            fontSize: "0.72rem", color: "var(--text-3)",
            fontFamily: "'Fira Code', monospace"
          }}>
            {post.date}
          </span>
          {!isWriting && (
            <>
              <span style={{ color: "var(--border-hover)", fontSize: "0.8rem" }}>·</span>
              <span style={{
                fontSize: "0.72rem", color: "var(--text-3)",
                fontFamily: "'Fira Code', monospace"
              }}>
                {post.readingTime}min read
              </span>
              {post.tags.map((tag) => (
                <a key={tag} href={`/tags/${tag}`} className="tag-pill">{tag}</a>
              ))}
            </>
          )}
        </div>
      </div>

      <article className={isWriting ? "post-body writing-body" : "post-body"}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]} components={markdownComponents}>
          {post.content}
        </ReactMarkdown>
      </article>

      <div style={{
        marginTop: "3.5rem", paddingTop: "1.5rem",
        borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: "1rem",
      }}>
        <div style={{ flex: 1 }}>
          {prev ? (
            <a href={`/blog/${prev.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontFamily: "'Fira Code', monospace", display: "block", marginBottom: "0.3rem" }}>← 이전 글</span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-2)", fontWeight: 500, lineHeight: 1.4 }}>{prev.title}</span>
            </a>
          ) : (
            <a href={isWriting ? "/writings" : "/blog"} className="back-link" style={{ marginTop: 0, marginBottom: 0 }}>
              ← {isWriting ? "Writing으로" : "Dev Log로"}
            </a>
          )}
        </div>
        {next && (
          <div style={{ flex: 1, textAlign: "right" }}>
            <a href={`/blog/${next.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontFamily: "'Fira Code', monospace", display: "block", marginBottom: "0.3rem" }}>다음 글 →</span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-2)", fontWeight: 500, lineHeight: 1.4 }}>{next.title}</span>
            </a>
          </div>
        )}
      </div>

      <Comments slug={slug} />
      <AdminBar slug={slug} />
    </div>
  );
}
