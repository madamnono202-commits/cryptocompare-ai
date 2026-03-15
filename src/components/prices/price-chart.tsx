"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MarketChartData } from "@/lib/coingecko";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PriceChartProps {
  coinId: string;
  initialData: MarketChartData;
}

const TIME_RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PriceChart({ coinId, initialData }: PriceChartProps) {
  const [activeDays, setActiveDays] = useState(7);
  const [chartData, setChartData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const fetchChart = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prices/chart?coinId=${coinId}&days=${days}`);
      if (res.ok) {
        const data: MarketChartData = await res.json();
        setChartData(data);
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [coinId]);

  useEffect(() => {
    if (activeDays !== 7) {
      fetchChart(activeDays);
    }
  }, [activeDays, fetchChart]);

  const prices = chartData.prices.map(([timestamp, price]) => ({
    date: timestamp,
    price,
  }));

  const firstPrice = prices[0]?.price ?? 0;
  const lastPrice = prices[prices.length - 1]?.price ?? 0;
  const isPositive = lastPrice >= firstPrice;
  const gradientColor = isPositive ? "142, 76%, 36%" : "0, 84%, 60%";

  function formatXAxisDate(timestamp: number) {
    const d = new Date(timestamp);
    if (activeDays <= 1) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-4">
      {/* Time range selector */}
      <div className="flex gap-1">
        {TIME_RANGES.map(({ label, days }) => (
          <button
            key={days}
            onClick={() => setActiveDays(days)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeDays === days
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className={cn("relative", loading && "opacity-50")}>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={prices}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`hsl(${gradientColor})`} stopOpacity={0.3} />
                <stop offset="95%" stopColor={`hsl(${gradientColor})`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisDate}
              stroke="hsl(215, 20%, 55%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
              stroke="hsl(215, 20%, 55%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 8%)",
                border: "1px solid hsl(217, 33%, 17%)",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelFormatter={(ts: number) =>
                new Date(ts).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              formatter={(value: number) => [formatCurrency(value), "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={`hsl(${gradientColor})`}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
