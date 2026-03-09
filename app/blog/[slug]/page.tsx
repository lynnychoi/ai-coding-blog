import { getPost, getAllPosts } from "../../../lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Comments from "../../components/Comments";
import ReadingProgress from "../../components/ReadingProgress";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const isWriting = post.type === "writing";

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
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </article>

      <div style={{
        marginTop: "3.5rem", paddingTop: "1.25rem",
        borderTop: "1px solid var(--border)"
      }}>
        <a href={isWriting ? "/writings" : "/blog"} className="back-link" style={{ marginTop: 0, marginBottom: 0 }}>
          ← {isWriting ? "Writing으로" : "Dev Log로"}
        </a>
      </div>

      <Comments slug={slug} />
    </div>
  );
}
