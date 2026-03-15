import { PipelineLogger } from "./logger";

// ---------------------------------------------------------------------------
// Fetch trending crypto topics from NewsAPI
// ---------------------------------------------------------------------------

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: { name: string };
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

/**
 * Fetches trending cryptocurrency news from NewsAPI and returns a topic
 * string suitable for article generation.
 */
export async function fetchTrendingTopic(
  logger: PipelineLogger
): Promise<{ topic: string; sourceHeadlines: string[] }> {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    logger.warn("NEWSAPI_KEY not set — using fallback topic list");
    return getFallbackTopic(logger);
  }

  try {
    logger.info("Fetching trending crypto topics from NewsAPI...");

    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", "cryptocurrency OR bitcoin OR ethereum OR crypto exchange");
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "10");
    url.searchParams.set("apiKey", apiKey);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "CryptoCompareAI/1.0" },
    });

    if (!res.ok) {
      logger.warn(`NewsAPI returned ${res.status} — falling back to defaults`);
      return getFallbackTopic(logger);
    }

    const data: NewsApiResponse = await res.json();

    if (!data.articles || data.articles.length === 0) {
      logger.warn("NewsAPI returned no articles — falling back to defaults");
      return getFallbackTopic(logger);
    }

    const headlines = data.articles
      .map((a) => a.title)
      .filter(Boolean)
      .slice(0, 5);

    logger.info(`Found ${headlines.length} trending headlines`);

    // Synthesize a topic from the top headlines
    const topic = `Write an informative blog article inspired by these trending cryptocurrency headlines:\n${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}\n\nCreate a unique article that covers the key themes from these headlines. Focus on exchange-related angles where possible.`;

    return { topic, sourceHeadlines: headlines };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`NewsAPI fetch failed: ${message}`);
    return getFallbackTopic(logger);
  }
}

// ---------------------------------------------------------------------------
// Fallback topics when NewsAPI is unavailable
// ---------------------------------------------------------------------------

const FALLBACK_TOPICS = [
  "The latest trends in cryptocurrency exchange regulation and what they mean for traders in 2025",
  "How zero-fee trading is reshaping the crypto exchange landscape",
  "The rise of hybrid exchanges: combining CeFi convenience with DeFi security",
  "Layer 2 solutions and their impact on exchange trading fees",
  "Institutional adoption of crypto exchanges: what retail traders should know",
  "The future of cross-chain trading on centralized exchanges",
  "How AI is transforming crypto trading strategies and exchange features",
  "Stablecoin trading pairs: why they matter for exchange selection",
  "The evolution of mobile crypto trading apps and exchange UX",
  "Proof of reserves: how exchanges are rebuilding trust after FTX",
];

function getFallbackTopic(
  logger: PipelineLogger
): { topic: string; sourceHeadlines: string[] } {
  const idx = Math.floor(Math.random() * FALLBACK_TOPICS.length);
  const topic = FALLBACK_TOPICS[idx];
  logger.info(`Using fallback topic: "${topic}"`);
  return { topic, sourceHeadlines: [`[Fallback] ${topic}`] };
}
