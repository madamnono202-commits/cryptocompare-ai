import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Placeholder } from "@/components/ui/placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExchangePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ExchangePageProps): Promise<Metadata> {
  const name = params.slug.replace(/-/g, " ");
  return {
    title: `${name} Review`,
    description: `In-depth review, fees, and features for ${name}.`,
  };
}

export default function ExchangePage({ params }: ExchangePageProps) {
  const name = params.slug.replace(/-/g, " ");

  return (
    <Section size="lg">
      <Container>
        {/* Breadcrumb */}
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link href="/exchanges">
            <ArrowLeft className="mr-1 h-4 w-4" /> All Exchanges
          </Link>
        </Button>

        {/* Exchange header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-xl font-bold uppercase">
              {name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold capitalize">{name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="success">Verified</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-[hsl(var(--chart-yellow))] text-[hsl(var(--chart-yellow))]" />
                  4.5/5
                </span>
              </div>
            </div>
          </div>
          <Button className="bg-gradient-brand hover:opacity-90">
            Visit Exchange <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Content grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Placeholder
                  label="Exchange Overview"
                  description="Detailed exchange description, pros/cons, and editorial review will appear here."
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fee Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <Placeholder
                  label="Fee Comparison Table"
                  description="Trading, withdrawal, and deposit fee breakdowns will render here."
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <Placeholder
                  label="Key Metrics"
                  description="Volume, supported coins, year founded, etc."
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sign-Up Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <Placeholder
                  label="Affiliate CTA"
                  description="Exclusive offer and affiliate signup button will appear here."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
