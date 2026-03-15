import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="container mx-auto flex flex-col items-center gap-8 px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
        Find the Best Crypto Exchange
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Compare fees, features, and security across top cryptocurrency exchanges.
        Make smarter trading decisions with AI-powered insights.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/compare">Compare Exchanges</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/blog">Read Our Guides</Link>
        </Button>
      </div>
    </section>
  );
}
