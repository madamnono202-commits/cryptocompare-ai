import { Metadata } from "next";
import { ArrowRight, Gift } from "lucide-react";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AffiliateLink } from "@/components/affiliate-link";

export const metadata: Metadata = {
  title: "Exclusive Offers",
  description:
    "Exclusive sign-up bonuses and fee discounts from top crypto exchanges.",
};

async function getActiveOffers() {
  try {
    return await db.exchangeOffer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        exchange: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
            affiliateUrl: true,
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function OffersPage() {
  const offers = await getActiveOffers();

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
        <div className="mt-10 space-y-6">
          {offers.length > 0 ? (
            offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {offer.exchange.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={offer.exchange.logoUrl}
                        alt={`${offer.exchange.name} logo`}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-xl bg-muted object-contain p-1.5"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-lg font-bold uppercase">
                        {offer.exchange.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{offer.exchange.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {offer.offerText}
                      </p>
                      {offer.bonusAmount && (
                        <Badge variant="success" className="mt-1 gap-1">
                          <Gift className="h-3 w-3" />
                          Up to ${offer.bonusAmount.toLocaleString()} bonus
                        </Badge>
                      )}
                    </div>
                  </div>
                  <AffiliateLink
                    exchangeId={offer.exchange.id}
                    sourcePage="offers"
                    href={offer.exchange.affiliateUrl ?? "#"}
                  >
                    <Button className="bg-gradient-brand hover:opacity-90">
                      Claim Offer <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </AffiliateLink>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No active offers at the moment. Check back soon!
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
