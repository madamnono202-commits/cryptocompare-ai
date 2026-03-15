import { Metadata } from "next";
import { Gift } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Exclusive Offers",
  description:
    "Exclusive sign-up bonuses and fee discounts from top crypto exchanges.",
};

export default function OffersPage() {
  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Exclusive Offers"
          description="Save on trading fees and earn sign-up bonuses through our verified affiliate partnerships."
        >
          <Badge variant="success" className="mt-2 gap-1.5">
            <Gift className="h-3 w-3" />
            Limited-time deals available
          </Badge>
        </PageHeader>
        <div className="mt-10 space-y-8">
          <Placeholder
            label="Featured Offers"
            description="Highlighted affiliate offer cards with CTAs will appear here."
          />
          <Placeholder
            label="All Offers Grid"
            description="Full grid of exchange offers with filters (bonus type, exchange, etc.) will render here."
          />
        </div>
      </Container>
    </Section>
  );
}
