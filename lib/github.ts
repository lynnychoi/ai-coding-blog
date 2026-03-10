const OWNER = "lynnychoi";
const REPO = "ai-coding-blog";
const BRANCH = "main";

function headers() {
  return {
    Authorization: `token ${process.env.GH_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ai-coding-blog",
  };
}

export async function getGitHubFile(
  filePath: string
): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`,
    { headers: headers() }
  );
  if (!res.ok) return null;
  const data = await res.json() as { content: string; sha: string };
  return {
    content: Buffer.from(data.content, "base64").toString("utf-8"),
    sha: data.sha,
  };
}

export async function commitToGitHub(
  filePath: string,
  content: string,
  message: string
): Promise<void> {
  const existing = await getGitHubFile(filePath);

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch: BRANCH,
  };
  if (existing?.sha) body.sha = existing.sha;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
    { method: "PUT", headers: headers(), body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub commit failed: ${err}`);
  }
}
