// ---------------------------------------------------------------------------
// Content Engine – public API
// ---------------------------------------------------------------------------

export { runContentPipeline } from "./pipeline";
export type { PipelineConfig, PipelineResult } from "./pipeline";
export { PipelineLogger } from "./logger";
export { fetchTrendingTopic } from "./fetch-topics";
export { generateArticle, EXAMPLE_PROMPTS } from "./generate-article";
export { generateFeaturedImage } from "./generate-image";
export {
  getContentQueue,
  enqueueContentJob,
  scheduleDaily,
  startContentWorker,
  stopContentWorker,
} from "./queue";
