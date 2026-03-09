import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

const client = new Anthropic();

export async function generateFromLog(
  devLog: string,
  systemPrompt: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Here is a development log:\n\n${devLog}\n\nPlease generate content based on the instructions.`,
      },
    ],
    system: systemPrompt,
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

export function readDevLog(): string {
  return fs.readFileSync("logs/dev-log.md", "utf-8");
}
