import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChart } from "@/components/prices/price-chart";
import { CoinExchanges } from "@/components/prices/coin-exchanges";
import { getCoinDetail, getMarketChart } from "@/lib/coingecko";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

// ---------------------------------------------------------------------------
// ISR — revalidate every 3 minutes
// ---------------------------------------------------------------------------

export const revalidate = 180;

// ---------------------------------------------------------------------------
// Dynamic metadata for SEO
// ---------------------------------------------------------------------------

interface PageProps {
  params: { coin: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const coin = await getCoinDetail(params.coin);
    return {
      title: `${coin.name} (${coin.symbol.toUpperCase()}) Price`,
      description: `Live ${coin.name} price, market cap, trading volume, price chart, and exchange listings. Track ${coin.symbol.toUpperCase()} in real-time.`,
      openGraph: {
        title: `${coin.name} (${coin.symbol.toUpperCase()}) Price | CryptoCompare AI`,
        description: `Live ${coin.name} price, market cap, and trading data.`,
        images: coin.image.large ? [{ url: coin.image.large }] : [],
      },
    };
  } catch {
    return { title: "Coin Not Found" };
  }
}

// ---------------------------------------------------------------------------
// Stat card helper
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-bold">{value}</p>
        {subValue && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CoinDetailPage({ params }: PageProps) {
  let coin;
  let chartData;

  try {
    [coin, chartData] = await Promise.all([
      getCoinDetail(params.coin),
      getMarketChart(params.coin, 7),
    ]);
  } catch {
    notFound();
  }

  const md = coin.market_data;
  const price = md.current_price.usd;
  const change24h = md.price_change_percentage_24h;
  const isPositive = (change24h ?? 0) >= 0;

  return (
    <Section size="lg">
      <Container>
        {/* Back link */}
        <Link
          href="/prices"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prices
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold sm:text-3xl">
                  {coin.name}
                </h1>
                <Badge variant="secondary" className="uppercase">
                  {coin.symbol}
                </Badge>
                {coin.market_cap_rank && (
                  <Badge variant="outline">#{coin.market_cap_rank}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-extrabold">{formatCurrency(price)}</p>
            <div
              className={`flex items-center justify-end gap-1 text-sm font-medium ${
                isPositive
                  ? "text-[hsl(var(--chart-green))]"
                  : "text-[hsl(var(--chart-red))]"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatPercent(change24h)} (24h)
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Market Cap"
            value={formatCurrency(md.market_cap.usd, { compact: true })}
          />
          <StatCard
            label="24h Volume"
            value={formatCurrency(md.total_volume.usd, { compact: true })}
          />
          <StatCard
            label="24h High / Low"
            value={formatCurrency(md.high_24h.usd)}
            subValue={formatCurrency(md.low_24h.usd)}
          />
          <StatCard
            label="Circulating Supply"
            value={formatNumber(md.circulating_supply, { compact: true })}
            subValue={
              md.max_supply
                ? `Max: ${formatNumber(md.max_supply, { compact: true })}`
                : undefined
            }
          />
          <StatCard
            label="All-Time High"
            value={formatCurrency(md.ath.usd)}
            subValue={formatPercent(md.ath_change_percentage.usd)}
          />
        </div>

        {/* Price change summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "24h", value: md.price_change_percentage_24h },
            { label: "7d", value: md.price_change_percentage_7d },
            { label: "30d", value: md.price_change_percentage_30d },
            { label: "1y", value: md.price_change_percentage_1y },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{label} Change</p>
                <p
                  className={`mt-1 text-lg font-bold ${
                    (value ?? 0) >= 0
                      ? "text-[hsl(var(--chart-green))]"
                      : "text-[hsl(var(--chart-red))]"
                  }`}
                >
                  {formatPercent(value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Price chart */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <PriceChart coinId={coin.id} initialData={chartData} />
          </CardContent>
        </Card>

        {/* Exchanges */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            Exchanges Trading {coin.name}
          </h2>
          <CoinExchanges tickers={coin.tickers} />
          {/* Affiliate integration placeholder */}
          <p className="mt-3 text-xs text-muted-foreground">
            Links may include affiliate partnerships.{" "}
            <Link
              href="/exchanges"
              className="text-primary hover:underline"
            >
              Compare all exchanges &rarr;
            </Link>
          </p>
        </div>

        {/* Description */}
        {coin.description.en && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">About {coin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm prose-invert max-w-none text-muted-foreground [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline"
                dangerouslySetInnerHTML={{
                  __html: coin.description.en.slice(0, 2000),
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* External links */}
        {(coin.links.homepage[0] || coin.links.subreddit_url) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {coin.links.homepage[0] && (
              <a
                href={coin.links.homepage[0]}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {coin.links.subreddit_url && (
              <a
                href={coin.links.subreddit_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Reddit <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {coin.links.repos_url.github[0] && (
              <a
                href={coin.links.repos_url.github[0]}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
