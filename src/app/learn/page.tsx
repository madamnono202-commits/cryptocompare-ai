import { Metadata } from "next";
import { BookOpen, GraduationCap, Lightbulb, PlayCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Learn Crypto",
  description:
    "Educational guides and tutorials for crypto trading and exchange selection.",
};

const categories = [
  {
    title: "Getting Started",
    description: "New to crypto? Start here with the basics of exchanges and trading.",
    icon: GraduationCap,
  },
  {
    title: "Exchange Guides",
    description: "Step-by-step guides for choosing and using crypto exchanges.",
    icon: BookOpen,
  },
  {
    title: "Trading Strategies",
    description: "Learn proven strategies for spot trading, DCA, and more.",
    icon: Lightbulb,
  },
  {
    title: "Video Tutorials",
    description: "Watch walkthroughs and visual guides for common crypto tasks.",
    icon: PlayCircle,
  },
];

export default function LearnPage() {
  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Learn Crypto"
          description="From beginner basics to advanced trading strategies, learn everything you need to navigate the crypto world."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {categories.map((cat) => (
            <Card key={cat.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{cat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {cat.description}
                </p>
                <Placeholder
                  label={`${cat.title} Content`}
                  description="Articles and lessons for this category will appear here."
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
