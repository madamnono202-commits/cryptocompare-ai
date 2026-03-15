import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Exchanges ──────────────────────────────────────────
  const exchanges = await Promise.all([
    prisma.exchange.upsert({
      where: { slug: "binance" },
      update: {},
      create: {
        slug: "binance",
        name: "Binance",
        logoUrl: "https://cdn.example.com/logos/binance.svg",
        affiliateUrl: "https://www.binance.com/register?ref=EXAMPLE",
        description:
          "Binance is the world's largest cryptocurrency exchange by trading volume, offering a wide range of digital assets and trading pairs.",
        foundedYear: 2017,
        headquarters: "Cayman Islands",
        score: 9.5,
      },
    }),
    prisma.exchange.upsert({
      where: { slug: "coinbase" },
      update: {},
      create: {
        slug: "coinbase",
        name: "Coinbase",
        logoUrl: "https://cdn.example.com/logos/coinbase.svg",
        affiliateUrl: "https://www.coinbase.com/join/EXAMPLE",
        description:
          "Coinbase is a publicly traded US-based exchange known for regulatory compliance and beginner-friendly interface.",
        foundedYear: 2012,
        headquarters: "United States",
        score: 9.0,
      },
    }),
    prisma.exchange.upsert({
      where: { slug: "kraken" },
      update: {},
      create: {
        slug: "kraken",
        name: "Kraken",
        logoUrl: "https://cdn.example.com/logos/kraken.svg",
        affiliateUrl: "https://www.kraken.com/sign-up?ref=EXAMPLE",
        description:
          "Kraken is one of the oldest and most trusted cryptocurrency exchanges, offering advanced trading features and strong security.",
        foundedYear: 2011,
        headquarters: "United States",
        score: 8.8,
      },
    }),
    prisma.exchange.upsert({
      where: { slug: "bybit" },
      update: {},
      create: {
        slug: "bybit",
        name: "Bybit",
        logoUrl: "https://cdn.example.com/logos/bybit.svg",
        affiliateUrl: "https://www.bybit.com/register?ref=EXAMPLE",
        description:
          "Bybit is a fast-growing derivatives exchange known for perpetual contracts, copy trading, and competitive fees.",
        foundedYear: 2018,
        headquarters: "Dubai",
        score: 8.5,
      },
    }),
    prisma.exchange.upsert({
      where: { slug: "okx" },
      update: {},
      create: {
        slug: "okx",
        name: "OKX",
        logoUrl: "https://cdn.example.com/logos/okx.svg",
        affiliateUrl: "https://www.okx.com/join?ref=EXAMPLE",
        description:
          "OKX is a comprehensive crypto exchange offering spot, futures, options, and DeFi services with a global user base.",
        foundedYear: 2017,
        headquarters: "Seychelles",
        score: 8.7,
      },
    }),
  ]);

  console.log(`Created ${exchanges.length} exchanges`);

  // ── Exchange Fees ──────────────────────────────────────
  const feeData = [
    { slug: "binance", spotMaker: 0.1, spotTaker: 0.1, futuresMaker: 0.02, futuresTaker: 0.04, withdrawal: 0.0005 },
    { slug: "coinbase", spotMaker: 0.4, spotTaker: 0.6, futuresMaker: null, futuresTaker: null, withdrawal: 0.0 },
    { slug: "kraken", spotMaker: 0.16, spotTaker: 0.26, futuresMaker: 0.02, futuresTaker: 0.05, withdrawal: 0.00015 },
    { slug: "bybit", spotMaker: 0.1, spotTaker: 0.1, futuresMaker: 0.02, futuresTaker: 0.055, withdrawal: 0.0002 },
    { slug: "okx", spotMaker: 0.08, spotTaker: 0.1, futuresMaker: 0.02, futuresTaker: 0.05, withdrawal: 0.0004 },
  ];

  for (const fee of feeData) {
    const exchange = exchanges.find((e) => e.slug === fee.slug)!;
    await prisma.exchangeFee.create({
      data: {
        exchangeId: exchange.id,
        spotMakerFee: fee.spotMaker,
        spotTakerFee: fee.spotTaker,
        futuresMakerFee: fee.futuresMaker,
        futuresTakerFee: fee.futuresTaker,
        withdrawalFee: fee.withdrawal,
      },
    });
  }

  console.log("Created exchange fees");

  // ── Exchange Offers ────────────────────────────────────
  await prisma.exchangeOffer.createMany({
    data: [
      {
        exchangeId: exchanges[0].id, // Binance
        offerText: "Get 20% off trading fees with our referral link",
        bonusAmount: 100,
        isActive: true,
      },
      {
        exchangeId: exchanges[1].id, // Coinbase
        offerText: "Earn $10 in Bitcoin when you sign up and trade $100",
        bonusAmount: 10,
        isActive: true,
      },
      {
        exchangeId: exchanges[3].id, // Bybit
        offerText: "Up to $30,000 deposit bonus for new users",
        bonusAmount: 30000,
        isActive: true,
      },
    ],
  });

  console.log("Created exchange offers");

  // ── Blog Posts ─────────────────────────────────────────
  await prisma.blogPost.createMany({
    data: [
      {
        slug: "best-crypto-exchanges-2025",
        title: "Best Crypto Exchanges in 2025: A Comprehensive Comparison",
        content:
          "Choosing the right cryptocurrency exchange is one of the most important decisions for any trader. In this guide, we compare the top exchanges based on fees, security, features, and user experience to help you make an informed choice.",
        metaTitle: "Best Crypto Exchanges 2025 - Fees, Security & Features Compared",
        metaDescription:
          "Compare the best cryptocurrency exchanges of 2025. Detailed analysis of Binance, Coinbase, Kraken, Bybit, and OKX.",
        category: "guides",
        tags: ["exchanges", "comparison", "2025"],
        publishedAt: new Date("2025-01-15"),
        aiGenerated: false,
      },
      {
        slug: "understanding-trading-fees",
        title: "Understanding Crypto Trading Fees: Maker vs Taker Explained",
        content:
          "Trading fees can significantly impact your profitability over time. This article breaks down the difference between maker and taker fees, how fee tiers work, and strategies to minimize your trading costs across major exchanges.",
        metaTitle: "Crypto Trading Fees Explained - Maker vs Taker | CryptoCompare AI",
        metaDescription:
          "Learn the difference between maker and taker fees, how exchange fee tiers work, and how to reduce your crypto trading costs.",
        category: "education",
        tags: ["fees", "trading", "education"],
        publishedAt: new Date("2025-02-10"),
        aiGenerated: false,
      },
      {
        slug: "exchange-security-checklist",
        title: "Crypto Exchange Security Checklist: What to Look For",
        content:
          "Security is paramount when choosing a crypto exchange. This checklist covers key security features including cold storage, two-factor authentication, insurance funds, proof of reserves, and regulatory compliance.",
        metaTitle: "Crypto Exchange Security Checklist - Stay Safe | CryptoCompare AI",
        metaDescription:
          "Essential security checklist for evaluating cryptocurrency exchanges. Learn what to look for before depositing funds.",
        category: "security",
        tags: ["security", "safety", "checklist"],
        publishedAt: new Date("2025-03-05"),
        aiGenerated: true,
      },
    ],
  });

  console.log("Created 3 blog posts");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
