"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { CoinMarketData } from "@/lib/coingecko";
import { SparklineChart } from "./sparkline-chart";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortField =
  | "market_cap_rank"
  | "current_price"
  | "price_change_percentage_24h"
  | "price_change_percentage_7d_in_currency"
  | "total_volume"
  | "market_cap";

type SortDirection = "asc" | "desc";

interface PriceTableProps {
  coins: CoinMarketData[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceTable({ coins }: PriceTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("market_cap_rank");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // ---- Filtering ----
  const filtered = useMemo(() => {
    if (!search.trim()) return coins;
    const q = search.toLowerCase();
    return coins.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [coins, search]);

  // ---- Sorting ----
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "market_cap_rank" ? "asc" : "desc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />;
    }
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 inline h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="ml-1 inline h-3 w-3 text-primary" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {sorted.length} of {coins.length} coins
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-left font-medium"
                onClick={() => toggleSort("market_cap_rank")}
              >
                # <SortIcon field="market_cap_rank" />
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                Coin
              </th>
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium"
                onClick={() => toggleSort("current_price")}
              >
                Price <SortIcon field="current_price" />
              </th>
              <th
                className="cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium"
                onClick={() => toggleSort("price_change_percentage_24h")}
              >
                24h % <SortIcon field="price_change_percentage_24h" />
              </th>
              <th
                className="hidden cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium md:table-cell"
                onClick={() => toggleSort("price_change_percentage_7d_in_currency")}
              >
                7d % <SortIcon field="price_change_percentage_7d_in_currency" />
              </th>
              <th
                className="hidden cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium lg:table-cell"
                onClick={() => toggleSort("total_volume")}
              >
                Volume (24h) <SortIcon field="total_volume" />
              </th>
              <th
                className="hidden cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium sm:table-cell"
                onClick={() => toggleSort("market_cap")}
              >
                Market Cap <SortIcon field="market_cap" />
              </th>
              <th className="hidden whitespace-nowrap px-4 py-3 text-right font-medium xl:table-cell">
                7d Chart
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((coin) => (
              <tr
                key={coin.id}
                className="border-b transition-colors hover:bg-muted/20"
              >
                {/* Rank */}
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {coin.market_cap_rank ?? "—"}
                </td>

                {/* Coin name + symbol */}
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={`/prices/${coin.id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-xs uppercase text-muted-foreground">
                      {coin.symbol}
                    </span>
                  </Link>
                </td>

                {/* Price */}
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                  {formatCurrency(coin.current_price)}
                </td>

                {/* 24h change */}
                <td
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-right font-medium",
                    (coin.price_change_percentage_24h ?? 0) >= 0
                      ? "text-[hsl(var(--chart-green))]"
                      : "text-[hsl(var(--chart-red))]"
                  )}
                >
                  {formatPercent(coin.price_change_percentage_24h)}
                </td>

                {/* 7d change */}
                <td
                  className={cn(
                    "hidden whitespace-nowrap px-4 py-3 text-right font-medium md:table-cell",
                    (coin.price_change_percentage_7d_in_currency ?? 0) >= 0
                      ? "text-[hsl(var(--chart-green))]"
                      : "text-[hsl(var(--chart-red))]"
                  )}
                >
                  {formatPercent(coin.price_change_percentage_7d_in_currency)}
                </td>

                {/* Volume */}
                <td className="hidden whitespace-nowrap px-4 py-3 text-right text-muted-foreground lg:table-cell">
                  {formatCurrency(coin.total_volume, { compact: true })}
                </td>

                {/* Market cap */}
                <td className="hidden whitespace-nowrap px-4 py-3 text-right text-muted-foreground sm:table-cell">
                  {formatCurrency(coin.market_cap, { compact: true })}
                </td>

                {/* Sparkline */}
                <td className="hidden px-4 py-3 xl:table-cell">
                  <div className="ml-auto w-[100px]">
                    <SparklineChart
                      data={coin.sparkline_in_7d?.price ?? []}
                      positive={
                        (coin.price_change_percentage_7d_in_currency ?? 0) >= 0
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No coins found matching &ldquo;{search}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
