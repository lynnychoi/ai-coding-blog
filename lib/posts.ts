import matter from "gray-matter";

const GH_OWNER = "lynnychoi";
const GH_REPO = "ai-coding-blog";
const GH_BRANCH = "main";
const GH_POSTS_PATH = "content/posts";
const CACHE_TTL = 30_000; // 30초

export type PostType = "dev" | "writing";
export type WritingCategory = "diary" | "essay" | "note";
export type PostStatus = "published" | "unpublished";

export interface PostMeta {
  slug: string;
  date: string;
  datetime: string;
  title: string;
  tags: string[];
  readingTime: number;
  type: PostType;
  status: PostStatus;
  category?: WritingCategory;
  excerpt?: string;
}

export interface Post extends PostMeta {
  content: string;
}

// ── 캐시 ──
let _metaCache: { data: PostMeta[]; at: number } | null = null;
const _rawCache = new Map<string, { raw: string; at: number }>();

export function invalidatePostsCache() {
  _metaCache = null;
  _rawCache.clear();
}

// ── 유틸 ──
export function getExcerpt(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("---")) continue;
    const clean = trimmed
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .trim();
    if (clean.length > 10) return clean;
  }
  return "";
}

export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
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
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_POSTS_PATH}?ref=${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" }
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
    `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_POSTS_PATH}/${slug}.md?ref=${GH_BRANCH}`,
    { headers: ghHeaders(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json() as { content: string };
  const raw = Buffer.from(data.content, "base64").toString("utf-8");
  _rawCache.set(slug, { raw, at: Date.now() });
  return raw;
}

function parseMeta(slug: string, raw: string): PostMeta {
  const { data, content } = matter(raw);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = data.title || titleMatch?.[1] || slug;
  const date = data.date instanceof Date
    ? data.date.toISOString().substring(0, 10)
    : String(data.date || slug.substring(0, 10));
  const datetime = data.datetime ? String(data.datetime) : date;
  return {
    slug,
    date,
    datetime,
    title,
    tags: data.tags || [],
    readingTime: getReadingTime(content),
    type: (data.type === "writing" ? "writing" : "dev") as PostType,
    status: (data.status === "unpublished" ? "unpublished" : "published") as PostStatus,
    category: data.category,
    excerpt: getExcerpt(content),
  };
}

// ── Public API ──
export async function getAllPosts(): Promise<PostMeta[]> {
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
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => b.datetime.localeCompare(a.datetime));

  _metaCache = { data, at: Date.now() };
  return data;
}

export async function getPublishedPosts(): Promise<PostMeta[]> {
  return (await getAllPosts()).filter((p) => p.status === "published");
}

export async function getAdjacentPosts(
  slug: string,
  type: PostType
): Promise<{ prev: PostMeta | null; next: PostMeta | null }> {
  const posts = (await getPublishedPosts()).filter((p) => p.type === type);
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: posts[idx + 1] ?? null,
    next: posts[idx - 1] ?? null,
  };
}

export async function getPost(slug: string): Promise<Post | null> {
  const raw = await fetchRaw(slug);
  if (!raw) return null;

  const { data, content } = matter(raw);
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = data.title || titleMatch?.[1] || slug;
  const date = data.date instanceof Date
    ? data.date.toISOString().substring(0, 10)
    : String(data.date || slug.substring(0, 10));
  const datetime = data.datetime ? String(data.datetime) : date;

  return {
    slug,
    date,
    datetime,
    title,
    tags: data.tags || [],
    readingTime: getReadingTime(content),
    type: (data.type === "writing" ? "writing" : "dev") as PostType,
    category: data.category,
    status: (data.status === "unpublished" ? "unpublished" : "published") as PostStatus,
    content,
  };
}
