import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ExternalLink,
  Gift,
  Scale,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AffiliateLink } from "@/components/affiliate-link";

const features = [
  {
    title: "Side-by-Side Comparison",
    description:
      "Compare fees, features, and supported assets across top exchanges instantly.",
    icon: Scale,
  },
  {
    title: "AI-Powered Insights",
    description:
      "Get intelligent recommendations based on your trading style and preferences.",
    icon: Zap,
  },
  {
    title: "Real-Time Prices",
    description:
      "Track live cryptocurrency prices and market data across all major exchanges.",
    icon: BarChart3,
  },
  {
    title: "Exclusive Offers",
    description:
      "Access exclusive sign-up bonuses and reduced fees through our affiliate partnerships.",
    icon: Gift,
  },
  {
    title: "Security Ratings",
    description:
      "Understand the security measures each exchange employs to protect your funds.",
    icon: Shield,
  },
];

async function getTopExchanges() {
  try {
    return await db.exchange.findMany({
      orderBy: { score: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        score: true,
        affiliateUrl: true,
        fees: { take: 1, orderBy: { updatedAt: "desc" }, select: { spotMakerFee: true, spotTakerFee: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const topExchanges = await getTopExchanges();
  return (
    <>
      {/* Hero */}
      <Section size="hero" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <Container className="relative flex flex-col items-center gap-6 text-center">
          <Badge variant="secondary" className="gap-1.5">
            <Zap className="h-3 w-3" />
            AI-Powered Exchange Comparison
          </Badge>
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Find the{" "}
            <span className="text-gradient">Best Crypto Exchange</span>{" "}
            for You
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Compare fees, features, and security across top cryptocurrency
            exchanges. Make smarter trading decisions with AI-powered insights.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-brand hover:opacity-90">
              <Link href="/compare">
                Compare Exchanges
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/learn">Learn More</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section variant="muted">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Why CryptoCompare AI?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to choose the right exchange.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Top exchanges table */}
      <Section>
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Top Exchanges
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/exchanges">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {topExchanges.length > 0 ? (
            <div className="space-y-3">
              {topExchanges.map((ex, idx) => {
                const fee = ex.fees[0];
                const score = ex.score ?? 0;
                return (
                  <Card key={ex.id}>
                    <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                      <span className="text-lg font-bold text-muted-foreground w-6 text-center">
                        {idx + 1}
                      </span>
                      {ex.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ex.logoUrl}
                          alt={`${ex.name} logo`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg bg-muted object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold uppercase">
                          {ex.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link href={`/exchanges/${ex.slug}`} className="font-semibold hover:underline">
                          {ex.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Fees: {fee ? `${fee.spotMakerFee ?? "—"}% / ${fee.spotTakerFee ?? "—"}%` : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-[hsl(var(--chart-yellow))] text-[hsl(var(--chart-yellow))]" />
                        <span className="font-semibold">{score.toFixed(1)}</span>
                      </div>
                      <AffiliateLink
                        exchangeId={ex.id}
                        sourcePage="homepage"
                        href={ex.affiliateUrl ?? "#"}
                      >
                        <Button size="sm" className="bg-gradient-brand hover:opacity-90">
                          Visit <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </AffiliateLink>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Exchange data is loading...
            </p>
          )}
        </Container>
      </Section>

      {/* CTA */}
      <Section variant="muted" size="lg">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            Ready to find your perfect exchange?
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Join thousands of traders who use CryptoCompare AI to make smarter
            decisions.
          </p>
          <Button asChild size="lg" className="bg-gradient-brand hover:opacity-90">
            <Link href="/compare">
              Start Comparing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Container>
      </Section>
    </>
  );
}
