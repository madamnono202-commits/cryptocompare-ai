import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

interface PostPreview {
  slug: string;
  title: string;
  content: string | null;
  category: string | null;
  publishedAt: Date | null;
  aiGenerated: boolean;
}

const FALLBACK: PostPreview[] = [
  { slug: "best-crypto-exchanges-2025", title: "Best Crypto Exchanges in 2025: A Comprehensive Comparison", content: "Choosing the right cryptocurrency exchange is one of the most important decisions for any trader...", category: "guides", publishedAt: new Date("2025-01-15"), aiGenerated: false },
  { slug: "understanding-trading-fees", title: "Understanding Crypto Trading Fees: Maker vs Taker Explained", content: "Trading fees can significantly impact your profitability over time...", category: "education", publishedAt: new Date("2025-02-10"), aiGenerated: false },
  { slug: "exchange-security-checklist", title: "Crypto Exchange Security Checklist: What to Look For", content: "Security is paramount when choosing a crypto exchange...", category: "security", publishedAt: new Date("2025-03-05"), aiGenerated: true },
];

async function getLatestPosts(): Promise<PostPreview[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });

    return posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      content: p.content,
      category: p.category,
      publishedAt: p.publishedAt,
      aiGenerated: p.aiGenerated,
    }));
  } catch {
    return FALLBACK;
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export async function BlogTeaser() {
  const posts = await getLatestPosts();

  return (
    <Section>
      <Container>
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Latest from the Blog
            </h2>
            <p className="mt-1 text-muted-foreground">
              Expert guides, exchange reviews, and crypto education.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
            <Link href="/blog">
              All Articles <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
                {/* Placeholder image area */}
                <div className="flex h-40 items-center justify-center rounded-t-lg bg-muted/50">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {post.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {post.category}
                      </span>
                    )}
                    {post.aiGenerated && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  {post.content && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.content}
                    </p>
                  )}
                  {post.publishedAt && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
