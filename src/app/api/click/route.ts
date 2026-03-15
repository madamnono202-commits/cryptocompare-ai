import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// POST /api/click
// Logs an affiliate click then returns the destination URL for redirect.
//
// Body (JSON):
//   exchangeId  – required, the exchange cuid
//   sourcePage  – optional, e.g. "exchange-detail", "homepage"
//   userId      – optional
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exchangeId, sourcePage, userId } = body as {
      exchangeId?: string;
      sourcePage?: string;
      userId?: string;
    };

    if (!exchangeId) {
      return NextResponse.json(
        { error: "exchangeId is required" },
        { status: 400 }
      );
    }

    // Look up the exchange to get the affiliate URL
    const exchange = await db.exchange.findUnique({
      where: { id: exchangeId },
      select: { affiliateUrl: true, name: true },
    });

    if (!exchange) {
      return NextResponse.json(
        { error: "Exchange not found" },
        { status: 404 }
      );
    }

    // Hash the IP for privacy
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

    // Log the click
    await db.affiliateClick.create({
      data: {
        exchangeId,
        sourcePage: sourcePage ?? null,
        userId: userId ?? null,
        ipHash,
      },
    });

    const redirectUrl = exchange.affiliateUrl ?? "#";

    return NextResponse.json({ redirectUrl }, { status: 200 });
  } catch (error) {
    console.error("[/api/click] Error logging affiliate click:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/click?exchangeId=...&sourcePage=...
// Convenience endpoint: logs click and redirects in one step.
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const exchangeId = searchParams.get("exchangeId");
  const sourcePage = searchParams.get("sourcePage");
  const userId = searchParams.get("userId");

  if (!exchangeId) {
    return NextResponse.json(
      { error: "exchangeId query parameter is required" },
      { status: 400 }
    );
  }

  const exchange = await db.exchange.findUnique({
    where: { id: exchangeId },
    select: { affiliateUrl: true },
  });

  if (!exchange || !exchange.affiliateUrl) {
    return NextResponse.json(
      { error: "Exchange not found or no affiliate URL" },
      { status: 404 }
    );
  }

  // Hash the IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

  // Log the click
  await db.affiliateClick.create({
    data: {
      exchangeId,
      sourcePage: sourcePage ?? null,
      userId: userId ?? null,
      ipHash,
    },
  });

  // Redirect to the affiliate URL
  return NextResponse.redirect(exchange.affiliateUrl, 307);
}
