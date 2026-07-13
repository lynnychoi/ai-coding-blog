import { generateFromLog, readDevLog } from "../lib/ai";
import fs from "fs";
import path from "path";

const SYSTEM_PROMPT = `You are a developer blog writer. Convert the given dev log into a structured blog post using this exact format:

# [Title]

## Problem
Explain what problem occurred or what was being built.

## Solution
Explain how it was solved or built.

## Code Example
Include relevant code snippets if applicable.

## What I Learned
Explain the key takeaway.

## One-line Summary
Summarize the lesson in one sentence.

Writing style:
- Short paragraphs
- Clear explanations
- Developer friendly
- Practical examples
- No unnecessary fluff

Also add frontmatter at the top:
---
date: [YYYY-MM-DD]
tags: [relevant, tags]
---`;

async function main() {
  const devLog = readDevLog();
  const post = await generateFromLog(devLog, SYSTEM_PROMPT);

  const date = new Date().toISOString().split("T")[0];
  const filename = `${date}-post.md`;
  const outputPath = path.join("content", "posts", filename);

  fs.writeFileSync(outputPath, post);
  console.log(`Blog post generated: ${outputPath}`);
}

main().catch(console.error);
