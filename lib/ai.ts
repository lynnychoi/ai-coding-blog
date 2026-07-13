import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateFromLog(
  devLog: string,
  systemPrompt: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: "user", content: `Here is a development log:\n\n${devLog}\n\nPlease generate content based on the instructions.` }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

export function readDevLog(): string {
  return fs.readFileSync("logs/dev-log.md", "utf-8");
}
