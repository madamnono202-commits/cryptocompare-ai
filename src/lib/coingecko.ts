// ---------------------------------------------------------------------------
// CoinGecko API Service with Redis Caching
// ---------------------------------------------------------------------------
// Uses CoinGecko's free API to fetch cryptocurrency market data.
// All responses are cached in Redis with configurable TTLs.
// Falls back to cached data when the API is unavailable.
// ---------------------------------------------------------------------------

import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  market_cap_rank: number | null;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_30d: number | null;
    price_change_percentage_1y: number | null;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_change_percentage: { usd: number };
    atl_date: { usd: string };
    fully_diluted_valuation: { usd: number | null };
  };
  tickers: CoinTicker[];
  links: {
    homepage: string[];
    blockchain_site: string[];
    subreddit_url: string;
    repos_url: { github: string[] };
  };
  categories: string[];
}

export interface CoinTicker {
  base: string;
  target: string;
  market: {
    name: string;
    identifier: string;
    has_trading_incentive: boolean;
  };
  last: number;
  volume: number;
  converted_last: { usd: number };
  converted_volume: { usd: number };
  trust_score: string | null;
  bid_ask_spread_percentage: number | null;
  timestamp: string;
  trade_url: string | null;
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// ---------------------------------------------------------------------------
// Cache TTLs (in seconds)
// ---------------------------------------------------------------------------

const CACHE_TTL = {
  MARKET_LIST: 120,       // 2 minutes for market list
  COIN_DETAIL: 180,       // 3 minutes for coin details
  MARKET_CHART: 300,      // 5 minutes for chart data
} as const;

// ---------------------------------------------------------------------------
// Redis helper — graceful when env vars are missing
// ---------------------------------------------------------------------------

function getRedisClient(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    if (!redis) return null;
    const data = await redis.get<T>(key);
    return data;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    await redis.set(key, data, { ex: ttl });
  } catch {
    // Silently fail — caching is best-effort
  }
}

// ---------------------------------------------------------------------------
// CoinGecko API base
// ---------------------------------------------------------------------------

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

async function fetchCoinGecko<T>(path: string): Promise<T> {
  const url = `${COINGECKO_BASE}${path}`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 0 }, // disable Next.js fetch cache; we use Redis
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Fetch top coins by market cap (paginated, up to 250 per page).
 * We fetch 200 coins in total (page 1 = 200).
 */
export async function getMarketData(
  page = 1,
  perPage = 200,
  currency = "usd"
): Promise<CoinMarketData[]> {
  const cacheKey = `coingecko:markets:${currency}:${page}:${perPage}`;

  // Try cache first
  const cached = await getCached<CoinMarketData[]>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchCoinGecko<CoinMarketData[]>(
      `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`
    );
    await setCache(cacheKey, data, CACHE_TTL.MARKET_LIST);
    return data;
  } catch (error) {
    // If API fails, try returning stale cache (no TTL check)
    const stale = await getCached<CoinMarketData[]>(cacheKey);
    if (stale) return stale;
    throw error;
  }
}

/**
 * Fetch detailed info for a single coin by its CoinGecko ID.
 */
export async function getCoinDetail(coinId: string): Promise<CoinDetail> {
  const cacheKey = `coingecko:coin:${coinId}`;

  const cached = await getCached<CoinDetail>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchCoinGecko<CoinDetail>(
      `/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    await setCache(cacheKey, data, CACHE_TTL.COIN_DETAIL);
    return data;
  } catch (error) {
    const stale = await getCached<CoinDetail>(cacheKey);
    if (stale) return stale;
    throw error;
  }
}

/**
 * Fetch historical market chart data (price, volume, market cap).
 * @param days — number of days of data (1, 7, 30, 90, 365, max)
 */
export async function getMarketChart(
  coinId: string,
  days: number | string = 7,
  currency = "usd"
): Promise<MarketChartData> {
  const cacheKey = `coingecko:chart:${coinId}:${days}:${currency}`;

  const cached = await getCached<MarketChartData>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchCoinGecko<MarketChartData>(
      `/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`
    );
    await setCache(cacheKey, data, CACHE_TTL.MARKET_CHART);
    return data;
  } catch (error) {
    const stale = await getCached<MarketChartData>(cacheKey);
    if (stale) return stale;
    throw error;
  }
}
