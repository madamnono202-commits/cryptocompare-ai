import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  Gift,
  MapPin,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AffiliateLink } from "@/components/affiliate-link";
import { ExchangeTabs } from "./exchange-tabs";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getExchange(slug: string) {
  const exchange = await db.exchange.findUnique({
    where: { slug },
    include: {
      fees: { take: 1, orderBy: { updatedAt: "desc" } },
      offers: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return exchange;
}

async function getRelatedExchanges(currentSlug: string) {
  const exchanges = await db.exchange.findMany({
    where: { slug: { not: currentSlug } },
    orderBy: { score: "desc" },
    take: 3,
    select: { slug: true, name: true, score: true, logoUrl: true },
  });

  return exchanges;
}

// ---------------------------------------------------------------------------
// Static params (pre-render known slugs)
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  try {
    const exchanges = await db.exchange.findMany({
      select: { slug: true },
    });
    return exchanges.map((e) => ({ slug: e.slug }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// SEO Metadata
// ---------------------------------------------------------------------------

interface ExchangePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ExchangePageProps): Promise<Metadata> {
  let exchange;
  try {
    exchange = await getExchange(params.slug);
  } catch {
    exchange = null;
  }

  if (!exchange) {
    return { title: "Exchange Not Found" };
  }

  const title = `${exchange.name} Review ${new Date().getFullYear()} \u2013 Fees, Security & Features`;
  const description =
    exchange.description ??
    `In-depth review of ${exchange.name}. Compare fees, security features, and trading options.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/exchanges/${exchange.slug}`,
      siteName: siteConfig.name,
      type: "article",
      images: exchange.logoUrl ? [{ url: exchange.logoUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${siteConfig.url}/exchanges/${exchange.slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Schema markup helpers
// ---------------------------------------------------------------------------

function buildJsonLd(
  exchange: NonNullable<Awaited<ReturnType<typeof getExchange>>>
) {
  const fee = exchange.fees[0];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: exchange.name,
    description:
      exchange.description ?? `${exchange.name} cryptocurrency exchange`,
    image: exchange.logoUrl ?? undefined,
    brand: { "@type": "Brand", name: exchange.name },
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: exchange.score?.toString() ?? "0",
        bestRating: "10",
        worstRating: "0",
      },
      author: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      datePublished: exchange.updatedAt.toISOString().split("T")[0],
      reviewBody:
        exchange.description ?? `Comprehensive review of ${exchange.name}.`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: exchange.score?.toString() ?? "0",
      bestRating: "10",
      worstRating: "0",
      ratingCount: "1",
    },
  };

  const faqItems = [
    {
      question: `What are ${exchange.name}'s trading fees?`,
      answer: fee
        ? `${exchange.name} charges a spot maker fee of ${fee.spotMakerFee ?? "N/A"}% and a spot taker fee of ${fee.spotTakerFee ?? "N/A"}%.`
        : `Visit ${exchange.name} for the latest fee schedule.`,
    },
    {
      question: `Is ${exchange.name} safe to use?`,
      answer: `${exchange.name} employs industry-standard security measures including cold storage, two-factor authentication, and regular security audits. It was founded in ${exchange.foundedYear ?? "N/A"} and is headquartered in ${exchange.headquarters ?? "N/A"}.`,
    },
    {
      question: `When was ${exchange.name} founded?`,
      answer: exchange.foundedYear
        ? `${exchange.name} was founded in ${exchange.foundedYear}.`
        : `The founding year of ${exchange.name} is not currently listed.`,
    },
    {
      question: `Does ${exchange.name} offer any sign-up bonuses?`,
      answer:
        exchange.offers.length > 0
          ? `Yes! ${exchange.offers[0].offerText}`
          : `Check ${exchange.name}'s website for the latest promotions and sign-up bonuses.`,
    },
    {
      question: `How does ${exchange.name} compare to other exchanges?`,
      answer: `${exchange.name} has an overall score of ${exchange.score ?? 0}/10 on ${siteConfig.name}. Visit our comparison tool to see how it stacks up against other exchanges.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return { productSchema, faqSchema, faqItems };
}

// ---------------------------------------------------------------------------
// Helper: score color
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 9) return "text-[hsl(var(--chart-green))]";
  if (score >= 7) return "text-[hsl(var(--chart-yellow))]";
  return "text-[hsl(var(--chart-red))]";
}

function scoreBg(score: number): string {
  if (score >= 9)
    return "bg-[hsl(var(--chart-green))]/10 border-[hsl(var(--chart-green))]/20";
  if (score >= 7)
    return "bg-[hsl(var(--chart-yellow))]/10 border-[hsl(var(--chart-yellow))]/20";
  return "bg-[hsl(var(--chart-red))]/10 border-[hsl(var(--chart-red))]/20";
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ExchangePage({ params }: ExchangePageProps) {
  let exchange;
  let relatedExchanges;

  try {
    [exchange, relatedExchanges] = await Promise.all([
      getExchange(params.slug),
      getRelatedExchanges(params.slug),
    ]);
  } catch {
    notFound();
  }

  if (!exchange) notFound();

  const fee = exchange.fees[0] ?? null;
  const activeOffer = exchange.offers[0] ?? null;
  const { productSchema, faqSchema, faqItems } = buildJsonLd(exchange);
  const score = exchange.score ?? 0;

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <Container className="relative">
          {/* Breadcrumb */}
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
            <Link href="/exchanges">
              <ArrowLeft className="mr-1 h-4 w-4" /> All Exchanges
            </Link>
          </Button>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              {/* Logo */}
              {exchange.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={exchange.logoUrl}
                  alt={`${exchange.name} logo`}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl bg-muted object-contain p-2"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-2xl font-bold uppercase">
                  {exchange.name.charAt(0)}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-extrabold sm:text-4xl">
                  {exchange.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="success">Verified</Badge>
                  {exchange.foundedYear && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Est. {exchange.foundedYear}
                    </Badge>
                  )}
                  {exchange.headquarters && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {exchange.headquarters}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Score + CTA */}
            <div className="flex items-center gap-4">
              <div
                className={`flex flex-col items-center rounded-xl border px-4 py-3 ${scoreBg(score)}`}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  Score
                </span>
                <span
                  className={`text-2xl font-extrabold ${scoreColor(score)}`}
                >
                  {score.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.round(score / 2)
                          ? "fill-[hsl(var(--chart-yellow))] text-[hsl(var(--chart-yellow))]"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <AffiliateLink
                exchangeId={exchange.id}
                sourcePage="exchange-detail"
                href={exchange.affiliateUrl ?? "#"}
              >
                <Button
                  size="lg"
                  className="bg-gradient-brand hover:opacity-90"
                >
                  Visit {exchange.name}{" "}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </AffiliateLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* Quick Stats Row */}
      <Section size="sm" variant="muted">
        <Container>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <QuickStat
              icon={<TrendingUp className="h-4 w-4" />}
              label="Overall Score"
              value={`${score.toFixed(1)}/10`}
            />
            <QuickStat
              icon={<Calendar className="h-4 w-4" />}
              label="Founded"
              value={exchange.foundedYear?.toString() ?? "N/A"}
            />
            <QuickStat
              icon={<MapPin className="h-4 w-4" />}
              label="Headquarters"
              value={exchange.headquarters ?? "N/A"}
            />
            <QuickStat
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Maker / Taker Fee"
              value={
                fee
                  ? `${fee.spotMakerFee ?? "\u2014"}% / ${fee.spotTakerFee ?? "\u2014"}%`
                  : "N/A"
              }
            />
          </div>
        </Container>
      </Section>

      {/* Active Offer Banner */}
      {activeOffer && (
        <Section size="sm">
          <Container>
            <div className="flex flex-col items-center gap-4 rounded-xl border border-[hsl(var(--chart-green))]/30 bg-[hsl(var(--chart-green))]/5 p-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[hsl(var(--chart-green))]/10 p-2">
                  <Gift className="h-5 w-5 text-[hsl(var(--chart-green))]" />
                </div>
                <div>
                  <p className="font-semibold">{activeOffer.offerText}</p>
                  {activeOffer.bonusAmount && (
                    <p className="text-sm text-muted-foreground">
                      Up to ${activeOffer.bonusAmount.toLocaleString()} bonus
                    </p>
                  )}
                </div>
              </div>
              <AffiliateLink
                exchangeId={exchange.id}
                sourcePage="exchange-detail-offer"
                href={exchange.affiliateUrl ?? "#"}
              >
                <Button
                  className="bg-gradient-brand hover:opacity-90"
                >
                  Claim Offer <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </AffiliateLink>
            </div>
          </Container>
        </Section>
      )}

      {/* Tabbed Content */}
      <Section size="lg">
        <Container>
          <ExchangeTabs
            exchange={{
              id: exchange.id,
              name: exchange.name,
              description: exchange.description,
              foundedYear: exchange.foundedYear,
              headquarters: exchange.headquarters,
              score,
              affiliateUrl: exchange.affiliateUrl,
            }}
            fee={
              fee
                ? {
                    spotMakerFee: fee.spotMakerFee,
                    spotTakerFee: fee.spotTakerFee,
                    futuresMakerFee: fee.futuresMakerFee,
                    futuresTakerFee: fee.futuresTakerFee,
                    withdrawalFee: fee.withdrawalFee,
                  }
                : null
            }
            faqItems={faqItems}
          />
        </Container>
      </Section>

      {/* Related Exchanges */}
      <Section variant="muted">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Other Top Exchanges</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/exchanges">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedExchanges.map((re) => (
              <Link key={re.slug} href={`/exchanges/${re.slug}`}>
                <Card className="transition-transform hover:scale-[1.02]">
                  <CardContent className="flex items-center gap-4 p-5">
                    {re.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={re.logoUrl}
                        alt={`${re.name} logo`}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg bg-muted object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold uppercase">
                        {re.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{re.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {re.score?.toFixed(1) ?? "N/A"}/10
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Internal link to compare */}
          <div className="mt-8 text-center">
            <p className="mb-3 text-muted-foreground">
              Want to see how {exchange.name} stacks up?
            </p>
            <Button asChild variant="outline">
              <Link href="/compare">
                Compare Exchanges <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Quick Stat sub-component
// ---------------------------------------------------------------------------

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
