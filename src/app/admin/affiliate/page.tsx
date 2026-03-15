import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Globe,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Affiliate Analytics",
  description: "Affiliate click tracking analytics dashboard.",
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getAnalytics() {
  const [
    totalClicks,
    clicksByExchange,
    clicksBySource,
    recentClicks,
    last7DaysClicks,
  ] = await Promise.all([
    // Total clicks
    db.affiliateClick.count(),

    // Clicks grouped by exchange
    db.affiliateClick.groupBy({
      by: ["exchangeId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    // Clicks grouped by source page
    db.affiliateClick.groupBy({
      by: ["sourcePage"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),

    // Recent clicks (last 20)
    db.affiliateClick.findMany({
      orderBy: { clickedAt: "desc" },
      take: 20,
      include: {
        exchange: { select: { name: true, slug: true } },
      },
    }),

    // Clicks in the last 7 days
    db.affiliateClick.count({
      where: {
        clickedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  // Resolve exchange names for the grouped data
  const exchangeIds = clicksByExchange.map((c) => c.exchangeId);
  const exchanges = await db.exchange.findMany({
    where: { id: { in: exchangeIds } },
    select: { id: true, name: true, slug: true },
  });
  const exchangeMap = new Map(exchanges.map((e) => [e.id, e]));

  const clicksByExchangeWithNames = clicksByExchange.map((c) => ({
    exchangeId: c.exchangeId,
    exchangeName: exchangeMap.get(c.exchangeId)?.name ?? "Unknown",
    exchangeSlug: exchangeMap.get(c.exchangeId)?.slug ?? "",
    count: c._count.id,
  }));

  const clicksBySourceWithNames = clicksBySource.map((c) => ({
    sourcePage: c.sourcePage ?? "unknown",
    count: c._count.id,
  }));

  return {
    totalClicks,
    last7DaysClicks,
    clicksByExchange: clicksByExchangeWithNames,
    clicksBySource: clicksBySourceWithNames,
    recentClicks,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AffiliateAnalyticsPage() {
  let analytics;
  try {
    analytics = await getAnalytics();
  } catch {
    analytics = null;
  }

  if (!analytics) {
    return (
      <Section size="lg">
        <Container>
          <p className="text-muted-foreground">
            Unable to load analytics. Make sure the database is connected.
          </p>
        </Container>
      </Section>
    );
  }

  const {
    totalClicks,
    last7DaysClicks,
    clicksByExchange,
    clicksBySource,
    recentClicks,
  } = analytics;

  const maxExchangeClicks = Math.max(
    ...clicksByExchange.map((c) => c.count),
    1
  );
  const maxSourceClicks = Math.max(
    ...clicksBySource.map((c) => c.count),
    1
  );

  return (
    <Section size="lg">
      <Container>
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <ArrowLeft className="mr-1 h-4 w-4" /> Admin
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Affiliate Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Track affiliate link clicks across all pages
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<MousePointerClick className="h-4 w-4" />}
            label="Total Clicks"
            value={totalClicks.toLocaleString()}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Last 7 Days"
            value={last7DaysClicks.toLocaleString()}
          />
          <StatCard
            icon={<BarChart3 className="h-4 w-4" />}
            label="Exchanges Tracked"
            value={clicksByExchange.length.toString()}
          />
          <StatCard
            icon={<Globe className="h-4 w-4" />}
            label="Source Pages"
            value={clicksBySource.length.toString()}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Clicks by exchange (bar chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clicks by Exchange</CardTitle>
            </CardHeader>
            <CardContent>
              {clicksByExchange.length > 0 ? (
                <div className="space-y-3">
                  {clicksByExchange.map((item) => (
                    <div key={item.exchangeId}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <Link
                          href={`/exchanges/${item.exchangeSlug}`}
                          className="font-medium hover:underline"
                        >
                          {item.exchangeName}
                        </Link>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-brand transition-all"
                          style={{
                            width: `${(item.count / maxExchangeClicks) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No click data yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Clicks by source page (bar chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clicks by Source Page</CardTitle>
            </CardHeader>
            <CardContent>
              {clicksBySource.length > 0 ? (
                <div className="space-y-3">
                  {clicksBySource.map((item) => (
                    <div key={item.sourcePage}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{item.sourcePage}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--chart-green))] transition-all"
                          style={{
                            width: `${(item.count / maxSourceClicks) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No click data yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent clicks table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4" />
              Recent Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentClicks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Exchange
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Source
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        IP Hash
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentClicks.map((click) => (
                      <tr key={click.id}>
                        <td className="py-3 pr-4">
                          <Link
                            href={`/exchanges/${click.exchange.slug}`}
                            className="font-medium hover:underline"
                          >
                            {click.exchange.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline">
                            {click.sourcePage ?? "unknown"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {click.ipHash
                            ? `${click.ipHash.slice(0, 8)}...`
                            : "—"}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {click.clickedAt.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No clicks recorded yet. Clicks will appear here as users
                interact with affiliate links.
              </p>
            )}
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
