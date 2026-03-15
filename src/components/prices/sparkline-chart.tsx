"use client";

import { ResponsiveContainer, LineChart, Line } from "recharts";

interface SparklineChartProps {
  data: number[];
  positive: boolean;
}

export function SparklineChart({ data, positive }: SparklineChartProps) {
  if (!data.length) return null;

  // Sample down to ~30 points for performance
  const step = Math.max(1, Math.floor(data.length / 30));
  const sampled = data.filter((_, i) => i % step === 0).map((price) => ({ price }));

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={sampled}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={positive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
