import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/automation/trigger-queue
// ---------------------------------------------------------------------------
// Enqueues a content generation job via BullMQ (requires Redis).
// Falls back to direct execution if Redis is not configured.
//
// Body (optional):
//   { "autoPublish": boolean, "topicOverride": string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const config = {
      autoPublish:
        typeof body.autoPublish === "boolean" ? body.autoPublish : false,
      topicOverride:
        typeof body.topicOverride === "string" && body.topicOverride.trim()
          ? body.topicOverride.trim()
          : undefined,
    };

    // Try BullMQ if REDIS_URL is available
    if (process.env.REDIS_URL) {
      const { enqueueContentJob } = await import(
        "@/lib/content-engine/queue"
      );
      const jobId = await enqueueContentJob(config);
      return NextResponse.json({
        success: true,
        queued: true,
        jobId,
        message: "Job enqueued. A worker will process it shortly.",
      });
    }

    // Fallback: run directly
    const { runContentPipeline } = await import(
      "@/lib/content-engine/pipeline"
    );
    const result = await runContentPipeline(config);
    return NextResponse.json(
      { ...result, queued: false },
      { status: result.success ? 200 : 500 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
