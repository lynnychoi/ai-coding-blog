# AI Coding Learning Blog

This repository documents the architecture and workflow for a blog that
automatically turns development logs into readable blog posts using AI.

Core idea: While building projects with AI tools, development logs are
written. Those logs are automatically converted into structured blog
posts.

## Folder Structure

ai-coding-blog/

app/ \# Next.js app routes content/ posts/ \# Generated blog posts
(markdown) logs/ dev-log.md \# Daily development logs scripts/
generatePost.ts \# Convert dev logs → blog posts docs/ \# Project
documentation lib/ ai.ts \# AI utilities styles/ \# Styling (Tailwind)

## Workflow

Development

→ Write dev log

→ AI summarizes and structures the content

→ Markdown blog post generated

→ Blog automatically displays post

## Technology Stack

Frontend: Next.js\
Styling: Tailwind CSS\
Backend: Supabase\
Deployment: Vercel

AI: Claude Code

This blog acts as a **public learning archive of AI-assisted
development**.
