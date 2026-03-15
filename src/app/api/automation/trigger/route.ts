import { NextRequest, NextResponse } from "next/server";
import { runContentPipeline } from "@/lib/content-engine/pipeline";

// ---------------------------------------------------------------------------
// POST /api/automation/trigger
// ---------------------------------------------------------------------------
// Triggers the content generation pipeline directly (without BullMQ).
// This is useful for manual triggers from the admin panel or external cron
// services when Redis/BullMQ is not available.
//
// Body (optional):
//   { "autoPublish": boolean, "topicOverride": string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const autoPublish =
      typeof body.autoPublish === "boolean" ? body.autoPublish : false;
    const topicOverride =
      typeof body.topicOverride === "string" && body.topicOverride.trim()
        ? body.topicOverride.trim()
        : undefined;

    const result = await runContentPipeline({ autoPublish, topicOverride });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
