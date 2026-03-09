import { generateFromLog, readDevLog } from "../lib/ai";

const TWEET_PROMPT = `You are a developer creating a Twitter/X thread from a dev log.

Rules:
- Max 5 tweets
- Each tweet under 280 characters
- Start with a hook tweet that grabs attention
- End with a key lesson or takeaway
- Use numbered format: 1/, 2/, etc.
- Developer-friendly tone
- No hashtag spam (max 2-3 relevant tags on last tweet)

Output only the tweets, numbered.`;

const SUMMARY_PROMPT = `You are a developer writing a short summary of a dev log.

Output:
- 2-3 sentence plain English summary
- What was built or fixed
- The key lesson learned

Keep it concise. No fluff.`;

async function main() {
  const devLog = readDevLog();

  const [thread, summary] = await Promise.all([
    generateFromLog(devLog, TWEET_PROMPT),
    generateFromLog(devLog, SUMMARY_PROMPT),
  ]);

  console.log("=== TWITTER THREAD ===\n");
  console.log(thread);
  console.log("\n=== SHORT SUMMARY ===\n");
  console.log(summary);
}

main().catch(console.error);
