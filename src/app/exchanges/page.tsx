import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";

export const metadata: Metadata = {
  title: "All Exchanges",
  description:
    "Browse and filter all cryptocurrency exchanges with ratings, fees, and reviews.",
};

export default function ExchangesPage() {
  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="All Exchanges"
          description="Browse, filter, and compare every crypto exchange we track. Sorted by overall score."
        />
        <div className="mt-10 space-y-8">
          <Placeholder
            label="Filter & Search Bar"
            description="Search input and filter chips (by fee tier, supported coins, region, etc.) will appear here."
          />
          <Placeholder
            label="Exchange Listing Grid"
            description="Paginated grid of exchange cards with ratings, key stats, and affiliate CTAs will render here."
          />
        </div>
      </Container>
    </Section>
  );
}
