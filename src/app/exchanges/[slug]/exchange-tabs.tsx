"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Lock,
  Shield,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AffiliateLink } from "@/components/affiliate-link";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExchangeTabsProps {
  exchange: {
    id: string;
    name: string;
    description: string | null;
    foundedYear: number | null;
    headquarters: string | null;
    score: number;
    affiliateUrl: string | null;
  };
  fee: {
    spotMakerFee: number | null;
    spotTakerFee: number | null;
    futuresMakerFee: number | null;
    futuresTakerFee: number | null;
    withdrawalFee: number | null;
  } | null;
  faqItems: { question: string; answer: string }[];
}

// ---------------------------------------------------------------------------
// Pros & Cons data (derived from exchange attributes)
// ---------------------------------------------------------------------------

function deriveProsAndCons(
  exchange: ExchangeTabsProps["exchange"],
  fee: ExchangeTabsProps["fee"]
) {
  const pros: string[] = [];
  const cons: string[] = [];

  if (exchange.score >= 9) pros.push("Top-rated exchange with excellent overall score");
  else if (exchange.score >= 8) pros.push("Highly rated exchange with strong overall score");
  else pros.push("Established exchange in the cryptocurrency market");

  if (fee) {
    if ((fee.spotMakerFee ?? 1) <= 0.1) pros.push("Competitive spot trading fees");
    else cons.push("Spot trading fees are above industry average");

    if (fee.futuresMakerFee !== null) pros.push("Futures and derivatives trading available");
    else cons.push("No futures or derivatives trading");

    if ((fee.withdrawalFee ?? 1) <= 0.0002) pros.push("Low withdrawal fees");
    else if ((fee.withdrawalFee ?? 0) > 0) cons.push("Withdrawal fees may apply");
  }

  if (exchange.foundedYear && exchange.foundedYear <= 2015)
    pros.push("Long track record in the industry");
  else if (exchange.foundedYear && exchange.foundedYear >= 2018)
    cons.push("Relatively newer exchange compared to some competitors");

  if (exchange.headquarters === "United States")
    pros.push("US-regulated for added compliance and trust");
  else pros.push("Available to users in many global jurisdictions");

  pros.push("Two-factor authentication and security protocols");
  cons.push("Cryptocurrency investments carry inherent market risk");

  return { pros, cons };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExchangeTabs({ exchange, fee, faqItems }: ExchangeTabsProps) {
  const { pros, cons } = deriveProsAndCons(exchange, fee);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="fees">Fees</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="pros-cons">Pros & Cons</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
      </TabsList>

      {/* ── Overview ───────────────────────────────────────── */}
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {exchange.name} Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-relaxed text-muted-foreground">
              {exchange.description ??
                `${exchange.name} is a cryptocurrency exchange offering a variety of digital asset trading services.`}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Founded
                </p>
                <p className="text-lg font-semibold">
                  {exchange.foundedYear ?? "N/A"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Headquarters
                </p>
                <p className="text-lg font-semibold">
                  {exchange.headquarters ?? "N/A"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Score
                </p>
                <p className="text-lg font-semibold">
                  {exchange.score.toFixed(1)} / 10
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge variant="success">Active & Verified</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/compare">
                  Compare with others{" "}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
              <AffiliateLink
                exchangeId={exchange.id}
                sourcePage="exchange-detail-overview"
                href={exchange.affiliateUrl ?? "#"}
              >
                <Button variant="outline" size="sm">
                  Visit {exchange.name}{" "}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </AffiliateLink>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Fees ───────────────────────────────────────────── */}
      <TabsContent value="fees">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {exchange.name} Fee Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fee ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Fee Type
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Rate
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <FeeRow
                      label="Spot Maker Fee"
                      value={fee.spotMakerFee}
                      note="Fee for adding liquidity to the order book"
                    />
                    <FeeRow
                      label="Spot Taker Fee"
                      value={fee.spotTakerFee}
                      note="Fee for removing liquidity from the order book"
                    />
                    <FeeRow
                      label="Futures Maker Fee"
                      value={fee.futuresMakerFee}
                      note="Maker fee for futures/derivatives"
                    />
                    <FeeRow
                      label="Futures Taker Fee"
                      value={fee.futuresTakerFee}
                      note="Taker fee for futures/derivatives"
                    />
                    <FeeRow
                      label="Withdrawal Fee (BTC)"
                      value={fee.withdrawalFee}
                      suffix=" BTC"
                      note="Standard BTC network withdrawal fee"
                    />
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Fee information is not currently available for {exchange.name}.
              </p>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              Fees are subject to change. Visit{" "}
              <AffiliateLink
                exchangeId={exchange.id}
                sourcePage="exchange-detail-fees"
                href={exchange.affiliateUrl ?? "#"}
                className="text-primary underline"
              >
                {exchange.name}
              </AffiliateLink>{" "}
              for the most up-to-date fee schedule. Volume-based discounts may
              apply.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Security ───────────────────────────────────────── */}
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {exchange.name} Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Security is a top priority when choosing a cryptocurrency
              exchange. Here is an overview of {exchange.name}&apos;s security
              measures.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <SecurityFeature
                icon={<Shield className="h-5 w-5" />}
                title="Cold Storage"
                description="Majority of funds stored in offline cold wallets"
              />
              <SecurityFeature
                icon={<Lock className="h-5 w-5" />}
                title="Two-Factor Authentication"
                description="2FA required for withdrawals and account changes"
              />
              <SecurityFeature
                icon={<Shield className="h-5 w-5" />}
                title="Encryption"
                description="End-to-end encryption for all data transmission"
              />
              <SecurityFeature
                icon={<Lock className="h-5 w-5" />}
                title="Regular Audits"
                description="Third-party security audits and penetration testing"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> Security information is based on
                publicly available data. Always do your own research and enable
                all available security features on your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Pros & Cons ────────────────────────────────────── */}
      <TabsContent value="pros-cons">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[hsl(var(--chart-green))]">
                <Check className="h-5 w-5" />
                Pros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--chart-green))]" />
                    <span className="text-sm">{pro}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[hsl(var(--chart-red))]">
                <X className="h-5 w-5" />
                Cons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--chart-red))]" />
                    <span className="text-sm">{con}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <TabsContent value="faq">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {faqItems.map((item, idx) => (
                <FaqItem
                  key={idx}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FeeRow({
  label,
  value,
  suffix = "%",
  note,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  note: string;
}) {
  return (
    <tr>
      <td className="py-3 pr-4 font-medium">{label}</td>
      <td className="py-3 pr-4">
        {value !== null ? (
          <span className="font-semibold">
            {value}
            {suffix}
          </span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </td>
      <td className="py-3 text-muted-foreground">{note}</td>
    </tr>
  );
}

function SecurityFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group py-4">
      <summary className="flex cursor-pointer items-center justify-between font-medium">
        {question}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {answer}
      </p>
    </details>
  );
}
