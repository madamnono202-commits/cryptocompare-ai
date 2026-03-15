import Link from "next/link";
import { ArrowLeftRight, Calculator, Clock, Percent } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const tools = [
  {
    title: "Fee Calculator",
    description: "Estimate your trading costs",
    icon: Calculator,
    href: "/tools",
  },
  {
    title: "Crypto Converter",
    description: "Convert between any pairs",
    icon: ArrowLeftRight,
    href: "/tools",
  },
  {
    title: "APY Comparison",
    description: "Compare staking yields",
    icon: Percent,
    href: "/tools",
  },
  {
    title: "Price Alerts",
    description: "Never miss a price target",
    icon: Clock,
    href: "/tools",
  },
];

export function ToolsStrip() {
  return (
    <Section variant="card" size="sm">
      <Container>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <tool.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{tool.title}</p>
                <p className="text-xs text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
