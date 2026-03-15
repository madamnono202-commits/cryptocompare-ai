import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/ui/page-header";
import { Placeholder } from "@/components/ui/placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog",
  description: "Crypto exchange news, guides, and insights.",
};

const dummyPosts = [
  { title: "Best Crypto Exchanges for Beginners in 2025", category: "Guide" },
  { title: "How to Compare Exchange Fees Like a Pro", category: "Tutorial" },
  { title: "Top 5 Most Secure Exchanges Ranked", category: "Review" },
];

export default function BlogPage() {
  return (
    <Section size="lg">
      <Container>
        <PageHeader
          heading="Blog"
          description="Crypto exchange news, in-depth guides, and expert insights."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyPosts.map((post) => (
            <Card key={post.title} className="flex flex-col">
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {post.category}
                </p>
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <Placeholder
                  label="Article Preview"
                  description="Featured image, excerpt, and read-more link will appear here."
                  className="h-full min-h-[120px]"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
