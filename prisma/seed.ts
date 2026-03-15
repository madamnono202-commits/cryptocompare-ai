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
  // Content is stored as JSON sections for structured rendering.
  // Each section is an object with a "type" field:
  //   - "heading": { level, id, text }
  //   - "paragraph": { text }
  //   - "list": { items: string[] }
  //   - "affiliate_cta": { exchangeSlug, heading, text, ctaLabel }
  //   - "internal_link": { href, text }

  const post1Content = JSON.stringify([
    { type: "paragraph", text: "Choosing the right cryptocurrency exchange is one of the most important decisions for any trader or investor. With hundreds of platforms available, it can be overwhelming to decide where to trade. In this comprehensive guide, we compare the top exchanges of 2025 based on fees, security, features, and user experience." },
    { type: "heading", level: 2, id: "what-to-look-for", text: "What to Look for in a Crypto Exchange" },
    { type: "paragraph", text: "Before diving into individual exchanges, it\u2019s important to understand the key factors that differentiate one platform from another. The best exchange for you depends on your trading style, experience level, and geographic location." },
    { type: "list", items: ["Trading fees (maker and taker fee structures)", "Security measures and track record", "Range of supported cryptocurrencies", "User interface and mobile app quality", "Regulatory compliance and licensing", "Customer support responsiveness", "Liquidity and trading volume"] },
    { type: "heading", level: 2, id: "top-exchanges-2025", text: "Top 5 Crypto Exchanges in 2025" },
    { type: "heading", level: 3, id: "binance", text: "1. Binance \u2013 Best Overall Exchange" },
    { type: "paragraph", text: "Binance continues to dominate the crypto exchange landscape in 2025. With the lowest fees in the industry (0.1% spot trading), an enormous selection of trading pairs, and advanced features like futures and options trading, Binance remains the top choice for both beginners and experienced traders." },
    { type: "affiliate_cta", exchangeSlug: "binance", heading: "Trade on Binance", text: "Get 20% off trading fees when you sign up through our exclusive referral link.", ctaLabel: "Sign Up on Binance" },
    { type: "heading", level: 3, id: "coinbase", text: "2. Coinbase \u2013 Best for Beginners" },
    { type: "paragraph", text: "Coinbase is the go-to platform for newcomers to cryptocurrency. As a publicly traded company in the United States, it offers unmatched regulatory compliance and a clean, intuitive interface. While fees are higher than some competitors, the peace of mind and ease of use make it worth the premium for many users." },
    { type: "affiliate_cta", exchangeSlug: "coinbase", heading: "Start with Coinbase", text: "Earn $10 in Bitcoin when you sign up and make your first trade of $100 or more.", ctaLabel: "Join Coinbase" },
    { type: "heading", level: 3, id: "kraken", text: "3. Kraken \u2013 Best for Security" },
    { type: "paragraph", text: "Founded in 2011, Kraken is one of the oldest and most trusted exchanges in the industry. It has never been hacked and offers comprehensive security features including cold storage, proof of reserves audits, and advanced authentication options. Kraken also provides competitive fees and a professional trading interface." },
    { type: "heading", level: 3, id: "bybit", text: "4. Bybit \u2013 Best for Derivatives Trading" },
    { type: "paragraph", text: "Bybit has rapidly grown to become one of the top derivatives exchanges globally. With perpetual contracts, copy trading features, and up to 100x leverage, it\u2019s the platform of choice for traders looking to maximize their exposure. Bybit also offers competitive spot trading fees." },
    { type: "affiliate_cta", exchangeSlug: "bybit", heading: "Trade on Bybit", text: "New users can receive up to $30,000 in deposit bonuses when signing up through our link.", ctaLabel: "Claim Bybit Bonus" },
    { type: "heading", level: 3, id: "okx", text: "5. OKX \u2013 Best All-in-One Platform" },
    { type: "paragraph", text: "OKX offers a comprehensive suite of crypto services including spot trading, futures, options, DeFi, and even an NFT marketplace. With competitive fees starting at 0.08% for makers, OKX is an excellent choice for traders who want everything in one platform." },
    { type: "heading", level: 2, id: "fee-comparison", text: "Fee Comparison Table" },
    { type: "paragraph", text: "Trading fees can significantly impact your profitability over time. Here\u2019s how the top exchanges compare on their standard fee tiers. Keep in mind that most exchanges offer volume-based discounts and additional reductions for using their native tokens." },
    { type: "internal_link", href: "/compare", text: "Use our interactive comparison tool to see detailed fee breakdowns across all exchanges." },
    { type: "heading", level: 2, id: "conclusion", text: "Conclusion" },
    { type: "paragraph", text: "The best crypto exchange depends on your individual needs. Binance is our top overall pick for its combination of low fees, extensive features, and high liquidity. Coinbase is ideal for beginners, while Kraken excels in security. For derivatives traders, Bybit is the clear winner, and OKX offers the most comprehensive all-in-one experience." },
    { type: "internal_link", href: "/exchanges", text: "Browse all exchanges we track and find the perfect fit for your trading needs." },
  ]);

  const post2Content = JSON.stringify([
    { type: "paragraph", text: "Trading fees are one of the most overlooked aspects of cryptocurrency trading, yet they can have a massive impact on your bottom line. Whether you\u2019re a casual investor or a high-frequency trader, understanding the difference between maker and taker fees is essential for optimizing your trading costs." },
    { type: "heading", level: 2, id: "what-are-trading-fees", text: "What Are Crypto Trading Fees?" },
    { type: "paragraph", text: "Every time you buy or sell cryptocurrency on an exchange, you pay a trading fee. This fee is how exchanges generate revenue and maintain their platforms. Trading fees are typically expressed as a percentage of your trade value and can range from 0% to over 1% depending on the exchange and your trading volume." },
    { type: "heading", level: 2, id: "maker-vs-taker", text: "Maker vs Taker Fees Explained" },
    { type: "paragraph", text: "Most exchanges use a maker-taker fee model. Understanding the difference between these two types of orders is crucial for minimizing your costs." },
    { type: "heading", level: 3, id: "maker-fees", text: "What Are Maker Fees?" },
    { type: "paragraph", text: "A maker fee is charged when you place an order that adds liquidity to the order book. This typically means placing a limit order that doesn\u2019t immediately match with an existing order. Since makers add liquidity to the market, exchanges reward them with lower fees. For example, Binance charges a maker fee of just 0.1%." },
    { type: "heading", level: 3, id: "taker-fees", text: "What Are Taker Fees?" },
    { type: "paragraph", text: "A taker fee is charged when you place an order that removes liquidity from the order book. This includes market orders and limit orders that are immediately filled. Taker fees are generally higher than maker fees because takers are consuming the liquidity that makers provide." },
    { type: "heading", level: 2, id: "fee-tiers", text: "How Fee Tiers Work" },
    { type: "paragraph", text: "Most major exchanges offer tiered fee structures based on your 30-day trading volume. The more you trade, the lower your fees become. Some exchanges also offer discounts for holding and using their native tokens to pay fees." },
    { type: "list", items: ["Tier 1 (< $50K volume): Standard fees apply", "Tier 2 ($50K\u2013$100K): Typically 10\u201320% discount", "Tier 3 ($100K\u2013$500K): Typically 20\u201340% discount", "VIP Tiers ($500K+): Significant discounts, sometimes 0% maker fees"] },
    { type: "affiliate_cta", exchangeSlug: "binance", heading: "Lowest Fees in the Industry", text: "Binance offers the most competitive fee structure starting at just 0.1%. Sign up with our referral link for an additional 20% discount.", ctaLabel: "Get Binance Fee Discount" },
    { type: "heading", level: 2, id: "strategies-to-reduce-fees", text: "5 Strategies to Reduce Your Trading Fees" },
    { type: "list", items: ["Use limit orders instead of market orders to pay maker fees", "Hold and use exchange native tokens (BNB, CRO, etc.) for fee discounts", "Increase your trading volume to reach higher fee tiers", "Sign up through referral links for permanent fee reductions", "Compare exchanges regularly to ensure you\u2019re getting the best rates"] },
    { type: "internal_link", href: "/compare", text: "Compare trading fees across all major exchanges with our interactive tool." },
    { type: "heading", level: 2, id: "impact-on-profitability", text: "The Real Impact on Your Profitability" },
    { type: "paragraph", text: "Let\u2019s put this into perspective. If you trade $10,000 per month and pay 0.5% in fees, you\u2019re spending $50 monthly or $600 annually on fees alone. By switching to an exchange with 0.1% fees, you\u2019d only pay $10 per month \u2013 saving $480 per year. For active traders with higher volumes, the savings can be even more dramatic." },
    { type: "heading", level: 2, id: "conclusion", text: "Conclusion" },
    { type: "paragraph", text: "Understanding and optimizing your trading fees is one of the simplest ways to improve your crypto trading profitability. By choosing the right exchange, using limit orders, and taking advantage of referral discounts, you can significantly reduce your costs." },
    { type: "internal_link", href: "/blog/best-crypto-exchanges-2025", text: "Read our complete guide to the best crypto exchanges in 2025." },
  ]);

  const post3Content = JSON.stringify([
    { type: "paragraph", text: "Security should be your number one priority when choosing a cryptocurrency exchange. Unlike traditional banks, crypto exchanges are frequent targets for hackers, and if your funds are stolen, there\u2019s often no way to recover them. This comprehensive checklist will help you evaluate the security of any exchange before you deposit your funds." },
    { type: "heading", level: 2, id: "cold-storage", text: "1. Cold Storage Practices" },
    { type: "paragraph", text: "The most secure exchanges store the vast majority of user funds in cold storage \u2013 offline wallets that are not connected to the internet. Look for exchanges that keep at least 95% of assets in cold storage. Binance, Kraken, and Coinbase all maintain industry-leading cold storage practices." },
    { type: "heading", level: 2, id: "two-factor-auth", text: "2. Two-Factor Authentication (2FA)" },
    { type: "paragraph", text: "Any reputable exchange should offer and strongly encourage two-factor authentication. The best exchanges support hardware security keys (like YubiKey), authenticator apps (Google Authenticator, Authy), and SMS verification. Hardware keys offer the strongest protection against phishing attacks." },
    { type: "heading", level: 2, id: "insurance-funds", text: "3. Insurance and Protection Funds" },
    { type: "paragraph", text: "Some exchanges maintain insurance funds to protect users in case of a security breach. Binance\u2019s SAFU (Secure Asset Fund for Users) is one of the largest in the industry, holding over $1 billion in reserves. Coinbase also carries insurance on digital assets held in hot storage." },
    { type: "affiliate_cta", exchangeSlug: "binance", heading: "Trade Securely on Binance", text: "Binance\u2019s SAFU fund protects users with over $1 billion in reserves. Sign up through our referral link for a 20% fee discount.", ctaLabel: "Join Binance Securely" },
    { type: "heading", level: 2, id: "proof-of-reserves", text: "4. Proof of Reserves" },
    { type: "paragraph", text: "After the collapse of FTX in 2022, proof of reserves became a critical requirement for trustworthy exchanges. This cryptographic verification allows users to independently confirm that the exchange holds sufficient assets to cover all user deposits. Exchanges like Binance, Kraken, and OKX regularly publish their proof of reserves." },
    { type: "heading", level: 2, id: "regulatory-compliance", text: "5. Regulatory Compliance" },
    { type: "paragraph", text: "Exchanges that operate within regulatory frameworks provide an additional layer of protection. Look for exchanges that are licensed in major jurisdictions, comply with KYC/AML requirements, and maintain transparent relationships with regulators. Coinbase and Kraken are notable for their strong regulatory compliance." },
    { type: "heading", level: 2, id: "security-checklist-summary", text: "Quick Security Checklist" },
    { type: "list", items: ["95%+ of assets in cold storage", "Hardware security key support for 2FA", "Insurance or protection fund in place", "Regular proof of reserves audits", "Licensed and regulated in major jurisdictions", "No history of major security breaches", "Withdrawal whitelist and address management features", "Anti-phishing codes and login notifications", "Bug bounty program for security researchers"] },
    { type: "heading", level: 2, id: "red-flags", text: "Red Flags to Watch For" },
    { type: "paragraph", text: "Not all exchanges prioritize security. Watch out for these warning signs: no 2FA requirement, anonymous team members, no regulatory licenses, lack of proof of reserves, promises of unrealistically high returns, and poor customer support. If an exchange exhibits any of these red flags, it\u2019s best to steer clear." },
    { type: "heading", level: 2, id: "conclusion", text: "Conclusion" },
    { type: "paragraph", text: "Taking the time to evaluate an exchange\u2019s security can save you from devastating losses. Use this checklist every time you consider a new platform, and remember: not your keys, not your coins. For long-term holdings, consider using a hardware wallet in addition to keeping funds on even the most secure exchanges." },
    { type: "internal_link", href: "/exchanges", text: "View our complete exchange reviews with detailed security ratings." },
  ]);

  const post4Content = JSON.stringify([
    { type: "paragraph", text: "The cryptocurrency world is divided between centralized exchanges (CeFi) and decentralized exchanges (DeFi). Each approach has distinct advantages and trade-offs that make them suitable for different types of users. This guide breaks down the key differences to help you decide which is right for your needs." },
    { type: "heading", level: 2, id: "what-is-cefi", text: "What Is a Centralized Exchange (CeFi)?" },
    { type: "paragraph", text: "Centralized exchanges like Binance, Coinbase, and Kraken operate similarly to traditional stock exchanges. They act as intermediaries between buyers and sellers, hold custody of user funds, and provide a familiar trading experience with order books, charts, and customer support." },
    { type: "heading", level: 2, id: "what-is-defi", text: "What Is a Decentralized Exchange (DeFi)?" },
    { type: "paragraph", text: "Decentralized exchanges like Uniswap, SushiSwap, and dYdX allow users to trade directly from their wallets without a central intermediary. They use automated market makers (AMMs) or on-chain order books to facilitate trades, giving users full control over their funds at all times." },
    { type: "heading", level: 2, id: "key-differences", text: "Key Differences Between DeFi and CeFi" },
    { type: "list", items: ["Custody: CeFi holds your funds; DeFi lets you keep control", "KYC: CeFi requires identity verification; DeFi is typically permissionless", "Fees: CeFi has transparent fee tiers; DeFi fees vary with network gas costs", "Liquidity: CeFi generally offers deeper liquidity for major pairs", "Support: CeFi provides customer support; DeFi relies on community forums", "Speed: CeFi processes trades instantly; DeFi depends on blockchain confirmation times"] },
    { type: "affiliate_cta", exchangeSlug: "coinbase", heading: "Best CeFi Experience for Beginners", text: "Coinbase offers the easiest onramp to crypto with regulatory compliance and insurance. Earn $10 in BTC when you sign up.", ctaLabel: "Start with Coinbase" },
    { type: "heading", level: 2, id: "which-is-right", text: "Which Should You Choose?" },
    { type: "paragraph", text: "For most beginners and intermediate traders, centralized exchanges offer the best combination of ease of use, liquidity, and security. DeFi is ideal for advanced users who prioritize self-custody, privacy, and access to the latest DeFi protocols and yield farming opportunities." },
    { type: "heading", level: 2, id: "conclusion", text: "Conclusion" },
    { type: "paragraph", text: "Both CeFi and DeFi have important roles in the crypto ecosystem. Many experienced traders use both: CeFi for large trades and fiat on/off-ramps, and DeFi for access to new tokens and yield opportunities. The best approach is to understand the trade-offs and choose based on your specific needs." },
    { type: "internal_link", href: "/exchanges", text: "Compare the top centralized exchanges in our comprehensive exchange directory." },
  ]);

  const post5Content = JSON.stringify([
    { type: "paragraph", text: "Cryptocurrency taxation continues to evolve rapidly as governments worldwide implement new regulations. Whether you\u2019re a casual investor or an active trader, understanding your tax obligations is essential to avoid penalties and optimize your tax position." },
    { type: "heading", level: 2, id: "taxable-events", text: "What Counts as a Taxable Event?" },
    { type: "paragraph", text: "In most jurisdictions, the following crypto activities trigger a taxable event: selling crypto for fiat currency, trading one cryptocurrency for another, using crypto to purchase goods or services, and receiving crypto as income (mining, staking, airdrops). Simply buying and holding cryptocurrency is generally not a taxable event." },
    { type: "heading", level: 2, id: "capital-gains", text: "Understanding Capital Gains Tax" },
    { type: "paragraph", text: "When you sell or trade crypto at a profit, you\u2019ll owe capital gains tax. The rate depends on how long you held the asset: short-term gains (held less than 1 year) are taxed as ordinary income, while long-term gains (held more than 1 year) benefit from lower tax rates in many countries." },
    { type: "heading", level: 2, id: "record-keeping", text: "Record-Keeping Best Practices" },
    { type: "list", items: ["Keep records of every transaction including date, amount, and price", "Use crypto tax software to automatically track your trades", "Export transaction history from all exchanges you use", "Document the cost basis for all your crypto holdings", "Save records for at least 7 years"] },
    { type: "heading", level: 2, id: "exchange-tax-reports", text: "How Exchanges Help with Tax Reporting" },
    { type: "paragraph", text: "Major exchanges like Coinbase, Kraken, and Binance provide tax reporting tools and export features. Coinbase issues 1099 forms for US users, while other exchanges provide detailed transaction history exports that can be imported into tax software." },
    { type: "affiliate_cta", exchangeSlug: "coinbase", heading: "Easiest Tax Reporting", text: "Coinbase offers integrated tax reporting tools and 1099 forms for US users, making tax season simpler.", ctaLabel: "Try Coinbase" },
    { type: "heading", level: 2, id: "conclusion", text: "Conclusion" },
    { type: "paragraph", text: "Staying on top of your crypto taxes doesn\u2019t have to be complicated. By keeping good records, using tax software, and choosing exchanges with strong reporting features, you can ensure compliance and potentially save money. Always consult with a tax professional for advice specific to your situation." },
    { type: "internal_link", href: "/blog/understanding-trading-fees", text: "Learn how trading fees affect your tax calculations in our fee guide." },
  ]);

  const post6Content = JSON.stringify([
    { type: "paragraph", text: "Welcome to the world of cryptocurrency trading! Whether you\u2019re looking to invest for the long term or actively trade, this guide covers everything you need to know to get started safely and confidently." },
    { type: "heading", level: 2, id: "getting-started", text: "Getting Started: Your First Steps" },
    { type: "paragraph", text: "The first step in your crypto journey is choosing a reputable exchange. For beginners, we recommend starting with a user-friendly platform that prioritizes security and offers educational resources. Coinbase and Binance are excellent options for first-time traders." },
    { type: "list", items: ["Choose a reputable exchange (see our comparison tool)", "Complete identity verification (KYC)", "Enable two-factor authentication", "Start with a small amount you can afford to lose", "Learn the basics before making your first trade"] },
    { type: "affiliate_cta", exchangeSlug: "coinbase", heading: "Perfect for Beginners", text: "Coinbase is rated #1 for beginners with its intuitive interface and educational rewards. Earn $10 in Bitcoin when you sign up.", ctaLabel: "Start on Coinbase" },
    { type: "heading", level: 2, id: "types-of-orders", text: "Understanding Order Types" },
    { type: "paragraph", text: "There are several types of orders you can place on a crypto exchange. The two most common are market orders (buy/sell immediately at the current price) and limit orders (buy/sell at a specific price you set). Limit orders give you more control and typically result in lower fees." },
    { type: "heading", level: 2, id: "risk-management", text: "Risk Management Basics" },
    { type: "paragraph", text: "Cryptocurrency markets are highly volatile. Proper risk management is crucial for long-term success. Never invest more than you can afford to lose, diversify across multiple assets, and consider using dollar-cost averaging (DCA) to reduce the impact of market volatility." },
    { type: "list", items: ["Never invest more than you can afford to lose", "Diversify your portfolio across different cryptocurrencies", "Use dollar-cost averaging (DCA) for long-term investing", "Set stop-loss orders to limit potential losses", "Take profits at predetermined levels"] },
    { type: "heading", level: 2, id: "common-mistakes", text: "Common Beginner Mistakes to Avoid" },
    { type: "paragraph", text: "New traders often fall into predictable traps: FOMO buying at all-time highs, panic selling during dips, over-leveraging positions, neglecting security, and failing to do their own research. Being aware of these pitfalls can save you from costly mistakes." },
    { type: "heading", level: 2, id: "conclusion", text: "Conclusion" },
    { type: "paragraph", text: "Cryptocurrency trading can be rewarding but requires education, patience, and discipline. Start small, learn continuously, and never stop improving your strategy. With the right exchange and proper risk management, you\u2019ll be well on your way to becoming a confident crypto trader." },
    { type: "internal_link", href: "/blog/best-crypto-exchanges-2025", text: "Read our guide to the best crypto exchanges for 2025 to find the perfect platform for you." },
  ]);

  await prisma.blogPost.createMany({
    data: [
      {
        slug: "best-crypto-exchanges-2025",
        title: "Best Crypto Exchanges in 2025: A Comprehensive Comparison",
        content: post1Content,
        metaTitle: "Best Crypto Exchanges 2025 - Fees, Security & Features Compared",
        metaDescription:
          "Compare the best cryptocurrency exchanges of 2025. Detailed analysis of Binance, Coinbase, Kraken, Bybit, and OKX with fee comparisons and security ratings.",
        featuredImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop",
        category: "guides",
        tags: ["exchanges", "comparison", "2025", "reviews"],
        publishedAt: new Date("2025-01-15"),
        aiGenerated: false,
      },
      {
        slug: "understanding-trading-fees",
        title: "Understanding Crypto Trading Fees: Maker vs Taker Explained",
        content: post2Content,
        metaTitle: "Crypto Trading Fees Explained - Maker vs Taker | CryptoCompare AI",
        metaDescription:
          "Learn the difference between maker and taker fees, how exchange fee tiers work, and proven strategies to reduce your crypto trading costs.",
        featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop",
        category: "education",
        tags: ["fees", "trading", "education", "beginners"],
        publishedAt: new Date("2025-02-10"),
        aiGenerated: false,
      },
      {
        slug: "exchange-security-checklist",
        title: "Crypto Exchange Security Checklist: What to Look For",
        content: post3Content,
        metaTitle: "Crypto Exchange Security Checklist - Stay Safe | CryptoCompare AI",
        metaDescription:
          "Essential security checklist for evaluating cryptocurrency exchanges. Learn about cold storage, 2FA, insurance funds, and proof of reserves.",
        featuredImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop",
        category: "security",
        tags: ["security", "safety", "checklist", "2025"],
        publishedAt: new Date("2025-03-05"),
        aiGenerated: true,
      },
      {
        slug: "defi-vs-cefi-exchanges",
        title: "DeFi vs CeFi: Which Type of Exchange Is Right for You?",
        content: post4Content,
        metaTitle: "DeFi vs CeFi Exchanges - Which Is Better? | CryptoCompare AI",
        metaDescription:
          "Compare decentralized (DeFi) and centralized (CeFi) cryptocurrency exchanges. Learn the pros, cons, and which type is right for your trading style.",
        featuredImage: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&h=630&fit=crop",
        category: "education",
        tags: ["defi", "cefi", "exchanges", "education"],
        publishedAt: new Date("2025-04-20"),
        aiGenerated: false,
      },
      {
        slug: "crypto-tax-guide-2025",
        title: "Crypto Tax Guide 2025: What Traders Need to Know",
        content: post5Content,
        metaTitle: "Crypto Tax Guide 2025 - What You Need to Know | CryptoCompare AI",
        metaDescription:
          "Complete guide to cryptocurrency taxes in 2025. Learn about taxable events, capital gains, record-keeping, and how exchanges help with tax reporting.",
        featuredImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop",
        category: "guides",
        tags: ["taxes", "regulation", "2025", "guides"],
        publishedAt: new Date("2025-05-15"),
        aiGenerated: false,
      },
      {
        slug: "beginner-guide-to-crypto-trading",
        title: "Complete Beginner's Guide to Cryptocurrency Trading",
        content: post6Content,
        metaTitle: "Beginner's Guide to Crypto Trading | CryptoCompare AI",
        metaDescription:
          "Complete beginner's guide to cryptocurrency trading. Learn about exchanges, order types, risk management, and common mistakes to avoid.",
        featuredImage: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=1200&h=630&fit=crop",
        category: "education",
        tags: ["beginners", "trading", "education", "guides"],
        publishedAt: new Date("2025-06-01"),
        aiGenerated: false,
      },
    ],
  });

  console.log("Created 6 blog posts");

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
