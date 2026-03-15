"use client";

import { useMemo, useState } from "react";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { getCategories, getAllTags } from "@/types/blog";

interface BlogPostData {
  slug: string;
  title: string;
  content: string | null;
  category: string | null;
  tags: string[];
  featuredImage: string | null;
  publishedAt: Date | null;
}

interface BlogGridProps {
  posts: BlogPostData[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => getCategories(posts), [posts]);
  const tags = useMemo(() => getAllTags(posts), [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (activeTag) {
      result = result.filter((p) => p.tags.includes(activeTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [posts, activeCategory, activeTag, searchQuery]);

  return (
    <>
      <BlogFilters
        categories={categories}
        tags={tags}
        activeCategory={activeCategory}
        activeTag={activeTag}
        onCategoryChange={setActiveCategory}
        onTagChange={setActiveTag}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {filteredPosts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogPostCard key={post.slug} {...post} />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground">
            No articles found matching your filters.
          </p>
          <button
            onClick={() => {
              setActiveCategory(null);
              setActiveTag(null);
              setSearchQuery("");
            }}
            className="mt-2 text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </>
  );
}
