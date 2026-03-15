"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Star,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  GitCompareArrows,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ExchangeCompareData {
  id: string;
  slug: string;
  name: string;
  score: number | null;
  description: string | null;
  foundedYear: number | null;
  headquarters: string | null;
  affiliateUrl: string | null;
  spotMakerFee: number | null;
  spotTakerFee: number | null;
  futuresMakerFee: number | null;
  futuresTakerFee: number | null;
  offerText: string | null;
  bonusAmount: number | null;
  // Simulated metadata (not in DB yet)
  kycRequired: boolean;
  hasSpotTrading: boolean;
  hasFuturesTrading: boolean;
  supportedCoins: number;
}

// Simulated metadata per exchange (these fields aren't in the DB schema yet)
const EXCHANGE_METADATA: Record<
  string,
  { kycRequired: boolean; hasSpotTrading: boolean; hasFuturesTrading: boolean; supportedCoins: number }
> = {
  binance: { kycRequired: true, hasSpotTrading: true, hasFuturesTrading: true, supportedCoins: 600 },
  coinbase: { kycRequired: true, hasSpotTrading: true, hasFuturesTrading: false, supportedCoins: 250 },
  kraken: { kycRequired: true, hasSpotTrading: true, hasFuturesTrading: true, supportedCoins: 200 },
  bybit: { kycRequired: false, hasSpotTrading: true, hasFuturesTrading: true, supportedCoins: 500 },
  okx: { kycRequired: false, hasSpotTrading: true, hasFuturesTrading: true, supportedCoins: 350 },
};

export function enrichWithMetadata(
  exchanges: Omit<ExchangeCompareData, "kycRequired" | "hasSpotTrading" | "hasFuturesTrading" | "supportedCoins">[]
): ExchangeCompareData[] {
  return exchanges.map((ex) => ({
    ...ex,
    ...EXCHANGE_METADATA[ex.slug] ?? {
      kycRequired: true,
      hasSpotTrading: true,
      hasFuturesTrading: false,
      supportedCoins: 100,
    },
  }));
}

type SortField = "score" | "spotMakerFee" | "spotTakerFee" | "supportedCoins" | "name";
type SortDir = "asc" | "desc";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">--</span>;
  const variant = score >= 9 ? "success" : score >= 8 ? "warning" : "outline";
  return (
    <Badge variant={variant} className="gap-1 tabular-nums">
      <Star className="h-3 w-3" />
      {score.toFixed(1)}
    </Badge>
  );
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <Check className="h-4 w-4 text-[hsl(var(--chart-green))]" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground" />
  );
}

function handleAffiliateClick(exchangeName: string) {
  // Placeholder: in production this would log the click via API
  console.log(`[Affiliate Click] ${exchangeName} — source: /compare`);
}

