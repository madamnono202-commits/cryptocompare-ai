import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Exchanges | CryptoCompare AI",
  description: "Compare crypto exchanges side-by-side.",
};

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Compare Exchanges</h1>
      <p className="mt-4 text-muted-foreground">
        Side-by-side exchange comparison coming soon.
      </p>
    </div>
  );
}
