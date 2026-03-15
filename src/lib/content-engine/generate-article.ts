import Anthropic from "@anthropic-ai/sdk";
import { PipelineLogger } from "./logger";

// ---------------------------------------------------------------------------
// Generate a blog article using Claude API
// ---------------------------------------------------------------------------

/** The structured JSON content format used by the blog renderer. */
interface GeneratedArticle {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  /** JSON-stringified array of blog content sections */
  content: string;
}

/**
 * System prompt that instructs Claude to produce a structured blog article
 * in the JSON section format expected by the blog content renderer.
 */
const SYSTEM_PROMPT = `You are a professional cryptocurrency journalist writing for CryptoCompare AI, a crypto exchange comparison and affiliate platform.

Your task is to write a comprehensive, well-structured blog article (1500–2000 words) in a specific JSON format.

The article content must be a JSON array of sections. Each section is an object with a "type" field. The valid section types are:

1. {"type":"heading","level":2,"id":"kebab-case-id","text":"Heading Text"}
2. {"type":"heading","level":3,"id":"kebab-case-id","text":"Sub-heading Text"}
3. {"type":"paragraph","text":"Paragraph text here. Can include basic facts and analysis."}
4. {"type":"list","items":["Item 1","Item 2","Item 3"]}
5. {"type":"affiliate_cta","exchangeSlug":"binance","heading":"Try Binance Today","text":"Start trading on one of the world's largest exchanges.","ctaLabel":"Visit Binance"}
6. {"type":"internal_link","href":"/compare","text":"Compare exchanges side by side"}

Rules:
- Use 4–6 level-2 headings to structure the article.
- Use level-3 sub-headings where appropriate.
- Include 2–3 affiliate_cta blocks spread throughout the article, using these exchange slugs: binance, coinbase, kraken, bybit, okx, kucoin.
- Include 1–2 internal_link blocks pointing to /compare, /exchanges, /offers, or /blog.
- Keep the tone informative, balanced, and authoritative.
- Do NOT use markdown. All formatting is done via the JSON section types.
- The heading ids must be unique kebab-case strings.

Respond with ONLY a valid JSON object (no markdown code fences) with these fields:
{
  "title": "Article Title (50-70 chars)",
  "slug": "kebab-case-url-slug",
  "metaTitle": "SEO Meta Title (50-60 chars)",
  "metaDescription": "SEO meta description (150-160 chars)",
  "category": "one of: guides, education, security, news, analysis",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "content": [array of section objects]
}`;

export async function generateArticle(
  topic: string,
  logger: PipelineLogger
): Promise<GeneratedArticle> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  const client = new Anthropic({ apiKey });

  logger.info("Sending topic to Claude API for article generation...");

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Write a blog article about the following topic:\n\n${topic}`,
      },
    ],
  });

  // Extract text content from the response
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API returned no text content");
  }

  const rawText = textBlock.text.trim();
  logger.info(`Received ${rawText.length} chars from Claude API`);

  // Parse the JSON response
  let parsed: {
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    category: string;
    tags: string[];
    content: unknown[];
  };

  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Sometimes Claude wraps JSON in code fences — try stripping them
    const stripped = rawText
      .replace(/^```json?\s*/i, "")
      .replace(/\s*```$/i, "");
    parsed = JSON.parse(stripped);
  }

  // Validate required fields
  if (!parsed.title || !parsed.slug || !parsed.content) {
    throw new Error(
      "Claude response missing required fields (title, slug, content)"
    );
  }

  logger.info(`Generated article: "${parsed.title}" (${parsed.content.length} sections)`);

  return {
    title: parsed.title,
    slug: parsed.slug,
    metaTitle: parsed.metaTitle || parsed.title,
    metaDescription:
      parsed.metaDescription || `Read about ${parsed.title} on CryptoCompare AI`,
    category: parsed.category || "news",
    tags: parsed.tags || [],
    content: JSON.stringify(parsed.content),
  };
}

// ---------------------------------------------------------------------------
// Example prompts (exported for documentation / admin display)
// ---------------------------------------------------------------------------

export const EXAMPLE_PROMPTS = {
  system: SYSTEM_PROMPT,
  userTemplate: `Write a blog article about the following topic:\n\n{topic}`,
};
