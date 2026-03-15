// ---------------------------------------------------------------------------
// Blog content section types
// ---------------------------------------------------------------------------
// Content is stored as a JSON array of sections in the database.
// Each section has a discriminated "type" field.

export type BlogHeading = {
  type: "heading";
  level: 2 | 3;
  id: string;
  text: string;
};

export type BlogParagraph = {
  type: "paragraph";
  text: string;
};

export type BlogList = {
  type: "list";
  items: string[];
};

export type BlogAffiliateCta = {
  type: "affiliate_cta";
  exchangeSlug: string;
  heading: string;
  text: string;
  ctaLabel: string;
};

export type BlogInternalLink = {
  type: "internal_link";
  href: string;
  text: string;
};

export type BlogSection =
  | BlogHeading
  | BlogParagraph
  | BlogList
  | BlogAffiliateCta
  | BlogInternalLink;

// ---------------------------------------------------------------------------
// Table-of-contents entry (derived from headings)
// ---------------------------------------------------------------------------

export type TocEntry = {
  id: string;
  text: string;
  level: 2 | 3;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse the JSON content string into typed sections. */
export function parseBlogContent(raw: string | null): BlogSection[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as BlogSection[];
  } catch {
    return [];
  }
}

/** Extract a table of contents from the sections. */
export function extractToc(sections: BlogSection[]): TocEntry[] {
  return sections
    .filter((s): s is BlogHeading => s.type === "heading")
    .map((h) => ({ id: h.id, text: h.text, level: h.level }));
}

/** Generate a plain-text excerpt from the first paragraph. */
export function generateExcerpt(
  sections: BlogSection[],
  maxLength = 160
): string {
  const firstParagraph = sections.find(
    (s): s is BlogParagraph => s.type === "paragraph"
  );
  if (!firstParagraph) return "";
  if (firstParagraph.text.length <= maxLength) return firstParagraph.text;
  return firstParagraph.text.slice(0, maxLength).trimEnd() + "\u2026";
}

/** Format a date to a readable string. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Get unique categories from posts. */
export function getCategories(
  posts: Array<{ category: string | null }>
): string[] {
  const cats = new Set<string>();
  for (const p of posts) {
    if (p.category) cats.add(p.category);
  }
  return Array.from(cats).sort();
}

/** Get unique tags from posts. */
export function getAllTags(posts: Array<{ tags: string[] }>): string[] {
  const tagSet = new Set<string>();
  for (const p of posts) {
    for (const t of p.tags) {
      tagSet.add(t);
    }
  }
  return Array.from(tagSet).sort();
}
