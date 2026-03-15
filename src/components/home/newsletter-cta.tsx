"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewsletterCta() {
  return (
    <section className="border-t bg-gradient-brand py-16 text-white sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Stay Ahead of the Market
          </h2>
          <p className="text-white/80">
            Get weekly exchange comparisons, fee updates, and exclusive offers
            delivered straight to your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <Button
              type="submit"
              className="bg-white text-[hsl(var(--gradient-start))] hover:bg-white/90"
            >
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-white/50">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
