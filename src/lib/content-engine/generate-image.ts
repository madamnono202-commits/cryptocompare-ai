import { PipelineLogger } from "./logger";

// ---------------------------------------------------------------------------
// Generate a featured image using Stable Diffusion via HuggingFace API
// ---------------------------------------------------------------------------

/**
 * Generates a featured image for a blog post using the HuggingFace
 * Inference API with a Stable Diffusion model.
 *
 * Returns a data URI (base64-encoded) or a hosted URL depending on
 * configuration. If the API is unavailable, returns a fallback Unsplash URL.
 */
export async function generateFeaturedImage(
  title: string,
  category: string,
  logger: PipelineLogger
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    logger.warn("HUGGINGFACE_API_KEY not set — using Unsplash fallback image");
    return getFallbackImage(title, category);
  }

  try {
    logger.info("Generating featured image via HuggingFace Stable Diffusion...");

    const prompt = buildImagePrompt(title, category);
    logger.info(`Image prompt: "${prompt}"`);

    const res = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width: 1200,
            height: 630,
            num_inference_steps: 30,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "unknown error");
      logger.warn(
        `HuggingFace API returned ${res.status}: ${errorText} — using fallback`
      );
      return getFallbackImage(title, category);
    }

    // The API returns raw image bytes
    const imageBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

    logger.info(
      `Generated image (${Math.round(imageBuffer.byteLength / 1024)} KB)`
    );

    return dataUri;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Image generation failed: ${message}`);
    return getFallbackImage(title, category);
  }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildImagePrompt(title: string, category: string): string {
  const categoryHints: Record<string, string> = {
    guides: "professional infographic style, charts and data visualization",
    education: "educational illustration, clean and modern",
    security: "cybersecurity concept, locks and shields, dark theme",
    news: "newspaper style, modern digital media",
    analysis: "financial charts, data analysis, professional",
  };

  const hint = categoryHints[category] || "modern digital finance";

  return `A professional blog header image for a cryptocurrency article titled "${title}". Style: ${hint}. Clean, modern, high quality, 16:9 aspect ratio, no text overlay.`;
}

// ---------------------------------------------------------------------------
// Fallback images from Unsplash
// ---------------------------------------------------------------------------

const FALLBACK_IMAGES: Record<string, string[]> = {
  guides: [
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&h=630&fit=crop",
  ],
  education: [
    "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=1200&h=630&fit=crop",
  ],
  security: [
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=630&fit=crop",
  ],
  news: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=630&fit=crop",
  ],
  analysis: [
    "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&h=630&fit=crop",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop",
  ],
};

function getFallbackImage(title: string, category: string): string {
  const images = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.news;
  // Use title hash to pick a deterministic but varied image
  const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return images[hash % images.length];
}
