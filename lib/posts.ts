import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  date: string;
  title: string;
  tags: string[];
}

export interface Post extends PostMeta {
  content: string;
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
    content,
  };
}
