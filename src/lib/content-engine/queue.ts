import { Queue, Worker, Job } from "bullmq";
import { runContentPipeline, PipelineConfig } from "./pipeline";

// ---------------------------------------------------------------------------
// BullMQ queue for content generation jobs
// ---------------------------------------------------------------------------

const QUEUE_NAME = "content-engine";
const MAX_RETRIES = 3;

/** Parse REDIS_URL into host/port/password for BullMQ connection config */
function parseRedisUrl(): { host: string; port: number; password?: string } {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL environment variable is required for BullMQ.");
  }
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "localhost",
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
  };
}

// ---------------------------------------------------------------------------
// Queue (used by API routes to enqueue jobs)
// ---------------------------------------------------------------------------

let _queue: Queue | undefined;

export function getContentQueue(): Queue {
  if (!_queue) {
    _queue = new Queue(QUEUE_NAME, {
      connection: parseRedisUrl(),
      defaultJobOptions: {
        attempts: MAX_RETRIES,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 100 },
      },
    });
  }
  return _queue;
}

/**
 * Enqueue a content generation job.
 */
export async function enqueueContentJob(
  config: PipelineConfig = {}
): Promise<string> {
  const queue = getContentQueue();
  const job = await queue.add("generate-article", config, {
    jobId: `content-${Date.now()}`,
  });
  return job.id ?? "unknown";
}

/**
 * Add a repeatable job that runs once per day at 06:00 UTC.
 */
export async function scheduleDaily(): Promise<void> {
  const queue = getContentQueue();
  await queue.add(
    "generate-article",
    { autoPublish: false } satisfies PipelineConfig,
    {
      repeat: { pattern: "0 6 * * *" }, // every day at 06:00 UTC
      jobId: "daily-content-generation",
    }
  );
}

// ---------------------------------------------------------------------------
// Worker (processes jobs from the queue)
// ---------------------------------------------------------------------------

let _worker: Worker | undefined;

export function startContentWorker(): Worker {
  if (_worker) return _worker;

  _worker = new Worker(
    QUEUE_NAME,
    async (job: Job<PipelineConfig>) => {
      console.log(`[ContentWorker] Processing job ${job.id} (attempt ${job.attemptsMade + 1}/${MAX_RETRIES})`);

      const result = await runContentPipeline(job.data);

      if (!result.success) {
        throw new Error(result.error || "Pipeline failed");
      }

      return result;
    },
    {
      connection: parseRedisUrl(),
      concurrency: 1, // only process one article at a time
    }
  );

  _worker.on("completed", (job) => {
    console.log(`[ContentWorker] Job ${job.id} completed successfully`);
  });

  _worker.on("failed", (job, err) => {
    console.error(`[ContentWorker] Job ${job?.id} failed: ${err.message}`);
  });

  _worker.on("error", (err) => {
    console.error(`[ContentWorker] Worker error: ${err.message}`);
  });

  console.log("[ContentWorker] Worker started, listening for jobs...");
  return _worker;
}

export async function stopContentWorker(): Promise<void> {
  if (_worker) {
    await _worker.close();
    _worker = undefined;
    console.log("[ContentWorker] Worker stopped");
  }
}
