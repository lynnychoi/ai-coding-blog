import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostType = "dev" | "writing";
export type WritingCategory = "diary" | "essay" | "note";

export interface PostMeta {
  slug: string;
  date: string;
  title: string;
  tags: string[];
  readingTime: number;
  type: PostType;
  category?: WritingCategory;
  excerpt?: string;
}

export function getExcerpt(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("---")) continue;
    // 마크다운 문법 제거
    const clean = trimmed
      .replace(/!\[.*?\]\(.*?\)/g, "")  // 이미지
      .replace(/\[.*?\]\(.*?\)/g, "")   // 링크
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .trim();
    if (clean.length > 10) return clean;
  }
  return "";
}

export interface Post extends PostMeta {
  content: string;
}

export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
      const { data, content } = matter(raw);

      // Extract title from first h1 if not in frontmatter
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = data.title || titleMatch?.[1] || slug;

      const date = data.date instanceof Date
        ? data.date.toISOString().substring(0, 10)
        : String(data.date || slug.substring(0, 10));

      return {
        slug,
        date,
        title,
        tags: data.tags || [],
        readingTime: getReadingTime(content),
        type: (data.type === "writing" ? "writing" : "dev") as PostType,
        category: data.category,
        excerpt: getExcerpt(content),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = data.title || titleMatch?.[1] || slug;

  const date = data.date instanceof Date
    ? data.date.toISOString().substring(0, 10)
    : String(data.date || slug.substring(0, 10));

  return {
    slug,
    date,
    title,
    tags: data.tags || [],
    readingTime: getReadingTime(content),
    type: (data.type === "writing" ? "writing" : "dev") as PostType,
    category: data.category,
    content,
  };
}
