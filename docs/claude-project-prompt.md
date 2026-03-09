# Claude Code Project Initialization Prompt

Use the following prompt when starting the project with Claude Code.

------------------------------------------------------------------------

You are helping build a personal AI coding learning blog.

Goal: Create a blog that automatically records what I learn while coding
with AI.

Main concept: While developing projects, logs are generated. The system
automatically converts those logs into readable blog posts.

Requirements:

1.  Blog Website

-   Clean developer blog
-   Markdown based
-   Post list page
-   Post detail page
-   Tag and category system
-   Chronological order

2.  Auto Learning Log System While coding, I will write short dev logs.

Example:

Today: - Fixed Supabase auth issue - Learned Next.js middleware -
Generated migration with Claude Code

The system should convert this into a structured blog post.

3.  Blog Post Structure

Title

Problem Explain what problem occurred

Solution Explain how it was solved

Code Example

What I Learned

Summary

4.  Writing Style

Posts must be: - Easy to read - Short paragraphs - Clear explanations -
Developer friendly

5.  Auto Metadata

Generate automatically: - title - tags - category - date

Example:

title: Supabase Auth Fix tags: supabase, auth, nextjs category: AI
Coding Learning date: YYYY-MM-DD

6.  Dev Log to Blog Conversion

Dev logs should be transformed into markdown blog posts automatically.

7.  Technology Stack

Frontend: Next.js Styling: Tailwind Backend: Supabase Deployment: Vercel

Focus: This blog is an AI-assisted coding learning archive.
