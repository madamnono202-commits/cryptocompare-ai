import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { PriceTable } from "@/components/prices/price-table";
import { getMarketData } from "@/lib/coingecko";

export const metadata: Metadata = {
  title: "Live Crypto Prices",
  description:
    "Track real-time cryptocurrency prices, market cap, volume, and 24h/7d changes for the top 200 coins. Compare prices across major exchanges.",
  openGraph: {
    title: "Live Crypto Prices | CryptoCompare AI",
    description:
      "Track real-time cryptocurrency prices, market cap, volume, and 24h/7d changes for the top 200 coins.",
  },
};

// Re-validate every 2 minutes (ISR)
export const revalidate = 120;

export default async function PricesPage() {
  let coins;
  try {
    coins = await getMarketData(1, 200);
  } catch {
    coins = [];
  }

  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Live Crypto Prices"
          description="Track real-time cryptocurrency prices and market data for the top 200 coins by market cap."
        />
        <div className="mt-10">
          {coins.length > 0 ? (
            <PriceTable coins={coins} />
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-lg font-semibold">Unable to load price data</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Please try again later. CoinGecko API may be temporarily unavailable.
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
