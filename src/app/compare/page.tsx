import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import {
  ComparisonGrid,
  enrichWithMetadata,
  type ExchangeCompareData,
} from "@/components/compare/comparison-grid";

export const metadata: Metadata = {
  title: "Compare Exchanges",
  description:
    "Compare crypto exchange fees, features, security, and bonuses side-by-side. Find the best exchange for your trading needs.",
};

const FALLBACK_EXCHANGES: ExchangeCompareData[] = [
  {
    id: "1",
    slug: "binance",
    name: "Binance",
    score: 9.5,
    description: "World's largest crypto exchange by trading volume.",
    foundedYear: 2017,
    headquarters: "Cayman Islands",
    affiliateUrl: "#",
    spotMakerFee: 0.1,
    spotTakerFee: 0.1,
    futuresMakerFee: 0.02,
    futuresTakerFee: 0.04,
    offerText: "Get 20% off trading fees",
    bonusAmount: 100,
    kycRequired: true,
    hasSpotTrading: true,
    hasFuturesTrading: true,
    supportedCoins: 600,
  },
  {
    id: "2",
    slug: "coinbase",
    name: "Coinbase",
    score: 9.0,
    description: "US-based, publicly traded, beginner-friendly.",
    foundedYear: 2012,
    headquarters: "United States",
    affiliateUrl: "#",
    spotMakerFee: 0.4,
    spotTakerFee: 0.6,
    futuresMakerFee: null,
    futuresTakerFee: null,
    offerText: "Earn $10 in Bitcoin",
    bonusAmount: 10,
    kycRequired: true,
    hasSpotTrading: true,
    hasFuturesTrading: false,
    supportedCoins: 250,
  },
  {
    id: "3",
    slug: "kraken",
    name: "Kraken",
    score: 8.8,
    description: "One of the oldest and most trusted exchanges.",
    foundedYear: 2011,
    headquarters: "United States",
    affiliateUrl: "#",
    spotMakerFee: 0.16,
    spotTakerFee: 0.26,
    futuresMakerFee: 0.02,
    futuresTakerFee: 0.05,
    offerText: null,
    bonusAmount: null,
    kycRequired: true,
    hasSpotTrading: true,
    hasFuturesTrading: true,
    supportedCoins: 200,
  },
  {
    id: "4",
    slug: "bybit",
    name: "Bybit",
    score: 8.5,
    description: "Fast-growing derivatives exchange.",
    foundedYear: 2018,
    headquarters: "Dubai",
    affiliateUrl: "#",
    spotMakerFee: 0.1,
    spotTakerFee: 0.1,
    futuresMakerFee: 0.02,
    futuresTakerFee: 0.055,
    offerText: "Up to $30,000 deposit bonus",
    bonusAmount: 30000,
    kycRequired: false,
    hasSpotTrading: true,
    hasFuturesTrading: true,
    supportedCoins: 500,
  },
  {
    id: "5",
    slug: "okx",
    name: "OKX",
    score: 8.7,
    description: "Comprehensive crypto exchange with global reach.",
    foundedYear: 2017,
    headquarters: "Seychelles",
    affiliateUrl: "#",
    spotMakerFee: 0.08,
    spotTakerFee: 0.1,
    futuresMakerFee: 0.02,
    futuresTakerFee: 0.05,
    offerText: null,
    bonusAmount: null,
    kycRequired: false,
    hasSpotTrading: true,
    hasFuturesTrading: true,
    supportedCoins: 350,
  },
];

async function getExchanges(): Promise<ExchangeCompareData[]> {
  try {
    const exchanges = await db.exchange.findMany({
      orderBy: { score: "desc" },
      include: {
        fees: { take: 1 },
        offers: { where: { isActive: true }, take: 1 },
      },
    });

    const mapped = exchanges.map((e) => ({
      id: e.id,
      slug: e.slug,
      name: e.name,
      score: e.score,
      description: e.description,
      foundedYear: e.foundedYear,
      headquarters: e.headquarters,
      affiliateUrl: e.affiliateUrl,
      spotMakerFee: e.fees[0]?.spotMakerFee ?? null,
      spotTakerFee: e.fees[0]?.spotTakerFee ?? null,
      futuresMakerFee: e.fees[0]?.futuresMakerFee ?? null,
      futuresTakerFee: e.fees[0]?.futuresTakerFee ?? null,
      offerText: e.offers[0]?.offerText ?? null,
      bonusAmount: e.offers[0]?.bonusAmount ?? null,
    }));

    return enrichWithMetadata(mapped);
  } catch {
    return FALLBACK_EXCHANGES;
  }
}

export default async function ComparePage() {
  const exchanges = await getExchanges();

  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Compare Exchanges"
          description="Compare fees, features, security, and supported assets across top crypto exchanges side-by-side. Select 2-3 exchanges to see a detailed comparison."
        />
        <div className="mt-10">
          <ComparisonGrid exchanges={exchanges} />
        </div>
      </Container>
    </Section>
  );
}
