import Link from "next/link";
import { ArrowRight, ExternalLink, Gift, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

interface FeaturedExchange {
  slug: string;
  name: string;
  description: string | null;
  score: number | null;
  affiliateUrl: string | null;
  offerText: string | null;
  bonusAmount: number | null;
}

const FALLBACK: FeaturedExchange[] = [
  { slug: "binance", name: "Binance", description: "World's largest crypto exchange by trading volume.", score: 9.5, affiliateUrl: "#", offerText: "Get 20% off trading fees with our referral link", bonusAmount: 100 },
  { slug: "coinbase", name: "Coinbase", description: "US-based, publicly traded, beginner-friendly.", score: 9.0, affiliateUrl: "#", offerText: "Earn $10 in Bitcoin when you sign up and trade $100", bonusAmount: 10 },
  { slug: "bybit", name: "Bybit", description: "Fast-growing derivatives exchange with copy trading.", score: 8.5, affiliateUrl: "#", offerText: "Up to $30,000 deposit bonus for new users", bonusAmount: 30000 },
];

async function getFeaturedExchanges(): Promise<FeaturedExchange[]> {
  try {
    const exchanges = await db.exchange.findMany({
      where: { offers: { some: { isActive: true } } },
      orderBy: { score: "desc" },
      take: 3,
      include: {
        offers: { where: { isActive: true }, take: 1 },
      },
    });

    return exchanges.map((e) => ({
      slug: e.slug,
      name: e.name,
      description: e.description,
      score: e.score,
      affiliateUrl: e.affiliateUrl,
      offerText: e.offers[0]?.offerText ?? null,
      bonusAmount: e.offers[0]?.bonusAmount ?? null,
    }));
  } catch {
    return FALLBACK;
  }
}

export async function FeaturedExchanges() {
  const exchanges = await getFeaturedExchanges();

  return (
    <Section variant="muted">
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Featured Exchanges
            </h2>
            <p className="mt-1 text-muted-foreground">
              Exclusive offers from our top-rated exchange partners.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
            <Link href="/offers">
              All Offers <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exchanges.map((ex) => (
            <Card key={ex.slug} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-lg font-bold uppercase">
                      {ex.name.charAt(0)}
                    </span>
                    <div>
                      <CardTitle className="text-lg">{ex.name}</CardTitle>
                      {ex.score !== null && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-[hsl(var(--chart-yellow))] text-[hsl(var(--chart-yellow))]" />
                          {ex.score.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {ex.description && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {ex.description}
                  </p>
                )}
                {ex.offerText && (
                  <div className="rounded-lg border border-[hsl(var(--chart-green))]/20 bg-[hsl(var(--chart-green))]/5 p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Gift className="h-3.5 w-3.5 text-[hsl(var(--chart-green))]" />
                      <span className="text-xs font-semibold text-[hsl(var(--chart-green))]">
                        Exclusive Offer
                      </span>
                    </div>
                    <p className="text-sm">{ex.offerText}</p>
                    {ex.bonusAmount !== null && ex.bonusAmount > 0 && (
                      <Badge variant="success" className="mt-2">
                        Up to ${ex.bonusAmount.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button asChild className="flex-1 bg-gradient-brand hover:opacity-90">
                  <Link href={ex.affiliateUrl ?? `/exchanges/${ex.slug}`}>
                    Claim Offer <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/exchanges/${ex.slug}`}>Review</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
