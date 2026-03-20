import Groq from "groq-sdk";
import fs from "fs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateFromLog(
  devLog: string,
  systemPrompt: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Here is a development log:\n\n${devLog}\n\nPlease generate content based on the instructions.` }],
    max_tokens: 8192,
  });
  return completion.choices[0]?.message?.content || "";
}

export function readDevLog(): string {
  return fs.readFileSync("logs/dev-log.md", "utf-8");
}