export function ComparisonGrid({ exchanges }: { exchanges: ExchangeCompareData[] }) {
  const [filters, setFilters] = useState({
    kycRequired: null as boolean | null,
    spotTrading: null as boolean | null,
    futuresTrading: null as boolean | null,
  });
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const filtered = useMemo(() => {
    let result = [...exchanges];

    if (filters.kycRequired !== null) {
      result = result.filter((ex) => ex.kycRequired === filters.kycRequired);
    }
    if (filters.spotTrading !== null) {
      result = result.filter((ex) => ex.hasSpotTrading === filters.spotTrading);
    }
    if (filters.futuresTrading !== null) {
      result = result.filter((ex) => ex.hasFuturesTrading === filters.futuresTrading);
    }

    result.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case "score":
          aVal = a.score ?? 0;
          bVal = b.score ?? 0;
          break;
        case "spotMakerFee":
          aVal = a.spotMakerFee ?? 999;
          bVal = b.spotMakerFee ?? 999;
          break;
        case "spotTakerFee":
          aVal = a.spotTakerFee ?? 999;
          bVal = b.spotTakerFee ?? 999;
          break;
        case "supportedCoins":
          aVal = a.supportedCoins;
          bVal = b.supportedCoins;
          break;
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [exchanges, filters, sortField, sortDir]);

  const selectedExchanges = useMemo(
    () => exchanges.filter((ex) => selected.has(ex.id)),
    [exchanges, selected]
  );

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "spotMakerFee" || field === "spotTakerFee" ? "asc" : "desc");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  }

  const activeFilterCount =
    (filters.kycRequired !== null ? 1 : 0) +
    (filters.spotTrading !== null ? 1 : 0) +
    (filters.futuresTrading !== null ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-1.5 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({ kycRequired: null, spotTrading: null, futuresTrading: null })
              }
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selected.size >= 2 && (
            <Button
              size="sm"
              className="bg-gradient-brand hover:opacity-90"
              onClick={() => setShowComparison(!showComparison)}
            >
              <GitCompareArrows className="mr-1.5 h-4 w-4" />
              Compare {selected.size} Exchanges
            </Button>
          )}
          {selected.size > 0 && selected.size < 2 && (
            <p className="text-xs text-muted-foreground">Select 1 more to compare</p>
          )}
          {selected.size === 0 && (
            <p className="text-xs text-muted-foreground">Select 2-3 exchanges to compare</p>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FilterToggle
              label="KYC Required"
              value={filters.kycRequired}
              onChange={(v) => setFilters((f) => ({ ...f, kycRequired: v }))}
            />
            <FilterToggle
              label="Spot Trading"
              value={filters.spotTrading}
              onChange={(v) => setFilters((f) => ({ ...f, spotTrading: v }))}
            />
            <FilterToggle
              label="Futures Trading"
              value={filters.futuresTrading}
              onChange={(v) => setFilters((f) => ({ ...f, futuresTrading: v }))}
            />
          </div>
        </div>
      )}

      {/* Side-by-side comparison panel */}
      {showComparison && selectedExchanges.length >= 2 && (
        <ComparisonPanel
          exchanges={selectedExchanges}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-10 px-3 py-3" />
              <th className="px-4 py-3 text-left font-semibold">#</th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold hover:text-primary"
                onClick={() => toggleSort("name")}
              >
                <span className="inline-flex items-center">
                  Exchange <SortIcon field="name" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold hover:text-primary"
                onClick={() => toggleSort("score")}
              >
                <span className="inline-flex items-center">
                  Score <SortIcon field="score" />
                </span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold hover:text-primary"
                onClick={() => toggleSort("spotMakerFee")}
              >
                <span className="inline-flex items-center">
                  Spot Fee <SortIcon field="spotMakerFee" />
                </span>
              </th>
              <th className="px-4 py-3 text-left font-semibold">Futures Fee</th>
              <th className="px-4 py-3 text-left font-semibold">Signup Bonus</th>
              <th
                className="cursor-pointer px-4 py-3 text-left font-semibold hover:text-primary"
                onClick={() => toggleSort("supportedCoins")}
              >
                <span className="inline-flex items-center">
                  Coins <SortIcon field="supportedCoins" />
                </span>
              </th>
              <th className="px-4 py-3 text-right font-semibold" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((ex, i) => (
              <tr
                key={ex.id}
                className={`border-b transition-colors last:border-b-0 hover:bg-muted/30 ${
                  selected.has(ex.id) ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(ex.id)}
                    onChange={() => toggleSelect(ex.id)}
                    disabled={!selected.has(ex.id) && selected.size >= 3}
                    className="h-4 w-4 rounded border-muted-foreground accent-primary"
                    aria-label={`Select ${ex.name} for comparison`}
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/exchanges/${ex.slug}`}
                    className="flex items-center gap-2 font-medium hover:text-primary"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold uppercase">
                      {ex.name.charAt(0)}
                    </span>
                    <div>
                      <div>{ex.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {ex.kycRequired && <span>KYC</span>}
                        {ex.hasSpotTrading && <span>Spot</span>}
                        {ex.hasFuturesTrading && <span>Futures</span>}
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={ex.score} />
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {ex.spotMakerFee !== null
                    ? `${ex.spotMakerFee}% / ${ex.spotTakerFee ?? "—"}%`
                    : "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {ex.futuresMakerFee !== null
                    ? `${ex.futuresMakerFee}% / ${ex.futuresTakerFee ?? "—"}%`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {ex.offerText ? (
                    <div>
                      <span className="text-xs text-[hsl(var(--chart-green))]">
                        {ex.offerText.length > 35
                          ? ex.offerText.slice(0, 35) + "..."
                          : ex.offerText}
                      </span>
                      {ex.bonusAmount !== null && (
                        <Badge variant="success" className="ml-1.5 text-[10px]">
                          ${ex.bonusAmount.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">{ex.supportedCoins}+</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-brand hover:opacity-90"
                    onClick={() => handleAffiliateClick(ex.name)}
                  >
                    <Link
                      href={ex.affiliateUrl ?? `/exchanges/${ex.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Account <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                  No exchanges match your filters. Try adjusting the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((ex, i) => (
          <div
            key={ex.id}
            className={`rounded-lg border p-4 transition-colors ${
              selected.has(ex.id) ? "border-primary/50 bg-primary/5" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(ex.id)}
                onChange={() => toggleSelect(ex.id)}
                disabled={!selected.has(ex.id) && selected.size >= 3}
                className="mt-1 h-4 w-4 rounded border-muted-foreground accent-primary"
                aria-label={`Select ${ex.name} for comparison`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/exchanges/${ex.slug}`}
                    className="flex items-center gap-2 font-medium hover:text-primary"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold uppercase">
                      {ex.name.charAt(0)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{i + 1}</span>
                        {ex.name}
                      </div>
                    </div>
                  </Link>
                  <ScoreBadge score={ex.score} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Spot Fee: </span>
                    <span className="tabular-nums">
                      {ex.spotMakerFee !== null ? `${ex.spotMakerFee}%` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Futures: </span>
                    <span className="tabular-nums">
                      {ex.futuresMakerFee !== null ? `${ex.futuresMakerFee}%` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coins: </span>
                    <span>{ex.supportedCoins}+</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">KYC: </span>
                    <BoolIcon value={ex.kycRequired} />
                  </div>
                </div>

                {ex.offerText && (
                  <div className="mt-2 rounded bg-[hsl(var(--chart-green))]/10 px-2 py-1 text-xs text-[hsl(var(--chart-green))]">
                    {ex.offerText}
                  </div>
                )}

                <div className="mt-3">
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-gradient-brand hover:opacity-90"
                    onClick={() => handleAffiliateClick(ex.name)}
                  >
                    <Link
                      href={ex.affiliateUrl ?? `/exchanges/${ex.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Account <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            No exchanges match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Filter toggle ─────────────────────────────────── */

function FilterToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-1">
        {[
          { label: "All", val: null },
          { label: "Yes", val: true },
          { label: "No", val: false },
        ].map((opt) => (
          <Button
            key={String(opt.val)}
            variant={value === opt.val ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onChange(opt.val)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ── Side-by-side comparison panel ─────────────────── */

function ComparisonPanel({
  exchanges,
  onClose,
}: {
  exchanges: ExchangeCompareData[];
  onClose: () => void;
}) {
  const rows: { label: string; render: (ex: ExchangeCompareData) => React.ReactNode }[] = [
    {
      label: "Overall Score",
      render: (ex) => <ScoreBadge score={ex.score} />,
    },
    {
      label: "Spot Maker Fee",
      render: (ex) => (ex.spotMakerFee !== null ? `${ex.spotMakerFee}%` : "—"),
    },
    {
      label: "Spot Taker Fee",
      render: (ex) => (ex.spotTakerFee !== null ? `${ex.spotTakerFee}%` : "—"),
    },
    {
      label: "Futures Maker Fee",
      render: (ex) => (ex.futuresMakerFee !== null ? `${ex.futuresMakerFee}%` : "—"),
    },
    {
      label: "Futures Taker Fee",
      render: (ex) => (ex.futuresTakerFee !== null ? `${ex.futuresTakerFee}%` : "—"),
    },
    {
      label: "Supported Coins",
      render: (ex) => `${ex.supportedCoins}+`,
    },
    {
      label: "KYC Required",
      render: (ex) => <BoolIcon value={ex.kycRequired} />,
    },
    {
      label: "Spot Trading",
      render: (ex) => <BoolIcon value={ex.hasSpotTrading} />,
    },
    {
      label: "Futures Trading",
      render: (ex) => <BoolIcon value={ex.hasFuturesTrading} />,
    },
    {
      label: "Founded",
      render: (ex) => ex.foundedYear ?? "—",
    },
    {
      label: "Headquarters",
      render: (ex) => ex.headquarters ?? "—",
    },
    {
      label: "Signup Bonus",
      render: (ex) =>
        ex.offerText ? (
          <span className="text-xs text-[hsl(var(--chart-green))]">{ex.offerText}</span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="sticky left-0 bg-muted/50 px-4 py-3 text-left font-semibold">
                Feature
              </th>
              {exchanges.map((ex) => (
                <th key={ex.id} className="min-w-[140px] px-4 py-3 text-center font-semibold">
                  <Link
                    href={`/exchanges/${ex.slug}`}
                    className="hover:text-primary"
                  >
                    {ex.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <td className="sticky left-0 bg-card px-4 py-3 text-muted-foreground">
                  {row.label}
                </td>
                {exchanges.map((ex) => (
                  <td key={ex.id} className="px-4 py-3 text-center">
                    {row.render(ex)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="sticky left-0 bg-card px-4 py-3" />
              {exchanges.map((ex) => (
                <td key={ex.id} className="px-4 py-3 text-center">
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-brand hover:opacity-90"
                    onClick={() => handleAffiliateClick(ex.name)}
                  >
                    <Link
                      href={ex.affiliateUrl ?? `/exchanges/${ex.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Account
                    </Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
