import Link from "next/link";
import type { BlogPost } from "@/lib/firebase-admin";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Server-rendered list of blog post teaser cards. Used to cross-link the
 * (previously orphaned) /blog section from high-equity pages — homepage and
 * signal detail pages — so crawlers discover posts and link-equity flows to
 * them. Each card uses the post title as the internal anchor for relevance.
 */
export function BlogTeaserList({
  posts,
  heading,
  subheading,
  limit = 3,
}: {
  posts: BlogPost[];
  heading: string;
  subheading?: string;
  limit?: number;
}) {
  const shown = posts.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="blog-teaser-heading">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="blog-teaser-heading" className="text-2xl font-bold font-headline">
            {heading}
          </h2>
          {subheading && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subheading}</p>
          )}
        </div>
        <Link href="/blog" className="text-sm text-primary hover:underline shrink-0">
          View all →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((post) => (
          <article
            key={post.slug}
            className="border border-muted rounded-lg p-5 hover:bg-muted/30 transition-colors flex flex-col"
          >
            <Link href={`/blog/${post.slug}`} className="group">
              <h3 className="text-lg font-semibold font-headline group-hover:underline underline-offset-4 leading-snug">
                {post.title}
              </h3>
            </Link>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
              {post.readingTimeMin > 0 && <span>· {post.readingTimeMin} min read</span>}
            </div>
            {post.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {post.description}
              </p>
            )}
            <Link
              href={`/blog/${post.slug}`}
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
