import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BlogContentRenderer } from "@/components/blog/blog-content-renderer";
import { TableOfContents } from "@/components/blog/table-of-contents";
import {
  parseBlogContent,
  extractToc,
  formatDate,
  generateExcerpt,
} from "@/types/blog";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getBlogPost(slug: string) {
  const post = await db.blogPost.findUnique({
    where: { slug },
  });
  return post;
}

async function getRelatedPosts(currentSlug: string, category: string | null) {
  const posts = await db.blogPost.findMany({
    where: {
      slug: { not: currentSlug },
      publishedAt: { not: null },
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      slug: true,
      title: true,
      category: true,
      featuredImage: true,
      publishedAt: true,
      content: true,
      tags: true,
    },
  });
  return posts;
}

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  try {
    const posts = await db.blogPost.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// SEO Metadata
// ---------------------------------------------------------------------------

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  let post;
  try {
    post = await getBlogPost(params.slug);
  } catch {
    post = null;
  }

  if (!post) {
    return { title: "Post Not Found" };
  }

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription ||
    generateExcerpt(parseBlogContent(post.content), 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/blog/${post.slug}`,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [siteConfig.name],
      images: post.featuredImage
        ? [{ url: post.featuredImage, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
    alternates: {
      canonical: `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Schema markup
// ---------------------------------------------------------------------------

function buildArticleJsonLd(
  post: NonNullable<Awaited<ReturnType<typeof getBlogPost>>>
) {
  const sections = parseBlogContent(post.content);
  const excerpt = generateExcerpt(sections, 200);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || excerpt,
    image: post.featuredImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.createdAt.toISOString(),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
    articleSection: post.category || undefined,
    keywords: post.tags.join(", "),
  };
}

function buildBreadcrumbJsonLd(postTitle: string, postSlug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteConfig.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: postTitle,
        item: `${siteConfig.url}/blog/${postSlug}`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  let post;
  let relatedPosts;

  try {
    post = await getBlogPost(params.slug);
    if (post) {
      relatedPosts = await getRelatedPosts(params.slug, post.category);
    }
  } catch {
    notFound();
  }

  if (!post) notFound();

  const sections = parseBlogContent(post.content);
  const tocEntries = extractToc(sections);
  const articleJsonLd = buildArticleJsonLd(post);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(post.title, post.slug);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero / Header */}
      <Section size="lg" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <Container className="relative">
          {/* Breadcrumb */}
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
            <Link href="/blog">
              <ArrowLeft className="mr-1 h-4 w-4" /> All Articles
            </Link>
          </Button>

          {/* Category & Date */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {post.category && (
              <Link href="/blog">
                <Badge variant="default" className="uppercase">
                  {post.category}
                </Badge>
              </Link>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
            )}
            {post.aiGenerated && (
              <Badge variant="secondary">AI Generated</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* Featured Image */}
      {post.featuredImage && (
        <Section size="sm">
          <Container>
            <div className="overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full object-cover"
                style={{ maxHeight: "480px" }}
              />
            </div>
          </Container>
        </Section>
      )}

      {/* Article Content */}
      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Main content */}
            <article>
              <BlogContentRenderer sections={sections} />
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                {tocEntries.length > 0 && (
                  <TableOfContents entries={tocEntries} />
                )}

                {/* Internal links */}
                <div className="rounded-xl border bg-card p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Explore More
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/compare"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Compare Exchanges
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/exchanges"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Exchange Reviews
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/offers"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Exclusive Offers
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/blog"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        All Articles
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <Section variant="muted">
          <Container>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Related Articles</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/blog">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`}>
                  <Card className="flex h-full flex-col overflow-hidden transition-transform hover:scale-[1.02]">
                    {rp.featuredImage && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rp.featuredImage}
                          alt={rp.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="flex-1 p-5">
                      {rp.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {rp.category}
                        </span>
                      )}
                      <h3 className="mt-1 font-semibold leading-tight">
                        {rp.title}
                      </h3>
                      {rp.publishedAt && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(rp.publishedAt)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
