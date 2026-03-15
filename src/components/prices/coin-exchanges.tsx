"use client";

import { ExternalLink } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { CoinTicker } from "@/lib/coingecko";

interface CoinExchangesProps {
  tickers: CoinTicker[];
}

export function CoinExchanges({ tickers }: CoinExchangesProps) {
  // Dedupe by exchange and show top 10 by volume
  const seen = new Set<string>();
  const unique = tickers.filter((t) => {
    if (seen.has(t.market.identifier)) return false;
    seen.add(t.market.identifier);
    return true;
  });

  const top = unique
    .sort((a, b) => b.converted_volume.usd - a.converted_volume.usd)
    .slice(0, 10);

  if (top.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No exchange data available for this coin.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
              Exchange
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
              Pair
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
              Price
            </th>
            <th className="hidden whitespace-nowrap px-4 py-3 text-right font-medium sm:table-cell">
              Volume (USD)
            </th>
            <th className="hidden whitespace-nowrap px-4 py-3 text-right font-medium md:table-cell">
              Trust
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
              Trade
            </th>
          </tr>
        </thead>
        <tbody>
          {top.map((ticker, i) => (
            <tr
              key={`${ticker.market.identifier}-${i}`}
              className="border-b transition-colors hover:bg-muted/20"
            >
              <td className="whitespace-nowrap px-4 py-3 font-medium">
                {ticker.market.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {ticker.base}/{ticker.target}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {formatCurrency(ticker.converted_last.usd)}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-right text-muted-foreground sm:table-cell">
                {formatNumber(ticker.converted_volume.usd, { compact: true })}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-right md:table-cell">
                <span
                  className={
                    ticker.trust_score === "green"
                      ? "text-[hsl(var(--chart-green))]"
                      : ticker.trust_score === "yellow"
                        ? "text-[hsl(var(--chart-yellow))]"
                        : "text-muted-foreground"
                  }
                >
                  {ticker.trust_score === "green"
                    ? "High"
                    : ticker.trust_score === "yellow"
                      ? "Medium"
                      : "—"}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {ticker.trade_url ? (
                  <a
                    href={ticker.trade_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    data-affiliate-placeholder="true"
                  >
                    Trade <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
