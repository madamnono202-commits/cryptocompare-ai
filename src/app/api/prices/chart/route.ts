import { NextRequest, NextResponse } from "next/server";
import { getMarketChart } from "@/lib/coingecko";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const coinId = searchParams.get("coinId");
  const days = searchParams.get("days") ?? "7";

  if (!coinId) {
    return NextResponse.json(
      { error: "coinId is required" },
      { status: 400 }
    );
  }

  try {
    const data = await getMarketChart(coinId, days);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 502 }
    );
  }
}
