import Link from "next/link";
import { ArrowRight, ExternalLink, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateLink } from "@/components/affiliate-link";
import { db } from "@/lib/db";
import type { BlogSection } from "@/types/blog";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BlogContentRendererProps {
  sections: BlogSection[];
}

// ---------------------------------------------------------------------------
// Exchange cache for affiliate CTAs
// ---------------------------------------------------------------------------

async function getExchangeBySlug(slug: string) {
  try {
    return await db.exchange.findUnique({
      where: { slug },
      select: { id: true, name: true, affiliateUrl: true },
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export async function BlogContentRenderer({
  sections,
}: BlogContentRendererProps) {
  // Pre-fetch all exchanges referenced in CTAs
  const ctaSlugs = sections
    .filter((s): s is Extract<BlogSection, { type: "affiliate_cta" }> => s.type === "affiliate_cta")
    .map((s) => s.exchangeSlug);
  const uniqueSlugs = Array.from(new Set(ctaSlugs));
  const exchangeMap = new Map<string, Awaited<ReturnType<typeof getExchangeBySlug>>>();
  await Promise.all(
    uniqueSlugs.map(async (slug) => {
      const exchange = await getExchangeBySlug(slug);
      exchangeMap.set(slug, exchange);
    })
  );

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {sections.map((section, idx) => {
        switch (section.type) {
          case "heading": {
            const Tag = section.level === 2 ? "h2" : "h3";
            return (
              <Tag
                key={idx}
                id={section.id}
                className={
                  section.level === 2
                    ? "mt-10 mb-4 text-2xl font-bold sm:text-3xl scroll-mt-20"
                    : "mt-8 mb-3 text-xl font-bold sm:text-2xl scroll-mt-20"
                }
              >
                {section.text}
              </Tag>
            );
          }

          case "paragraph":
            return (
              <p
                key={idx}
                className="mb-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                {section.text}
              </p>
            );

          case "list":
            return (
              <ul
                key={idx}
                className="mb-6 space-y-2 pl-6 list-disc text-muted-foreground"
              >
                {section.items.map((item, i) => (
                  <li key={i} className="text-base sm:text-lg leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            );

          case "affiliate_cta": {
            const exchange = exchangeMap.get(section.exchangeSlug);
            if (!exchange) return null;
            return (
              <div
                key={idx}
                className="my-8 rounded-xl border border-primary/20 bg-primary/5 p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-foreground">
                      {section.heading}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {section.text}
                    </p>
                  </div>
                </div>
                <AffiliateLink
                  exchangeId={exchange.id}
                  sourcePage="blog-post"
                  href={exchange.affiliateUrl ?? "#"}
                >
                  <Button className="bg-gradient-brand hover:opacity-90">
                    {section.ctaLabel}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </AffiliateLink>
              </div>
            );
          }

          case "internal_link":
            return (
              <div key={idx} className="my-6">
                <Link
                  href={section.href}
                  className="group inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  {section.text}
                </Link>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
