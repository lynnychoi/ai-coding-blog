import matter from "gray-matter";

const GH_OWNER = "lynnychoi";
const GH_REPO = "ai-coding-blog";
const GH_BRANCH = "main";
const GH_PROJECTS_PATH = "content/projects";
const CACHE_TTL = 30_000;

export type ProjectStatus = "in-progress" | "live" | "archived";
export type ProjectVisibility = "published" | "unpublished";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectMeta {
  slug: string;
  name: string;
  tagline: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  order: number;
  year: string;
  links: ProjectLink[];
}

export interface Project extends ProjectMeta {
  content: string;
}

let _metaCache: { data: ProjectMeta[]; at: number } | null = null;
const _rawCache = new Map<string, { raw: string; at: number }>();

export function invalidateProjectsCache() {
  _metaCache = null;
  _rawCache.clear();
}

function ghHeaders() {
  return {
    Authorization: `token ${process.env.GH_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ai-coding-blog",
  };
}

async function fetchFilenames(): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PROJECTS_PATH}?ref=${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" } as unknown as RequestInit
  );
  if (!res.ok) return [];
  const files = await res.json() as Array<{ name: string; type: string }>;
  return files
    .filter((f) => f.type === "file" && f.name.endsWith(".md"))
    .map((f) => f.name);
}

async function fetchRaw(slug: string): Promise<string | null> {
  const cached = _rawCache.get(slug);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.raw;

  const res = await fetch(
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_PROJECTS_PATH}/${slug}.md?ref=${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" } as unknown as RequestInit
  );
  if (!res.ok) return null;
  const data = await res.json() as { content: string };
  const raw = Buffer.from(data.content, "base64").toString("utf-8");
  _rawCache.set(slug, { raw, at: Date.now() });
  return raw;
}

function parseMeta(slug: string, raw: string): ProjectMeta {
  const { data } = matter(raw);
  return {
    slug,
    name: String(data.name || slug),
    tagline: String(data.tagline || ""),
    status: (data.status === "live" || data.status === "archived" ? data.status : "in-progress") as ProjectStatus,
    visibility: (data.visibility === "unpublished" ? "unpublished" : "published") as ProjectVisibility,
    order: typeof data.order === "number" ? data.order : 999,
    year: String(data.year || ""),
    links: Array.isArray(data.links) ? data.links : [],
  };
}

export async function getAllProjects(): Promise<ProjectMeta[]> {
  if (_metaCache && Date.now() - _metaCache.at < CACHE_TTL) {
    return _metaCache.data;
  }

  const filenames = await fetchFilenames();
  const results = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = await fetchRaw(slug);
      if (!raw) return null;
      return parseMeta(slug, raw);
    })
  );

  const data = results
    .filter((p): p is ProjectMeta => p !== null)
    .sort((a, b) => a.order - b.order);

  _metaCache = { data, at: Date.now() };
  return data;
}

export async function getPublishedProjects(): Promise<ProjectMeta[]> {
  return (await getAllProjects()).filter((p) => p.visibility === "published");
}

export async function getProject(slug: string): Promise<Project | null> {
  const raw = await fetchRaw(slug);
  if (!raw) return null;
  const { content } = matter(raw);
  return { ...parseMeta(slug, raw), content };
}
