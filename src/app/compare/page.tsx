import { Metadata } from "next";
import { ExternalLink, Scale } from "lucide-react";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AffiliateLink } from "@/components/affiliate-link";

export const metadata: Metadata = {
  title: "Compare Exchanges",
  description: "Compare crypto exchanges side-by-side.",
};

async function getFeaturedExchanges() {
  try {
    return await db.exchange.findMany({
      orderBy: { score: "desc" },
      take: 4,
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        score: true,
        affiliateUrl: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function ComparePage() {
  const exchanges = await getFeaturedExchanges();

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

          {/* Featured exchange cards with tracked CTAs */}
          {exchanges.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Featured Exchanges
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {exchanges.map((ex) => (
                  <Card key={ex.id}>
                    <CardContent className="flex items-center gap-4 p-5">
                      {ex.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ex.logoUrl}
                          alt={`${ex.name} logo`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg bg-muted object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-bold uppercase">
                          {ex.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {(ex.score ?? 0).toFixed(1)}/10
                        </p>
                      </div>
                      <AffiliateLink
                        exchangeId={ex.id}
                        sourcePage="compare"
                        href={ex.affiliateUrl ?? "#"}
                      >
                        <Button size="sm" variant="outline">
                          Visit <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </AffiliateLink>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
