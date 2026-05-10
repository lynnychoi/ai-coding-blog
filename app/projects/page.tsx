import Link from "next/link";
import { getPublishedProjects } from "../../lib/projects";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: "3rem" }}>
      <p className="section-label">Projects</p>
      <h1 style={{
        fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        marginBottom: "0.5rem",
        color: "var(--text)",
      }}>
        만들고 있는 것들
      </h1>
      <p style={{
        fontSize: "0.85rem",
        color: "var(--text-3)",
        fontFamily: "'Fira Code', monospace",
        marginBottom: "3.5rem",
      }}>
        {projects.length} projects
      </p>

      {projects.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>아직 공개된 프로젝트가 없어요.</p>
      ) : (
        <div className="projects-list">
          {projects.map((p) => {
            const hasDetail = true;
            const isInactive = p.status === "in-progress" && p.links.length === 0;
            const Wrapper: React.ElementType = isInactive ? "div" : Link;
            const wrapperProps = isInactive ? {} : { href: `/projects/${p.slug}` };

            return (
              <Wrapper
                key={p.slug}
                {...wrapperProps}
                className={`project-row ${isInactive ? "project-row-inactive" : ""}`}
              >
                <span className="project-year">{p.year}</span>
                <div className="project-content">
                  <div className="project-name-row">
                    <span className="project-name">{p.name}</span>
                    <span className={`project-status status-${p.status}`}>{p.status}</span>
                  </div>
                  <span className="project-tagline">{p.tagline}</span>
                </div>
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
