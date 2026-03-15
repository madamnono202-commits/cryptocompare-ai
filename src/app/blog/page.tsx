import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { BlogGrid } from "@/components/blog/blog-grid";
import { db } from "@/lib/db";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Crypto exchange news, in-depth guides, and expert insights to help you make smarter trading decisions.",
  openGraph: {
    title: "Blog | CryptoCompare AI",
    description:
      "Crypto exchange news, in-depth guides, and expert insights to help you make smarter trading decisions.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | CryptoCompare AI",
    description:
      "Crypto exchange news, in-depth guides, and expert insights to help you make smarter trading decisions.",
  },
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
};

async function getBlogPosts() {
  try {
    return await db.blogPost.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        content: true,
        category: true,
        tags: true,
        featuredImage: true,
        publishedAt: true,
      },
    });
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Blog"
          description="Crypto exchange news, in-depth guides, and expert insights."
        />
        <div className="mt-10">
          <BlogGrid posts={posts} />
        </div>
      </Container>
    </Section>
  );
}
