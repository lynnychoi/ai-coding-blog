import { getProject, getPublishedProjects } from "../../../lib/projects";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import MarkdownRenderer from "../../components/MarkdownRenderer";

const SITE_URL = "https://ai-coding-blog.vercel.app";

export async function generateStaticParams() {
  return (await getPublishedProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return {
    title: `${project.name} — Lynn.ai`,
    description: project.tagline,
    openGraph: {
      title: project.name,
      description: project.tagline,
      url: `${SITE_URL}/projects/${slug}`,
      siteName: "Lynn.ai",
      locale: "ko_KR",
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project || project.visibility === "unpublished") notFound();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <a href="/projects" className="back-link">← Projects</a>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          flexWrap: "wrap", marginBottom: "1rem"
        }}>
          <span style={{
            fontSize: "0.72rem", color: "var(--text-3)",
            fontFamily: "'Fira Code', monospace"
          }}>
            {project.year}
          </span>
          <span style={{ color: "var(--border-hover)", fontSize: "0.8rem" }}>·</span>
          <span className={`project-status status-${project.status}`}>{project.status}</span>
        </div>

        <h1 style={{
          fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          marginBottom: "0.75rem",
          color: "var(--text)",
        }}>
          {project.name}
        </h1>

        <p style={{
          fontSize: "1.05rem",
          color: "var(--text-2)",
          lineHeight: 1.55,
          marginBottom: "0.5rem",
        }}>
          {project.tagline}
        </p>

        {project.links.length > 0 && (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
            {project.links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                  background: "var(--accent-dim)",
                  padding: "0.4rem 0.9rem",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontFamily: "'Fira Code', monospace",
                }}>
                {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      <MarkdownRenderer content={project.content} />
    </div>
  );
}
