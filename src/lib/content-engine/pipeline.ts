import { db } from "@/lib/db";
import { PipelineLogger } from "./logger";
import { fetchTrendingTopic } from "./fetch-topics";
import { generateArticle } from "./generate-article";
import { generateFeaturedImage } from "./generate-image";

// ---------------------------------------------------------------------------
// Content generation pipeline
// ---------------------------------------------------------------------------
// Orchestrates the full flow:
//   1. Fetch trending topic from NewsAPI
//   2. Generate article with Claude
//   3. Generate featured image with HuggingFace
//   4. Insert internal links (already handled by Claude prompt)
//   5. Save to BlogPost table
//   6. Track in AutomationJob table

export interface PipelineConfig {
  /** If true, mark the post as published immediately. Default: false (draft). */
  autoPublish?: boolean;
  /** Override topic instead of fetching from NewsAPI */
  topicOverride?: string;
}

export interface PipelineResult {
  success: boolean;
  jobId: string;
  blogPostId?: string;
  title?: string;
  slug?: string;
  error?: string;
  logs: string;
}

export async function runContentPipeline(
  config: PipelineConfig = {}
): Promise<PipelineResult> {
  const logger = new PipelineLogger();
  const autoPublish = config.autoPublish ?? false;

  // Create the automation job record
  const job = await db.automationJob.create({
    data: {
      jobType: "blog_generation",
      status: "running",
      startedAt: new Date(),
    },
  });

  logger.info(`Pipeline started (job ${job.id})`);
  logger.info(`Auto-publish: ${autoPublish}`);

  try {
    // ── Step 1: Fetch trending topic ──────────────────────────
    let topic: string;
    let sourceHeadlines: string[];

    if (config.topicOverride) {
      topic = config.topicOverride;
      sourceHeadlines = [`[Manual] ${topic}`];
      logger.info(`Using manual topic override: "${topic}"`);
    } else {
      const topicResult = await fetchTrendingTopic(logger);
      topic = topicResult.topic;
      sourceHeadlines = topicResult.sourceHeadlines;
    }

    // Update job with topic info
    await db.automationJob.update({
      where: { id: job.id },
      data: { topic, logs: logger.toString() },
    });

    // ── Step 2: Generate article with Claude ──────────────────
    const article = await generateArticle(topic, logger);

    // Check for duplicate slug
    const existing = await db.blogPost.findUnique({
      where: { slug: article.slug },
    });
    if (existing) {
      // Append timestamp to make slug unique
      article.slug = `${article.slug}-${Date.now()}`;
      logger.warn(`Slug conflict — using "${article.slug}" instead`);
    }

    // ── Step 3: Generate featured image ───────────────────────
    const featuredImage = await generateFeaturedImage(
      article.title,
      article.category,
      logger
    );

    // ── Step 4: Save to database ──────────────────────────────
    logger.info("Saving article to database...");

    const blogPost = await db.blogPost.create({
      data: {
        slug: article.slug,
        title: article.title,
        content: article.content,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        featuredImage: featuredImage,
        category: article.category,
        tags: article.tags,
        aiGenerated: true,
        publishedAt: autoPublish ? new Date() : null,
      },
    });

    logger.info(
      `Article saved: "${blogPost.title}" (id: ${blogPost.id}, published: ${autoPublish})`
    );

    // ── Step 5: Update automation job ─────────────────────────
    await db.automationJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        blogPostId: blogPost.id,
        resultSummary: `Generated "${blogPost.title}" (${article.category})`,
        logs: logger.toString(),
        metadata: JSON.stringify({
          sourceHeadlines,
          wordCount: article.content.length,
          category: article.category,
          tags: article.tags,
          autoPublished: autoPublish,
        }),
      },
    });

    logger.info("Pipeline completed successfully");

    return {
      success: true,
      jobId: job.id,
      blogPostId: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      logs: logger.toString(),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Pipeline failed: ${errorMessage}`);

    // Update job with error
    await db.automationJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorMessage: errorMessage,
        logs: logger.toString(),
      },
    });

    return {
      success: false,
      jobId: job.id,
      error: errorMessage,
      logs: logger.toString(),
    };
  }
}
