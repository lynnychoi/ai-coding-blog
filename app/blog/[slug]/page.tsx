import { getPost, getAllPosts } from "../../../lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Comments from "../../components/Comments";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <a href="/" className="back-link">← Back</a>

      {/* Post meta */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          flexWrap: "wrap", marginBottom: "1.25rem"
        }}>
          <span style={{
            fontSize: "0.72rem", color: "var(--text-3)",
            fontFamily: "'Fira Code', monospace"
          }}>
            {post.date}
          </span>
          <span style={{ color: "var(--border-hover)", fontSize: "0.8rem" }}>·</span>
          <span style={{
            fontSize: "0.72rem", color: "var(--text-3)",
            fontFamily: "'Fira Code', monospace"
          }}>
            {post.readingTime}min read
          </span>
          {post.tags.map((tag) => (
            <a key={tag} href={`/tags/${tag}`} className="tag-pill">
              {tag}
            </a>
          ))}
        </div>
      </div>

      <article className="post-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </article>

      <div style={{
        marginTop: "3.5rem", paddingTop: "1.25rem",
        borderTop: "1px solid var(--border)"
      }}>
        <a href="/" className="back-link" style={{ marginTop: 0, marginBottom: 0 }}>← Back to posts</a>
      </div>

      <Comments slug={slug} />
    </div>
  );
}
