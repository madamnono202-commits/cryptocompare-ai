import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/automation/jobs
// ---------------------------------------------------------------------------
// Returns recent automation jobs with optional filtering.
//
// Query params:
//   ?limit=20        (default 20, max 100)
//   ?status=completed (optional filter)
//   ?jobType=blog_generation (optional filter)

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const status = url.searchParams.get("status");
    const jobType = url.searchParams.get("jobType");

    const limit = Math.min(
      Math.max(parseInt(limitParam || "20", 10) || 20, 1),
      100
    );

    const jobs = await db.automationJob.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(jobType ? { jobType } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Summary stats
    const [totalJobs, completedJobs, failedJobs, runningJobs] =
      await Promise.all([
        db.automationJob.count(),
        db.automationJob.count({ where: { status: "completed" } }),
        db.automationJob.count({ where: { status: "failed" } }),
        db.automationJob.count({ where: { status: "running" } }),
      ]);

    return NextResponse.json({
      jobs,
      stats: {
        total: totalJobs,
        completed: completedJobs,
        failed: failedJobs,
        running: runningJobs,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
