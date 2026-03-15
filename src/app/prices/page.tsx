import { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";

export const metadata: Metadata = {
  title: "Live Prices",
  description: "Real-time cryptocurrency prices across major exchanges.",
};

export default function PricesPage() {
  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Live Crypto Prices"
          description="Track real-time cryptocurrency prices and market data across all major exchanges."
        />
        <div className="mt-10 space-y-8">
          <Placeholder
            label="Price Ticker Bar"
            description="Scrolling top-coin price ticker will appear here."
            icon={<TrendingUp className="h-6 w-6 text-muted-foreground" />}
          />
          <Placeholder
            label="Price Table"
            description="Sortable table with coin prices, 24h change, volume, and market cap will render here."
          />
        </div>
      </Container>
    </Section>
  );
}
