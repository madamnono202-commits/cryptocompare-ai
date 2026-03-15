import { Metadata } from "next";

interface ExchangePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ExchangePageProps): Promise<Metadata> {
  return {
    title: `${params.slug} | CryptoCompare AI`,
    description: `Details and review for ${params.slug}.`,
  };
}

export default function ExchangePage({ params }: ExchangePageProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight capitalize">
        {params.slug.replace(/-/g, " ")}
      </h1>
      <p className="mt-4 text-muted-foreground">
        Exchange details page coming soon.
      </p>
    </div>
  );
}
