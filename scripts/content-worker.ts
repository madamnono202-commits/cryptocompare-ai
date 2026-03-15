#!/usr/bin/env npx tsx
// ---------------------------------------------------------------------------
// Standalone BullMQ worker for the content engine
// ---------------------------------------------------------------------------
// Run with:  npx tsx scripts/content-worker.ts
//
// This process listens for jobs on the "content-engine" queue and runs the
// content generation pipeline for each one. It also registers the daily
// repeatable schedule.

import "dotenv/config";
import { startContentWorker, scheduleDaily } from "../src/lib/content-engine/queue";

async function main() {
  console.log("=== CryptoCompare AI – Content Engine Worker ===");
  console.log(`Redis URL: ${process.env.REDIS_URL ? "(set)" : "(not set)"}`);
  console.log(`Anthropic key: ${process.env.ANTHROPIC_API_KEY ? "(set)" : "(not set)"}`);
  console.log(`NewsAPI key: ${process.env.NEWSAPI_KEY ? "(set)" : "(not set)"}`);
  console.log(`HuggingFace key: ${process.env.HUGGINGFACE_API_KEY ? "(set)" : "(not set)"}`);

  // Start the worker
  startContentWorker();

  // Register the daily schedule (idempotent)
  try {
    await scheduleDaily();
    console.log("Daily schedule registered (06:00 UTC)");
  } catch (err) {
    console.warn("Could not register daily schedule:", err);
  }

  // Keep process alive
  console.log("Worker is running. Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("\nShutting down...");
    const { stopContentWorker } = await import("../src/lib/content-engine/queue");
    await stopContentWorker();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});
