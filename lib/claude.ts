import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

/**
 * Given free-form campground text, ask Claude Haiku to extract 6–8 semantic
 * keywords suitable for a PostgreSQL websearch_to_tsquery expansion.
 * Returns null when ANTHROPIC_API_KEY is unset (semantic search degrades
 * gracefully to a plain full-text query on the original text).
 */
export async function expandQuery(text: string): Promise<string | null> {
  if (!anthropic) return null;

  const start = Date.now();
  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 80,
    messages: [
      {
        role: "user",
        content: `You are a search-keyword extractor for an outdoor camping platform.
Extract 6-8 concise, relevant keywords from the text below that would help find
similar campgrounds. Return ONLY a space-separated list of lowercase keywords —
no bullets, no punctuation, no explanation.

Text: ${text.slice(0, 600)}`,
      },
    ],
  });

  const ms = Date.now() - start;
  const block = msg.content[0];
  if (block.type !== "text") return null;

  const keywords = block.text.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, " ");
  console.info(`[claude:expand] latency_ms=${ms} keywords="${keywords}"`);
  return keywords || null;
}
