import { Metadata } from "next";
import { Calculator, ArrowLeftRight, Percent, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Trading Tools",
  description: "Free crypto trading tools, calculators, and converters.",
};

const tools = [
  {
    title: "Fee Calculator",
    description: "Estimate trading fees across exchanges before you trade.",
    icon: Calculator,
  },
  {
    title: "Crypto Converter",
    description: "Convert between any cryptocurrency and fiat currency instantly.",
    icon: ArrowLeftRight,
  },
  {
    title: "APY Comparison",
    description: "Compare staking and lending yields across platforms.",
    icon: Percent,
  },
  {
    title: "Price Alerts",
    description: "Set custom price alerts for your favorite cryptocurrencies.",
    icon: Clock,
  },
];

export default function ToolsPage() {
  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Trading Tools"
          description="Free calculators, converters, and utilities to help you trade smarter."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {tools.map((tool) => (
            <Card key={tool.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {tool.description}
                </p>
                <Placeholder
                  label={tool.title}
                  description="Interactive tool will be built here."
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
