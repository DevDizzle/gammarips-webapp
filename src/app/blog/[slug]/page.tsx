import { getBlogPostAdmin } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OG_IMAGE } from '@/lib/constants';

// ISR: serve published posts and pick up edits without a redeploy.
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostAdmin(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return {
    // Root layout applies the `%s | GammaRips` title template — do NOT add the
    // suffix here or it doubles ("… | GammaRips | GammaRips").
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://gammarips.com/blog/${post.slug}` },
    openGraph: {
      images: [OG_IMAGE],
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      url: `https://gammarips.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostAdmin(slug);
  if (!post) return notFound();

  const publishedISO = post.publishedAt || new Date().toISOString();
  const wordCount = post.markdown ? post.markdown.trim().split(/\s+/).length : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": "https://gammarips.com/og-image.png?v=3",
    "datePublished": publishedISO,
    "dateModified": publishedISO,
    "description": post.description,
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" },
    },
    ...(post.keywords?.length ? { "keywords": post.keywords.join(", ") } : {}),
    // ISO 8601 duration (PT#M) — engine supplies readingTimeMin on blog_posts/{slug}.
    ...(post.readingTimeMin > 0 ? { "timeRequired": `PT${post.readingTimeMin}M` } : {}),
    ...(wordCount ? { "wordCount": wordCount } : {}),
    "mainEntityOfPage": `https://gammarips.com/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://gammarips.com/blog" },
      { "@type": "ListItem", "position": 2, "name": post.title, "item": `https://gammarips.com/blog/${post.slug}` },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* JSON-LD BreadcrumbList already emitted above (breadcrumbSchema), so
          render the visible trail only to avoid duplicate structured data. */}
      <Breadcrumbs
        className="mb-6"
        emitJsonLd={false}
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title },
        ]}
      />

      {(post.publishedAt || post.readingTimeMin > 0) && (
        <div className="mb-6 text-sm text-muted-foreground flex items-center gap-3">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          )}
          {post.readingTimeMin > 0 && <span>· {post.readingTimeMin} min read</span>}
        </div>
      )}

      <article className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.markdown}</ReactMarkdown>
      </article>

      {/* Close the explainer↔example topic cluster: funnel readers to the live
          signals surface and back to the rest of the blog. */}
      <aside className="mt-12 border-t pt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold font-headline text-lg">See the methodology live</p>
          <p className="text-sm text-muted-foreground mt-1">
            Today&apos;s institutional options flow, scored and ranked by the engine.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <Link href="/signals" className="text-sm text-primary hover:underline">
            Explore today&apos;s signals →
          </Link>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
            More posts
          </Link>
        </div>
      </aside>
    </div>
  );
}
