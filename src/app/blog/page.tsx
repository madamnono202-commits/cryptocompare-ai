import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | CryptoCompare AI",
  description: "Crypto exchange news, guides, and insights.",
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <p className="mt-4 text-muted-foreground">
        Articles and guides coming soon.
      </p>
    </div>
  );
}
