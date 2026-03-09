import { getPost, getAllPosts } from "../../../lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Comments from "../../components/Comments";

const TAG_COLORS: Record<string, string> = {
  "setup":      "#fbbf24",
  "next.js":    "#60a5fa",
  "claude-api": "#a78bfa",
  "automation": "#34d399",
  "supabase":   "#4ade80",
  "vercel":     "#f472b6",
};

function tagColor(tag: string) {
  return TAG_COLORS[tag] ?? "#94a3b8";
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      <a href="/" className="back-link">← 글 목록</a>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.78rem", color: "var(--text-faint)" }}>{post.date}</span>
        {post.tags.map((tag) => (
          <a key={tag} href={`/tags/${tag}`} style={{
            fontSize: "0.7rem", fontWeight: 600,
            padding: "0.15rem 0.5rem", borderRadius: "999px",
            color: tagColor(tag),
            background: tagColor(tag) + "18",
            border: `1px solid ${tagColor(tag)}30`,
            textDecoration: "none"
          }}>
            {tag}
          </a>
        ))}
      </div>

      <article className="post-body">
        <style>{`
          .post-body h1 {
            font-size: clamp(1.4rem, 5vw, 1.9rem);
            font-weight: 800; letter-spacing: -0.03em;
            line-height: 1.2; margin: 0 0 1.75rem;
            background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          }
          .post-body h2 {
            font-size: 1.1rem; font-weight: 700; color: #e2e8f0;
            margin: 2rem 0 0.6rem; padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border); letter-spacing: -0.02em;
          }
          .post-body h3 {
            font-size: 0.95rem; font-weight: 600; color: #cbd5e1;
            margin: 1.5rem 0 0.4rem;
          }
          .post-body p { color: #cbd5e1; margin: 0.8rem 0; line-height: 1.8; }
          .post-body a { color: var(--accent-blue); text-decoration: none; }
          .post-body a:hover { text-decoration: underline; }
          .post-body strong { color: #f1f5f9; font-weight: 600; }
          .post-body em { color: #94a3b8; }
          .post-body del { color: var(--text-faint); }
          .post-body code:not(pre code) {
            font-family: 'Fira Code', monospace; font-size: 0.82em;
            background: #1e293b; color: var(--accent-yellow);
            padding: 0.15em 0.4em; border-radius: 4px; border: 1px solid #334155;
            word-break: break-all;
          }
          .post-body pre {
            background: #0d1117 !important; border: 1px solid var(--border);
            border-radius: 10px; padding: 1rem 1.25rem;
            overflow-x: auto; margin: 1.25rem 0;
          }
          .post-body pre code {
            font-family: 'Fira Code', monospace; font-size: 0.82rem;
            background: transparent !important;
          }
          .post-body blockquote {
            border-left: 3px solid var(--accent-purple); margin: 1.25rem 0;
            padding: 0.6rem 1rem; background: rgba(167,139,250,0.06);
            border-radius: 0 8px 8px 0; color: #94a3b8;
          }
          .post-body ul, .post-body ol { padding-left: 1.4rem; margin: 0.6rem 0; }
          .post-body li { margin: 0.3rem 0; color: #cbd5e1; }
          .post-body li input[type="checkbox"] { margin-right: 0.4rem; accent-color: var(--accent-purple); }
          .post-body table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.85rem; display: block; overflow-x: auto; }
          .post-body th {
            background: #1e293b; padding: 0.5rem 0.75rem; text-align: left;
            font-weight: 600; color: #e2e8f0; border-bottom: 1px solid var(--border);
            white-space: nowrap;
          }
          .post-body td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); color: #cbd5e1; }
          .post-body tr:last-child td { border-bottom: none; }
          .post-body hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
          .post-body img { max-width: 100%; border-radius: 10px; margin: 1.25rem 0; border: 1px solid var(--border); height: auto; }

          @media (max-width: 640px) {
            .post-body pre { padding: 0.875rem 1rem; border-radius: 8px; }
            .post-body pre code { font-size: 0.78rem; }
            .post-body blockquote { padding: 0.5rem 0.875rem; }
          }
        `}</style>

        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </article>

      <div style={{ marginTop: "3.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <a href="/" className="back-link" style={{ marginTop: 0, marginBottom: 0 }}>← 글 목록으로</a>
      </div>

      <Comments slug={slug} />
    </div>
  );
}
