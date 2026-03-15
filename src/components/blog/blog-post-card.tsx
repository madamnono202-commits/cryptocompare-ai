import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, generateExcerpt, parseBlogContent } from "@/types/blog";

interface BlogPostCardProps {
  slug: string;
  title: string;
  content: string | null;
  category: string | null;
  tags: string[];
  featuredImage: string | null;
  publishedAt: Date | null;
}

export function BlogPostCard({
  slug,
  title,
  content,
  category,
  tags,
  featuredImage,
  publishedAt,
}: BlogPostCardProps) {
  const sections = parseBlogContent(content);
  const excerpt = generateExcerpt(sections, 150);

  return (
    <Link href={`/blog/${slug}`} className="group">
      <Card className="flex h-full flex-col overflow-hidden transition-transform group-hover:scale-[1.02]">
        {/* Featured image */}
        {featuredImage && (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        <CardHeader className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {category && (
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {category}
              </span>
            )}
            {publishedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(publishedAt)}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {excerpt}
            </p>
          )}
        </CardHeader>

        <CardContent>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
