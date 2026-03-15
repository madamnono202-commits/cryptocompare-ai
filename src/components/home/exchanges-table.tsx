import Link from "next/link";
import { ArrowRight, ExternalLink, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

interface ExchangeRow {
  slug: string;
  name: string;
  score: number | null;
  foundedYear: number | null;
  headquarters: string | null;
  affiliateUrl: string | null;
  spotMakerFee: number | null;
  spotTakerFee: number | null;
  offerText: string | null;
}

const FALLBACK_EXCHANGES: ExchangeRow[] = [
  { slug: "binance", name: "Binance", score: 9.5, foundedYear: 2017, headquarters: "Cayman Islands", affiliateUrl: "#", spotMakerFee: 0.1, spotTakerFee: 0.1, offerText: "Get 20% off trading fees" },
  { slug: "coinbase", name: "Coinbase", score: 9.0, foundedYear: 2012, headquarters: "United States", affiliateUrl: "#", spotMakerFee: 0.4, spotTakerFee: 0.6, offerText: "Earn $10 in Bitcoin" },
  { slug: "kraken", name: "Kraken", score: 8.8, foundedYear: 2011, headquarters: "United States", affiliateUrl: "#", spotMakerFee: 0.16, spotTakerFee: 0.26, offerText: null },
  { slug: "bybit", name: "Bybit", score: 8.5, foundedYear: 2018, headquarters: "Dubai", affiliateUrl: "#", spotMakerFee: 0.1, spotTakerFee: 0.1, offerText: "Up to $30,000 deposit bonus" },
  { slug: "okx", name: "OKX", score: 8.7, foundedYear: 2017, headquarters: "Seychelles", affiliateUrl: "#", spotMakerFee: 0.08, spotTakerFee: 0.1, offerText: null },
];

async function getExchanges(): Promise<ExchangeRow[]> {
  try {
    const exchanges = await db.exchange.findMany({
      orderBy: { score: "desc" },
      take: 5,
      include: {
        fees: { take: 1 },
        offers: { where: { isActive: true }, take: 1 },
      },
    });

    return exchanges.map((e) => ({
      slug: e.slug,
      name: e.name,
      score: e.score,
      foundedYear: e.foundedYear,
      headquarters: e.headquarters,
      affiliateUrl: e.affiliateUrl,
      spotMakerFee: e.fees[0]?.spotMakerFee ?? null,
      spotTakerFee: e.fees[0]?.spotTakerFee ?? null,
      offerText: e.offers[0]?.offerText ?? null,
    }));
  } catch {
    return FALLBACK_EXCHANGES;
  }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">—</span>;
  const variant = score >= 9 ? "success" : score >= 8 ? "warning" : "outline";
  return (
    <Badge variant={variant} className="gap-1 tabular-nums">
      <Star className="h-3 w-3" />
      {score.toFixed(1)}
    </Badge>
  );
}

export async function ExchangesTable() {
  const exchanges = await getExchanges();

  return (
    <Section>
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Top Exchanges Compared
            </h2>
            <p className="mt-1 text-muted-foreground">
              Side-by-side fee and score comparison of leading crypto exchanges.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
            <Link href="/compare">
              Full Comparison <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Exchange</th>
                <th className="px-4 py-3 text-left font-semibold">Score</th>
                <th className="px-4 py-3 text-left font-semibold">Maker Fee</th>
                <th className="px-4 py-3 text-left font-semibold">Taker Fee</th>
                <th className="px-4 py-3 text-left font-semibold">Founded</th>
                <th className="px-4 py-3 text-left font-semibold">Offer</th>
                <th className="px-4 py-3 text-right font-semibold" />
              </tr>
            </thead>
            <tbody>
              {exchanges.map((ex, i) => (
                <tr
                  key={ex.slug}
                  className="border-b transition-colors last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/exchanges/${ex.slug}`}
                      className="flex items-center gap-2 font-medium hover:text-primary"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold uppercase">
                        {ex.name.charAt(0)}
                      </span>
                      {ex.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={ex.score} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {ex.spotMakerFee !== null
                      ? `${ex.spotMakerFee}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {ex.spotTakerFee !== null
                      ? `${ex.spotTakerFee}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ex.foundedYear ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {ex.offerText ? (
                      <span className="text-xs text-[hsl(var(--chart-green))]">
                        {ex.offerText.length > 30
                          ? ex.offerText.slice(0, 30) + "..."
                          : ex.offerText}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={ex.affiliateUrl ?? `/exchanges/${ex.slug}`}>
                        Visit <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {exchanges.map((ex, i) => (
            <Link
              key={ex.slug}
              href={`/exchanges/${ex.slug}`}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold uppercase">
                {ex.name.charAt(0)}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  <span className="font-medium">{ex.name}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    Maker {ex.spotMakerFee !== null ? `${ex.spotMakerFee}%` : "—"}
                  </span>
                  <span>
                    Taker {ex.spotTakerFee !== null ? `${ex.spotTakerFee}%` : "—"}
                  </span>
                </div>
              </div>
              <ScoreBadge score={ex.score} />
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
