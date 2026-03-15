import { Metadata } from "next";
import { Scale } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";

export const metadata: Metadata = {
  title: "Compare Exchanges",
  description: "Compare crypto exchanges side-by-side.",
};

export default function ComparePage() {
  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Compare Exchanges"
          description="Select two or more exchanges to compare fees, features, security, and supported assets side-by-side."
        />
        <div className="mt-10 space-y-8">
          <Placeholder
            label="Exchange Selector"
            description="Dropdown selectors to pick exchanges for comparison will appear here."
            icon={<Scale className="h-6 w-6 text-muted-foreground" />}
          />
          <Placeholder
            label="Comparison Table"
            description="Side-by-side comparison table with fees, features, and ratings will render here."
          />
        </div>
      </Container>
    </Section>
  );
}
